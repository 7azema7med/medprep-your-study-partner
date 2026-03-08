import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Settings, Save, RefreshCw, Shield, Globe, Palette, Zap } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { adminApi } from "@/lib/admin-api";
import { toast } from "sonner";

export default function SiteSettings() {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchSettings = async () => {
    setLoading(true);
    const { data } = await supabase.from("site_settings").select("*");
    const map: Record<string, string> = {};
    data?.forEach(s => { map[s.key] = s.value || ""; });
    setSettings(map);
    setLoading(false);
  };

  useEffect(() => { fetchSettings(); }, []);

  const updateSetting = (key: string, value: string) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await adminApi.updateSettings(settings);
      toast.success("Settings saved");
    } catch (e: any) { toast.error(e.message); }
    setSaving(false);
  };

  if (loading) return <div className="p-8 text-center text-muted-foreground">Loading settings...</div>;

  const boolSettings = ["enable_registration", "require_activation_code", "maintenance_mode", "enable_notes", "enable_flashcards", "enable_feedback", "enable_calculator", "enable_lab_values", "enable_dark_mode"];

  const categories: Record<string, { icon: any; keys: string[] }> = {
    General: { icon: Globe, keys: [] },
    Features: { icon: Zap, keys: [] },
    Security: { icon: Shield, keys: [] },
    Branding: { icon: Palette, keys: [] },
  };

  Object.keys(settings).forEach(key => {
    if (key.includes("enable_") || key.includes("require_")) categories.Features.keys.push(key);
    else if (key.includes("max_") || key.includes("lockout_") || key.includes("session_")) categories.Security.keys.push(key);
    else if (key.includes("maintenance") || key.includes("logo") || key.includes("favicon") || key.includes("theme")) categories.Branding.keys.push(key);
    else categories.General.keys.push(key);
  });

  // Remove empty categories
  Object.keys(categories).forEach(k => { if (categories[k].keys.length === 0) delete categories[k]; });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Settings className="h-6 w-6 text-primary" />
          <div>
            <h1 className="text-2xl font-bold text-foreground">Site Settings</h1>
            <p className="text-sm text-muted-foreground">Configure platform behavior and features</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={fetchSettings}><RefreshCw className="mr-1 h-3.5 w-3.5" />Reset</Button>
          <Button size="sm" onClick={handleSave} disabled={saving}>
            <Save className="mr-1 h-3.5 w-3.5" />{saving ? "Saving..." : "Save All"}
          </Button>
        </div>
      </div>

      <Tabs defaultValue={Object.keys(categories)[0]}>
        <TabsList>
          {Object.entries(categories).map(([cat, { icon: Icon }]) => (
            <TabsTrigger key={cat} value={cat} className="gap-1.5">
              <Icon className="h-3.5 w-3.5" />{cat}
            </TabsTrigger>
          ))}
        </TabsList>

        {Object.entries(categories).map(([cat, { keys }]) => (
          <TabsContent key={cat} value={cat} className="mt-4">
            <Card>
              <CardContent className="p-6 space-y-5">
                {keys.map(key => {
                  const isBool = boolSettings.includes(key);
                  return (
                    <div key={key} className="flex items-center justify-between py-1">
                      <div>
                        <Label className="text-sm font-medium capitalize">{key.replace(/_/g, " ")}</Label>
                        <p className="text-xs text-muted-foreground mt-0.5">{getSettingDescription(key)}</p>
                      </div>
                      {isBool ? (
                        <Switch checked={settings[key] === "true"} onCheckedChange={v => updateSetting(key, v ? "true" : "false")} />
                      ) : (
                        <Input className="max-w-xs" value={settings[key]} onChange={e => updateSetting(key, e.target.value)} />
                      )}
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}

function getSettingDescription(key: string): string {
  const descriptions: Record<string, string> = {
    site_name: "Public-facing name of the platform",
    support_email: "Email address for user support requests",
    enable_registration: "Allow new users to create accounts",
    require_activation_code: "Require an activation code during registration",
    maintenance_mode: "Show maintenance page to non-admin users",
    enable_notes: "Enable the notes/study materials feature",
    enable_flashcards: "Enable the flashcard study tool",
    enable_feedback: "Allow users to submit question feedback",
    enable_calculator: "Show calculator in exam interface",
    enable_lab_values: "Show lab values reference in exam interface",
    enable_dark_mode: "Allow users to switch to dark mode",
    max_login_attempts: "Lock account after this many failed login attempts",
    lockout_duration: "Minutes to lock account after max failed attempts",
    session_timeout: "Session timeout duration in minutes",
    default_exam_mode: "Default exam mode (timed or tutor)",
    default_timezone: "Default timezone for dates and times",
  };
  return descriptions[key] || "";
}
