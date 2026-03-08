import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Settings, Save } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export default function SiteSettings() {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

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
    const promises = Object.entries(settings).map(([key, value]) =>
      supabase.from("site_settings").update({ value, updated_at: new Date().toISOString() }).eq("key", key)
    );
    await Promise.all(promises);
    toast.success("Settings saved");
  };

  if (loading) return <div className="p-8 text-center text-muted-foreground">Loading...</div>;

  const boolSettings = ["enable_registration", "require_activation_code", "maintenance_mode", "enable_notes", "enable_flashcards", "enable_feedback", "enable_calculator", "enable_lab_values"];

  const grouped: Record<string, string[]> = {};
  Object.keys(settings).forEach(key => {
    const cat = key.includes("enable_") || key.includes("require_") ? "Features" :
      key.includes("max_") || key.includes("lockout_") || key.includes("session_") ? "Security" :
      key.includes("maintenance") ? "System" : "General";
    (grouped[cat] = grouped[cat] || []).push(key);
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Settings className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold text-foreground">Site Settings</h1>
        </div>
        <Button size="sm" onClick={handleSave}><Save className="mr-1 h-3.5 w-3.5" />Save All</Button>
      </div>

      {Object.entries(grouped).map(([category, keys]) => (
        <Card key={category}>
          <CardHeader><CardTitle className="text-base">{category}</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {keys.map(key => {
              const isBool = boolSettings.includes(key);
              return (
                <div key={key} className="flex items-center justify-between">
                  <Label className="text-sm capitalize">{key.replace(/_/g, " ")}</Label>
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
      ))}
    </div>
  );
}
