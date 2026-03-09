import PublicLayout from "@/components/PublicLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { BookOpen, Loader2, Eye, EyeOff, CheckCircle2, GraduationCap, Brain, Trophy } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";

export default function Login() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [shake, setShake] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    
    if (error) {
      setShake(true);
      setTimeout(() => setShake(false), 500);
      toast({ title: "Login failed", description: error.message, variant: "destructive" });
      setLoading(false);
      return;
    }
    
    setSuccess(true);
    setTimeout(() => {
      navigate("/dashboard");
    }, 1500);
  };

  const shakeAnimation = {
    x: shake ? [0, -10, 10, -10, 10, 0] : 0,
    transition: { duration: 0.4 }
  };

  return (
    <PublicLayout>
      <div className="flex min-h-[85vh] w-full">
        {/* Left Side - Decorative */}
        <motion.div 
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary/10 via-primary/5 to-background items-center justify-center p-12"
        >
          <div className="max-w-md space-y-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
              className="w-20 h-20 rounded-2xl bg-primary flex items-center justify-center"
            >
              <BookOpen className="w-10 h-10 text-primary-foreground" />
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-4xl font-bold text-foreground"
            >
              Welcome Back to MedPrep
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="text-lg text-muted-foreground"
            >
              Continue your medical education journey with personalized questions tailored to your academic year and semester.
            </motion.p>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="space-y-4"
            >
              {[
                { icon: GraduationCap, text: "Year-specific content" },
                { icon: Brain, text: "Adaptive learning" },
                { icon: Trophy, text: "Track your progress" },
              ].map((item, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.7 + i * 0.1 }}
                  className="flex items-center gap-3 text-muted-foreground"
                >
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <item.icon className="w-5 h-5 text-primary" />
                  </div>
                  <span>{item.text}</span>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </motion.div>

        {/* Right Side - Login Form */}
        <div className="flex-1 flex items-center justify-center px-4 py-12">
          <AnimatePresence mode="wait">
            {success ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="text-center space-y-4"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
                  className="w-20 h-20 rounded-full bg-green-500/10 flex items-center justify-center mx-auto"
                >
                  <CheckCircle2 className="w-10 h-10 text-green-500" />
                </motion.div>
                <motion.h2
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="text-2xl font-semibold text-foreground"
                >
                  Welcome back!
                </motion.h2>
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="text-muted-foreground"
                >
                  Redirecting to your dashboard...
                </motion.p>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 1.2, ease: "easeInOut" }}
                  className="h-1 bg-green-500 rounded-full mx-auto max-w-[200px]"
                />
              </motion.div>
            ) : (
              <motion.div
                key="form"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4 }}
                className="w-full max-w-md"
              >
                <Card className="border-border/60 shadow-xl">
                  <CardHeader className="pb-4 text-center">
                    <motion.div 
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 200 }}
                      className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-primary"
                    >
                      <BookOpen className="h-6 w-6 text-primary-foreground" />
                    </motion.div>
                    <CardTitle className="text-2xl">Sign In</CardTitle>
                    <CardDescription>Enter your credentials to continue</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <motion.form 
                      onSubmit={handleLogin} 
                      className="space-y-4"
                      animate={shakeAnimation}
                    >
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input 
                          id="email" 
                          type="email" 
                          placeholder="you@example.com" 
                          value={email} 
                          onChange={(e) => setEmail(e.target.value)} 
                          required 
                          className="h-11"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label htmlFor="password">Password</Label>
                          <Link to="/forgot-password" className="text-xs text-primary hover:underline">
                            Forgot password?
                          </Link>
                        </div>
                        <div className="relative">
                          <Input 
                            id="password" 
                            type={showPassword ? "text" : "password"} 
                            placeholder="••••••••" 
                            value={password} 
                            onChange={(e) => setPassword(e.target.value)} 
                            required 
                            className="h-11 pr-10"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                          >
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="remember" 
                          checked={rememberMe}
                          onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                        />
                        <Label htmlFor="remember" className="text-sm font-normal cursor-pointer">
                          Remember me
                        </Label>
                      </div>

                      <Button type="submit" className="w-full h-11" disabled={loading}>
                        {loading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Signing in...
                          </>
                        ) : (
                          "Sign In"
                        )}
                      </Button>
                    </motion.form>
                    
                    <p className="mt-6 text-center text-sm text-muted-foreground">
                      Don't have an account?{" "}
                      <Link to="/signup" className="font-medium text-primary hover:underline">
                        Create account
                      </Link>
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </PublicLayout>
  );
}
