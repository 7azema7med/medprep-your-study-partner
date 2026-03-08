import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { User, Mail, Phone, Globe, Key, Shield, Loader2 } from "lucide-react";
import { useEffect } from "react";

export default function Settings() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState({ username: "", phone: "", country: "", activation_code: "" });
  const [passwords, setPasswords] = useState({ current: "", new_password: "", confirm: "" });
  const [profileLoading, setProfileLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    async function fetch() {
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
    fetch();
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
    else toast.success("Profile updated");
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

  if (profileLoading) {
    return <div className="flex items-center justify-center py-20"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;
  }

  return (
    <div className="animate-fade-in space-y-6 max-w-2xl">
      <h1 className="text-xl font-bold text-foreground">Account Settings</h1>

      {/* Profile */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm font-semibold">
            <User className="h-4 w-4" /> Profile Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
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
        </CardContent>
      </Card>

      {/* Subscription */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm font-semibold">
            <Shield className="h-4 w-4" /> Subscription Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3">
            <Badge className="bg-primary">Active</Badge>
            <span className="text-sm text-muted-foreground">Premium Plan</span>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">Your subscription is active. Full access to all features.</p>
        </CardContent>
      </Card>

      {/* Change Password */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm font-semibold">
            <Key className="h-4 w-4" /> Change Password
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
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
        </CardContent>
      </Card>
    </div>
  );
}
