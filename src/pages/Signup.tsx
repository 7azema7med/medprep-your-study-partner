import PublicLayout from "@/components/PublicLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { BookOpen, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { PageTransition } from "@/components/motion";

export default function Signup() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    username: "", email: "", password: "", confirmPassword: "", country: "", phone: "", activationCode: "",
  });

  const update = (key: string, value: string) => setForm((prev) => ({ ...prev, [key]: value }));

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      toast({ title: "Error", description: "Passwords do not match", variant: "destructive" });
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        data: { username: form.username, country: form.country, phone: form.phone, activation_code: form.activationCode },
      },
    });
    if (error) {
      toast({ title: "Signup failed", description: error.message, variant: "destructive" });
      setLoading(false);
      return;
    }
    toast({ title: "Account created!", description: "Please check your email to verify your account." });
    navigate("/login");
  };

  return (
    <PublicLayout>
      <PageTransition className="flex min-h-[75vh] items-center justify-center px-4 py-12">
        <Card className="w-full max-w-md border-border/60 shadow-card">
          <CardHeader className="pb-4 text-center">
            <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
              <BookOpen className="h-5 w-5 text-primary-foreground" />
            </div>
            <CardTitle className="text-xl">Create Account</CardTitle>
            <CardDescription className="text-[13px]">Join MedPrep and start studying</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSignup} className="space-y-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Username</Label>
                <Input placeholder="johndoe" value={form.username} onChange={(e) => update("username", e.target.value)} required className="h-9 text-sm" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Email</Label>
                <Input type="email" placeholder="you@example.com" value={form.email} onChange={(e) => update("email", e.target.value)} required className="h-9 text-sm" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs">Password</Label>
                  <Input type="password" placeholder="••••••••" value={form.password} onChange={(e) => update("password", e.target.value)} required className="h-9 text-sm" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Confirm Password</Label>
                  <Input type="password" placeholder="••••••••" value={form.confirmPassword} onChange={(e) => update("confirmPassword", e.target.value)} required className="h-9 text-sm" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs">Country</Label>
                  <Input placeholder="United States" value={form.country} onChange={(e) => update("country", e.target.value)} className="h-9 text-sm" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Phone</Label>
                  <Input placeholder="+1 234 567 890" value={form.phone} onChange={(e) => update("phone", e.target.value)} className="h-9 text-sm" />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Activation Code <span className="text-muted-foreground">(optional)</span></Label>
                <Input placeholder="Enter code if available" value={form.activationCode} onChange={(e) => update("activationCode", e.target.value)} className="h-9 text-sm" />
              </div>
              <Button type="submit" className="w-full" size="sm" disabled={loading}>
                {loading ? <><Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />Creating account...</> : "Create Account"}
              </Button>
            </form>
            <p className="mt-4 text-center text-xs text-muted-foreground">
              Already have an account?{" "}
              <Link to="/login" className="font-medium text-primary hover:underline">Log in</Link>
            </p>
          </CardContent>
        </Card>
      </PageTransition>
    </PublicLayout>
  );
}
