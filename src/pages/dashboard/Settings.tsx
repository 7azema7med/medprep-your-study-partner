import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  User, Mail, Phone, Globe, Key, Shield, Loader2, Palette, Type, Clock, Zap,
  Layout, AlignLeft, AlignCenter, AlignRight, Image as ImageIcon, Moon, Sun,
  CheckSquare, Highlighter, Eye, BookmarkPlus, FileText, Sparkles
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type SettingsCategory = "profile" | "appearance" | "night-mode" | "features" | "security";

interface UserSettings {
  font_size: string;
  font_weight: string;
  color_theme: string;
  split_view: boolean;
  show_timer: boolean;
  pause_timer_on_blur: boolean;
  exhibit_style: string;
  line_width: number;
  text_alignment: string;
  image_alignment: string;
  sidebar_behavior: string;
  content_padding: number;
  night_mode_auto: boolean;
  night_mode_start: string;
  night_mode_end: string;
  confirm_answer_omission: boolean;
  highlight_color: string;
  multicolor_highlighting: boolean;
  highlight_palette: string[];
  hide_answered_correct_percent: boolean;
  auto_add_flashcard: boolean;
  auto_add_notebook: boolean;
  auto_add_annotation: boolean;
  smart_context_menu: boolean;
}

const defaultSettings: UserSettings = {
  font_size: "medium",
  font_weight: "normal",
  color_theme: "system",
  split_view: false,
  show_timer: true,
  pause_timer_on_blur: false,
  exhibit_style: "button",
  line_width: 720,
  text_alignment: "left",
  image_alignment: "center",
  sidebar_behavior: "always_visible",
  content_padding: 24,
  night_mode_auto: false,
  night_mode_start: "18:00",
  night_mode_end: "06:00",
  confirm_answer_omission: true,
  highlight_color: "yellow",
  multicolor_highlighting: false,
  highlight_palette: ["yellow"],
  hide_answered_correct_percent: false,
  auto_add_flashcard: false,
  auto_add_notebook: false,
  auto_add_annotation: false,
  smart_context_menu: true,
};

const highlightColors = [
  { value: "yellow", label: "Yellow", class: "bg-yellow-300" },
  { value: "green", label: "Green", class: "bg-green-300" },
  { value: "blue", label: "Blue", class: "bg-blue-300" },
  { value: "pink", label: "Pink", class: "bg-pink-300" },
  { value: "orange", label: "Orange", class: "bg-orange-300" },
];

export default function Settings() {
  const { user } = useAuth();
  const { theme: currentTheme, setTheme } = useTheme();
  const [loading, setLoading] = useState(false);
  const [profileLoading, setProfileLoading] = useState(true);
  const [settingsLoading, setSettingsLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<SettingsCategory>("profile");

  // Profile state
  const [profile, setProfile] = useState({ username: "", phone: "", country: "", activation_code: "" });
  const [passwords, setPasswords] = useState({ current: "", new_password: "", confirm: "" });

  // Settings state
  const [settings, setSettings] = useState<UserSettings>(defaultSettings);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  useEffect(() => {
    if (!user) return;
    async function fetchProfile() {
      const { data } = await supabase.from("profiles").select("*").eq("user_id", user!.id).single();
      if (data) {
        setProfile({
          username: data.username || "",
          phone: data.phone || "",
          country: data.country || "",
          activation_code: data.activation_code || "",
        });
      }
      setProfileLoading(false);
    }
    async function fetchSettings() {
      const { data } = await supabase.from("user_settings").select("*").eq("user_id", user!.id).single();
      if (data) {
        setSettings({
          font_size: data.font_size,
          font_weight: data.font_weight,
          color_theme: data.color_theme,
          split_view: data.split_view,
          show_timer: data.show_timer,
          pause_timer_on_blur: data.pause_timer_on_blur,
          exhibit_style: data.exhibit_style,
          line_width: data.line_width,
          text_alignment: data.text_alignment,
          image_alignment: data.image_alignment,
          sidebar_behavior: data.sidebar_behavior,
          content_padding: data.content_padding,
          night_mode_auto: data.night_mode_auto,
          night_mode_start: data.night_mode_start,
          night_mode_end: data.night_mode_end,
          confirm_answer_omission: data.confirm_answer_omission,
          highlight_color: data.highlight_color,
          multicolor_highlighting: data.multicolor_highlighting,
          highlight_palette: data.highlight_palette,
          hide_answered_correct_percent: data.hide_answered_correct_percent,
          auto_add_flashcard: data.auto_add_flashcard,
          auto_add_notebook: data.auto_add_notebook,
          auto_add_annotation: data.auto_add_annotation,
          smart_context_menu: data.smart_context_menu,
        });
      }
      setSettingsLoading(false);
    }
    fetchProfile();
    fetchSettings();
  }, [user]);

  const updateProfile = async () => {
    if (!user) return;
    setLoading(true);
    const { error } = await supabase
      .from("profiles")
      .update({ username: profile.username, phone: profile.phone, country: profile.country })
      .eq("user_id", user.id);
    setLoading(false);
    if (error) toast.error("Failed to update profile");
    else toast.success("Profile updated successfully");
  };

  const changePassword = async () => {
    if (passwords.new_password !== passwords.confirm) {
      toast.error("Passwords do not match");
      return;
    }
    if (passwords.new_password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password: passwords.new_password });
    setLoading(false);
    if (error) toast.error(error.message);
    else {
      toast.success("Password changed successfully");
      setPasswords({ current: "", new_password: "", confirm: "" });
    }
  };

  const saveSettings = async () => {
    if (!user) return;
    setLoading(true);
    const { data: existing } = await supabase.from("user_settings").select("id").eq("user_id", user.id).single();

    let error;
    if (existing) {
      ({ error } = await supabase.from("user_settings").update(settings).eq("user_id", user.id));
    } else {
      ({ error } = await supabase.from("user_settings").insert({ user_id: user.id, ...settings }));
    }

    setLoading(false);
    if (error) toast.error("Failed to save settings");
    else {
      toast.success("Settings saved successfully");
      setHasUnsavedChanges(false);
    }
  };

  const updateSetting = <K extends keyof UserSettings>(key: K, value: UserSettings[K]) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
    setHasUnsavedChanges(true);
  };

  const resetSettings = () => {
    setSettings(defaultSettings);
    setHasUnsavedChanges(true);
    toast.info("Settings reset to defaults");
  };

  const categories = [
    { id: "profile" as const, label: "Profile", icon: User },
    { id: "appearance" as const, label: "Appearance", icon: Palette },
    { id: "night-mode" as const, label: "Night Mode", icon: Moon },
    { id: "features" as const, label: "Features", icon: Sparkles },
    { id: "security" as const, label: "Security", icon: Shield },
  ];

  if (profileLoading || settingsLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-180px)] gap-6">
      {/* Sidebar Navigation */}
      <aside className="w-56 flex-shrink-0">
        <Card className="sticky top-0 p-2">
          <nav className="space-y-1">
            {categories.map((cat) => {
              const Icon = cat.icon;
              const isActive = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-md transition-all ${
                    isActive
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </nav>
        </Card>
      </aside>

      {/* Content Panel */}
      <div className="flex-1 overflow-y-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeCategory}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
            className="space-y-6"
          >
            {activeCategory === "profile" && (
              <>
                <div>
                  <h2 className="text-xl font-bold text-foreground">Profile Information</h2>
                  <p className="text-sm text-muted-foreground mt-1">Manage your account details</p>
                </div>

                <Card className="p-6 space-y-5">
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Email</p>
                      <p className="text-sm font-medium">{user?.email}</p>
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <Label className="text-xs">Username</Label>
                      <Input value={profile.username} onChange={(e) => setProfile({ ...profile, username: e.target.value })} />
                    </div>
                    <div>
                      <Label className="text-xs">Phone</Label>
                      <Input value={profile.phone} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} placeholder="+1234567890" />
                    </div>
                    <div>
                      <Label className="text-xs">Country</Label>
                      <Input value={profile.country} onChange={(e) => setProfile({ ...profile, country: e.target.value })} />
                    </div>
                    <div>
                      <Label className="text-xs">Activation Code</Label>
                      <Input value={profile.activation_code} disabled className="bg-muted/30" />
                    </div>
                  </div>

                  <Button onClick={updateProfile} disabled={loading} size="sm">
                    {loading ? <Loader2 className="mr-1 h-4 w-4 animate-spin" /> : null}
                    Save Changes
                  </Button>
                </Card>

                <Card className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <Shield className="h-4 w-4" />
                    <div>
                      <h3 className="text-sm font-semibold">Subscription Status</h3>
                      <p className="text-xs text-muted-foreground">Your account plan details</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge className="bg-primary">Active</Badge>
                    <span className="text-sm text-muted-foreground">Premium Plan</span>
                  </div>
                </Card>
              </>
            )}

            {activeCategory === "appearance" && (
              <>
                <div>
                  <h2 className="text-xl font-bold text-foreground">Appearance</h2>
                  <p className="text-sm text-muted-foreground mt-1">Customize your exam interface</p>
                </div>

                <Card className="divide-y divide-border">
                  {/* Font Size */}
                  <div className="p-5 space-y-3">
                    <div className="flex items-center gap-2">
                      <Type className="h-4 w-4 text-primary" />
                      <Label className="text-sm font-semibold">Font Size</Label>
                    </div>
                    <div className="flex gap-2">
                      {["small", "medium", "large"].map((size) => (
                        <Button
                          key={size}
                          variant={settings.font_size === size ? "default" : "outline"}
                          size="sm"
                          onClick={() => updateSetting("font_size", size)}
                          className="capitalize"
                        >
                          {size}
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Font Weight */}
                  <div className="p-5 space-y-3">
                    <Label className="text-sm font-semibold">Font Weight</Label>
                    <div className="flex gap-2">
                      {["normal", "bold"].map((weight) => (
                        <Button
                          key={weight}
                          variant={settings.font_weight === weight ? "default" : "outline"}
                          size="sm"
                          onClick={() => updateSetting("font_weight", weight)}
                          className="capitalize"
                        >
                          {weight}
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Color Theme */}
                  <div className="p-5 space-y-3">
                    <div className="flex items-center gap-2">
                      <Palette className="h-4 w-4 text-primary" />
                      <Label className="text-sm font-semibold">Color Theme</Label>
                    </div>
                    <Select value={settings.color_theme} onValueChange={(v) => { updateSetting("color_theme", v); setTheme(v as any); }}>
                      <SelectTrigger className="w-48">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="light">Light</SelectItem>
                        <SelectItem value="dark">Dark</SelectItem>
                        <SelectItem value="system">System</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Split Screen */}
                  <div className="p-5 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Layout className="h-4 w-4 text-primary" />
                      <div>
                        <Label className="text-sm font-semibold">Split Screen Explanations</Label>
                        <p className="text-xs text-muted-foreground">Show explanations side-by-side</p>
                      </div>
                    </div>
                    <Switch checked={settings.split_view} onCheckedChange={(v) => updateSetting("split_view", v)} />
                  </div>

                  {/* Show Timer */}
                  <div className="p-5 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-primary" />
                      <Label className="text-sm font-semibold">Show Timer</Label>
                    </div>
                    <Switch checked={settings.show_timer} onCheckedChange={(v) => updateSetting("show_timer", v)} />
                  </div>

                  {/* Pause Timer */}
                  <div className="p-5 flex items-center justify-between">
                    <div>
                      <Label className="text-sm font-semibold">Pause Timer on Blur</Label>
                      <p className="text-xs text-muted-foreground">Stop timer when window is inactive</p>
                    </div>
                    <Switch checked={settings.pause_timer_on_blur} onCheckedChange={(v) => updateSetting("pause_timer_on_blur", v)} />
                  </div>

                  {/* Line Width */}
                  <div className="p-5 space-y-3">
                    <Label className="text-sm font-semibold">Line Width: {settings.line_width}px</Label>
                    <div className="flex items-center gap-4">
                      <Slider
                        value={[settings.line_width]}
                        onValueChange={([v]) => updateSetting("line_width", v)}
                        min={500}
                        max={1200}
                        step={20}
                        className="flex-1"
                      />
                      <Button variant="ghost" size="sm" onClick={() => updateSetting("line_width", 720)}>
                        Reset
                      </Button>
                    </div>
                  </div>

                  {/* Text Alignment */}
                  <div className="p-5 space-y-3">
                    <Label className="text-sm font-semibold">Text Alignment</Label>
                    <div className="flex gap-2">
                      {[
                        { value: "left", icon: AlignLeft },
                        { value: "center", icon: AlignCenter },
                        { value: "right", icon: AlignRight },
                      ].map(({ value, icon: Icon }) => (
                        <Button
                          key={value}
                          variant={settings.text_alignment === value ? "default" : "outline"}
                          size="sm"
                          onClick={() => updateSetting("text_alignment", value)}
                        >
                          <Icon className="h-4 w-4" />
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Image Alignment */}
                  <div className="p-5 space-y-3">
                    <div className="flex items-center gap-2">
                      <ImageIcon className="h-4 w-4 text-primary" />
                      <Label className="text-sm font-semibold">Image Alignment</Label>
                    </div>
                    <div className="flex gap-2">
                      {["left", "center", "right"].map((align) => (
                        <Button
                          key={align}
                          variant={settings.image_alignment === align ? "default" : "outline"}
                          size="sm"
                          onClick={() => updateSetting("image_alignment", align)}
                          className="capitalize"
                        >
                          {align}
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Content Padding */}
                  <div className="p-5 space-y-3">
                    <Label className="text-sm font-semibold">Content Padding: {settings.content_padding}px</Label>
                    <div className="flex items-center gap-4">
                      <Slider
                        value={[settings.content_padding]}
                        onValueChange={([v]) => updateSetting("content_padding", v)}
                        min={12}
                        max={48}
                        step={4}
                        className="flex-1"
                      />
                      <Button variant="ghost" size="sm" onClick={() => updateSetting("content_padding", 24)}>
                        Reset
                      </Button>
                    </div>
                  </div>
                </Card>
              </>
            )}

            {activeCategory === "night-mode" && (
              <>
                <div>
                  <h2 className="text-xl font-bold text-foreground">Night Mode</h2>
                  <p className="text-sm text-muted-foreground mt-1">Automatic dark mode scheduling</p>
                </div>

                <Card className="divide-y divide-border">
                  <div className="p-5 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Moon className="h-4 w-4 text-primary" />
                      <div>
                        <Label className="text-sm font-semibold">Automatic Night Mode</Label>
                        <p className="text-xs text-muted-foreground">Switch to dark theme at scheduled times</p>
                      </div>
                    </div>
                    <Switch checked={settings.night_mode_auto} onCheckedChange={(v) => updateSetting("night_mode_auto", v)} />
                  </div>

                  {settings.night_mode_auto && (
                    <div className="p-5 grid gap-4 sm:grid-cols-2">
                      <div>
                        <Label className="text-xs">Start Time</Label>
                        <Input
                          type="time"
                          value={settings.night_mode_start}
                          onChange={(e) => updateSetting("night_mode_start", e.target.value)}
                        />
                      </div>
                      <div>
                        <Label className="text-xs">End Time</Label>
                        <Input
                          type="time"
                          value={settings.night_mode_end}
                          onChange={(e) => updateSetting("night_mode_end", e.target.value)}
                        />
                      </div>
                    </div>
                  )}
                </Card>
              </>
            )}

            {activeCategory === "features" && (
              <>
                <div>
                  <h2 className="text-xl font-bold text-foreground">Features</h2>
                  <p className="text-sm text-muted-foreground mt-1">Customize exam behavior and study tools</p>
                </div>

                <Card className="divide-y divide-border">
                  <div className="p-5 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CheckSquare className="h-4 w-4 text-primary" />
                      <div>
                        <Label className="text-sm font-semibold">Confirm Answer Omission</Label>
                        <p className="text-xs text-muted-foreground">Warn before skipping questions</p>
                      </div>
                    </div>
                    <Switch checked={settings.confirm_answer_omission} onCheckedChange={(v) => updateSetting("confirm_answer_omission", v)} />
                  </div>

                  <div className="p-5 space-y-3">
                    <div className="flex items-center gap-2">
                      <Highlighter className="h-4 w-4 text-primary" />
                      <Label className="text-sm font-semibold">Default Highlighter Color</Label>
                    </div>
                    <div className="flex gap-2">
                      {highlightColors.map((color) => (
                        <button
                          key={color.value}
                          onClick={() => updateSetting("highlight_color", color.value)}
                          className={`h-10 w-10 rounded-md ${color.class} ${
                            settings.highlight_color === color.value ? "ring-2 ring-primary ring-offset-2" : ""
                          }`}
                          title={color.label}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="p-5 flex items-center justify-between">
                    <div>
                      <Label className="text-sm font-semibold">Multicolor Highlighting</Label>
                      <p className="text-xs text-muted-foreground">Use multiple colors in one question</p>
                    </div>
                    <Switch checked={settings.multicolor_highlighting} onCheckedChange={(v) => updateSetting("multicolor_highlighting", v)} />
                  </div>

                  <div className="p-5 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Eye className="h-4 w-4 text-primary" />
                      <Label className="text-sm font-semibold">Hide % Answered Correctly</Label>
                    </div>
                    <Switch checked={settings.hide_answered_correct_percent} onCheckedChange={(v) => updateSetting("hide_answered_correct_percent", v)} />
                  </div>

                  <div className="p-5 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <BookmarkPlus className="h-4 w-4 text-primary" />
                      <Label className="text-sm font-semibold">Auto-Add to Flashcards</Label>
                    </div>
                    <Switch checked={settings.auto_add_flashcard} onCheckedChange={(v) => updateSetting("auto_add_flashcard", v)} />
                  </div>

                  <div className="p-5 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-primary" />
                      <Label className="text-sm font-semibold">Auto-Add to Notebook</Label>
                    </div>
                    <Switch checked={settings.auto_add_notebook} onCheckedChange={(v) => updateSetting("auto_add_notebook", v)} />
                  </div>

                  <div className="p-5 flex items-center justify-between">
                    <div>
                      <Label className="text-sm font-semibold">Smart Context Menu</Label>
                      <p className="text-xs text-muted-foreground">Quick actions on right-click</p>
                    </div>
                    <Switch checked={settings.smart_context_menu} onCheckedChange={(v) => updateSetting("smart_context_menu", v)} />
                  </div>
                </Card>
              </>
            )}

            {activeCategory === "security" && (
              <>
                <div>
                  <h2 className="text-xl font-bold text-foreground">Security</h2>
                  <p className="text-sm text-muted-foreground mt-1">Manage your password and security settings</p>
                </div>

                <Card className="p-6 space-y-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Key className="h-4 w-4 text-primary" />
                    <h3 className="text-sm font-semibold">Change Password</h3>
                  </div>
                  <div>
                    <Label className="text-xs">New Password</Label>
                    <Input type="password" value={passwords.new_password} onChange={(e) => setPasswords({ ...passwords, new_password: e.target.value })} />
                  </div>
                  <div>
                    <Label className="text-xs">Confirm New Password</Label>
                    <Input type="password" value={passwords.confirm} onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })} />
                  </div>
                  <Button onClick={changePassword} disabled={loading || !passwords.new_password} variant="outline" size="sm">
                    Change Password
                  </Button>
                </Card>
              </>
            )}

            {/* Save Footer */}
            {activeCategory !== "profile" && activeCategory !== "security" && (
              <Card className="p-5 flex items-center justify-between sticky bottom-0 shadow-lg">
                <div className="flex items-center gap-2 text-sm">
                  {hasUnsavedChanges && (
                    <Badge variant="outline" className="bg-warning/10 text-warning border-warning/30">
                      Unsaved Changes
                    </Badge>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" onClick={resetSettings}>
                    Reset to Defaults
                  </Button>
                  <Button onClick={saveSettings} disabled={loading || !hasUnsavedChanges} size="sm">
                    {loading ? <Loader2 className="mr-1 h-4 w-4 animate-spin" /> : null}
                    Save Settings
                  </Button>
                </div>
              </Card>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
