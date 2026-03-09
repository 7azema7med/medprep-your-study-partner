import PublicLayout from "@/components/PublicLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { BookOpen, Loader2, Eye, EyeOff, CheckCircle2, ArrowRight, ArrowLeft, User, GraduationCap, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { Progress } from "@/components/ui/progress";

const COUNTRIES = [
  "United States", "United Kingdom", "Canada", "Australia", "Germany", "France", 
  "India", "Pakistan", "Egypt", "Saudi Arabia", "UAE", "Jordan", "Iraq", "Syria",
  "Lebanon", "Palestine", "Yemen", "Sudan", "Libya", "Morocco", "Algeria", "Tunisia",
  "Nigeria", "South Africa", "Kenya", "Brazil", "Mexico", "Other"
];

const ACADEMIC_YEARS = ["Year 1", "Year 2", "Year 3", "Year 4", "Year 5"];
const SEMESTERS = ["Semester 1", "Semester 2", "Summer"];

interface FormData {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  country: string;
  phone: string;
  universityId: string;
  academicYear: string;
  semester: string;
  activationCode: string;
}

export default function Signup() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [form, setForm] = useState<FormData>({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    country: "",
    phone: "",
    universityId: "",
    academicYear: "",
    semester: "",
    activationCode: "",
  });

  const update = (key: keyof FormData, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const validateStep1 = () => {
    if (!form.username || !form.email || !form.password || !form.confirmPassword) {
      toast({ title: "Missing fields", description: "Please fill in all required fields", variant: "destructive" });
      return false;
    }
    if (form.password !== form.confirmPassword) {
      toast({ title: "Error", description: "Passwords do not match", variant: "destructive" });
      return false;
    }
    if (form.password.length < 6) {
      toast({ title: "Error", description: "Password must be at least 6 characters", variant: "destructive" });
      return false;
    }
    return true;
  };

  const validateStep2 = () => {
    if (!form.universityId || !form.academicYear || !form.semester) {
      toast({ title: "Missing fields", description: "Please fill in all academic information", variant: "destructive" });
      return false;
    }
    return true;
  };

  const nextStep = () => {
    if (step === 1 && !validateStep1()) return;
    if (step === 2 && !validateStep2()) return;
    setStep(step + 1);
  };

  const prevStep = () => setStep(step - 1);

  const handleSignup = async () => {
    setLoading(true);
    
    const { error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        data: {
          username: form.username,
          country: form.country,
          phone: form.phone,
          university_id: form.universityId,
          academic_year: form.academicYear,
          semester: form.semester,
          activation_code: form.activationCode,
        },
      },
    });

    if (error) {
      toast({ title: "Signup failed", description: error.message, variant: "destructive" });
      setLoading(false);
      return;
    }

    setSuccess(true);
    setTimeout(() => {
      navigate("/login");
    }, 3000);
  };

  const progressValue = (step / 3) * 100;

  const stepVariants = {
    enter: (direction: number) => ({ x: direction > 0 ? 50 : -50, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (direction: number) => ({ x: direction < 0 ? 50 : -50, opacity: 0 }),
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
              Join MedPrep Today
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="text-lg text-muted-foreground"
            >
              Create your account and get access to thousands of questions tailored to your academic level.
            </motion.p>

            {/* Step Indicator */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="space-y-6"
            >
              {[
                { num: 1, title: "Personal Info", desc: "Your basic details" },
                { num: 2, title: "Academic Info", desc: "Your university details" },
                { num: 3, title: "Confirmation", desc: "Review & submit" },
              ].map((s, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.7 + i * 0.1 }}
                  className={`flex items-center gap-4 ${step >= s.num ? "text-foreground" : "text-muted-foreground"}`}
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                    step > s.num 
                      ? "bg-green-500 text-white" 
                      : step === s.num 
                        ? "bg-primary text-primary-foreground" 
                        : "bg-muted text-muted-foreground"
                  }`}>
                    {step > s.num ? <Check className="w-5 h-5" /> : s.num}
                  </div>
                  <div>
                    <p className="font-medium">{s.title}</p>
                    <p className="text-sm text-muted-foreground">{s.desc}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </motion.div>

        {/* Right Side - Form */}
        <div className="flex-1 flex items-center justify-center px-4 py-12">
          <AnimatePresence mode="wait">
            {success ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="text-center space-y-4 max-w-md"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
                  className="w-24 h-24 rounded-full bg-green-500/10 flex items-center justify-center mx-auto"
                >
                  <CheckCircle2 className="w-12 h-12 text-green-500" />
                </motion.div>
                <motion.h2
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="text-3xl font-bold text-foreground"
                >
                  Welcome to MedPrep!
                </motion.h2>
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="text-lg text-muted-foreground"
                >
                  Hi {form.username}, your account has been created successfully!
                </motion.p>
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="text-sm text-muted-foreground"
                >
                  Please check your email to verify your account, then you can sign in.
                </motion.p>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 2.5, ease: "easeInOut" }}
                  className="h-1.5 bg-green-500 rounded-full mx-auto max-w-[250px]"
                />
              </motion.div>
            ) : (
              <motion.div
                key="form"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="w-full max-w-lg"
              >
                <Card className="border-border/60 shadow-xl">
                  <CardHeader className="pb-4">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
                        {step === 1 ? <User className="h-5 w-5 text-primary-foreground" /> : <GraduationCap className="h-5 w-5 text-primary-foreground" />}
                      </div>
                      <div>
                        <CardTitle className="text-xl">
                          {step === 1 && "Personal Information"}
                          {step === 2 && "Academic Information"}
                          {step === 3 && "Confirm Details"}
                        </CardTitle>
                        <CardDescription>Step {step} of 3</CardDescription>
                      </div>
                    </div>
                    <Progress value={progressValue} className="h-1.5" />
                  </CardHeader>
                  
                  <CardContent>
                    <AnimatePresence mode="wait" custom={step}>
                      {/* Step 1: Personal Info */}
                      {step === 1 && (
                        <motion.div
                          key="step1"
                          custom={1}
                          variants={stepVariants}
                          initial="enter"
                          animate="center"
                          exit="exit"
                          transition={{ duration: 0.3 }}
                          className="space-y-4"
                        >
                          <div className="space-y-2">
                            <Label>Username *</Label>
                            <Input 
                              placeholder="johndoe" 
                              value={form.username} 
                              onChange={(e) => update("username", e.target.value)} 
                              className="h-11"
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <Label>Email *</Label>
                            <Input 
                              type="email" 
                              placeholder="you@example.com" 
                              value={form.email} 
                              onChange={(e) => update("email", e.target.value)} 
                              className="h-11"
                            />
                          </div>
                          
                          <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-2">
                              <Label>Password *</Label>
                              <div className="relative">
                                <Input 
                                  type={showPassword ? "text" : "password"} 
                                  placeholder="••••••••" 
                                  value={form.password} 
                                  onChange={(e) => update("password", e.target.value)} 
                                  className="h-11 pr-10"
                                />
                                <button
                                  type="button"
                                  onClick={() => setShowPassword(!showPassword)}
                                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                >
                                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                              </div>
                            </div>
                            <div className="space-y-2">
                              <Label>Confirm *</Label>
                              <div className="relative">
                                <Input 
                                  type={showConfirmPassword ? "text" : "password"} 
                                  placeholder="••••••••" 
                                  value={form.confirmPassword} 
                                  onChange={(e) => update("confirmPassword", e.target.value)} 
                                  className="h-11 pr-10"
                                />
                                <button
                                  type="button"
                                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                >
                                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                              </div>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-2">
                              <Label>Country</Label>
                              <Select value={form.country} onValueChange={(v) => update("country", v)}>
                                <SelectTrigger className="h-11">
                                  <SelectValue placeholder="Select country" />
                                </SelectTrigger>
                                <SelectContent>
                                  {COUNTRIES.map((c) => (
                                    <SelectItem key={c} value={c}>{c}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-2">
                              <Label>Phone</Label>
                              <Input 
                                placeholder="+1 234 567 890" 
                                value={form.phone} 
                                onChange={(e) => update("phone", e.target.value)} 
                                className="h-11"
                              />
                            </div>
                          </div>

                          <Button onClick={nextStep} className="w-full h-11 mt-2">
                            Continue <ArrowRight className="ml-2 h-4 w-4" />
                          </Button>
                        </motion.div>
                      )}

                      {/* Step 2: Academic Info */}
                      {step === 2 && (
                        <motion.div
                          key="step2"
                          custom={1}
                          variants={stepVariants}
                          initial="enter"
                          animate="center"
                          exit="exit"
                          transition={{ duration: 0.3 }}
                          className="space-y-4"
                        >
                          <div className="space-y-2">
                            <Label>University ID *</Label>
                            <Input 
                              placeholder="Enter your student ID" 
                              value={form.universityId} 
                              onChange={(e) => update("universityId", e.target.value)} 
                              className="h-11"
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <Label>Academic Year *</Label>
                            <div className="grid grid-cols-5 gap-2">
                              {ACADEMIC_YEARS.map((year) => (
                                <Button
                                  key={year}
                                  type="button"
                                  variant={form.academicYear === year ? "default" : "outline"}
                                  onClick={() => update("academicYear", year)}
                                  className="h-11"
                                >
                                  {year.replace("Year ", "")}
                                </Button>
                              ))}
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            <Label>Semester *</Label>
                            <div className="grid grid-cols-3 gap-2">
                              {SEMESTERS.map((sem) => (
                                <Button
                                  key={sem}
                                  type="button"
                                  variant={form.semester === sem ? "default" : "outline"}
                                  onClick={() => update("semester", sem)}
                                  className="h-11"
                                >
                                  {sem}
                                </Button>
                              ))}
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            <Label>Activation Code <span className="text-muted-foreground text-xs">(optional)</span></Label>
                            <Input 
                              placeholder="Enter code if you have one" 
                              value={form.activationCode} 
                              onChange={(e) => update("activationCode", e.target.value)} 
                              className="h-11"
                            />
                          </div>

                          <div className="flex gap-3 mt-2">
                            <Button variant="outline" onClick={prevStep} className="flex-1 h-11">
                              <ArrowLeft className="mr-2 h-4 w-4" /> Back
                            </Button>
                            <Button onClick={nextStep} className="flex-1 h-11">
                              Continue <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                          </div>
                        </motion.div>
                      )}

                      {/* Step 3: Confirmation */}
                      {step === 3 && (
                        <motion.div
                          key="step3"
                          custom={1}
                          variants={stepVariants}
                          initial="enter"
                          animate="center"
                          exit="exit"
                          transition={{ duration: 0.3 }}
                          className="space-y-4"
                        >
                          <div className="rounded-lg border border-border bg-muted/30 p-4 space-y-3">
                            <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">Account Summary</h3>
                            
                            <div className="grid grid-cols-2 gap-3 text-sm">
                              <div>
                                <p className="text-muted-foreground">Username</p>
                                <p className="font-medium">{form.username}</p>
                              </div>
                              <div>
                                <p className="text-muted-foreground">Email</p>
                                <p className="font-medium truncate">{form.email}</p>
                              </div>
                              <div>
                                <p className="text-muted-foreground">Country</p>
                                <p className="font-medium">{form.country || "Not specified"}</p>
                              </div>
                              <div>
                                <p className="text-muted-foreground">Phone</p>
                                <p className="font-medium">{form.phone || "Not specified"}</p>
                              </div>
                            </div>
                          </div>

                          <div className="rounded-lg border border-primary/20 bg-primary/5 p-4 space-y-3">
                            <h3 className="font-medium text-sm text-primary uppercase tracking-wide">Academic Information</h3>
                            
                            <div className="grid grid-cols-3 gap-3 text-sm">
                              <div>
                                <p className="text-muted-foreground">University ID</p>
                                <p className="font-medium">{form.universityId}</p>
                              </div>
                              <div>
                                <p className="text-muted-foreground">Year</p>
                                <p className="font-medium">{form.academicYear}</p>
                              </div>
                              <div>
                                <p className="text-muted-foreground">Semester</p>
                                <p className="font-medium">{form.semester}</p>
                              </div>
                            </div>
                          </div>

                          <p className="text-xs text-muted-foreground text-center">
                            By creating an account, you agree to our Terms of Service and Privacy Policy.
                          </p>

                          <div className="flex gap-3 mt-2">
                            <Button variant="outline" onClick={prevStep} className="flex-1 h-11" disabled={loading}>
                              <ArrowLeft className="mr-2 h-4 w-4" /> Back
                            </Button>
                            <Button onClick={handleSignup} className="flex-1 h-11" disabled={loading}>
                              {loading ? (
                                <>
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                  Creating...
                                </>
                              ) : (
                                "Create Account"
                              )}
                            </Button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                    
                    <p className="mt-6 text-center text-sm text-muted-foreground">
                      Already have an account?{" "}
                      <Link to="/login" className="font-medium text-primary hover:underline">
                        Sign in
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
