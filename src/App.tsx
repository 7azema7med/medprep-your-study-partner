import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Pricing from "./pages/Pricing";
import Features from "./pages/Features";
import WhyUs from "./pages/WhyUs";
import Contact from "./pages/Contact";
import HowToUse from "./pages/HowToUse";
import DashboardLayout from "./components/DashboardLayout";
import Dashboard from "./pages/dashboard/Dashboard";
import CreateTest from "./pages/dashboard/CreateTest";
import PreviousTests from "./pages/dashboard/PreviousTests";
import OverallPerformance from "./pages/dashboard/OverallPerformance";
import Reports from "./pages/dashboard/Reports";
import Graphs from "./pages/dashboard/Graphs";
import SearchQuestions from "./pages/dashboard/SearchQuestions";
import Notes from "./pages/dashboard/Notes";
import MedicalLibrary from "./pages/dashboard/MedicalLibrary";
import MyNotebook from "./pages/dashboard/MyNotebook";
import Settings from "./pages/dashboard/Settings";
import ExamInterface from "./pages/dashboard/ExamInterface";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/features" element={<Features />} />
            <Route path="/why-us" element={<WhyUs />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/how-to-use" element={<HowToUse />} />
            <Route path="/dashboard" element={<DashboardLayout />}>
              <Route index element={<Dashboard />} />
              <Route path="create-test" element={<CreateTest />} />
              <Route path="previous-tests" element={<PreviousTests />} />
              <Route path="performance" element={<OverallPerformance />} />
              <Route path="reports" element={<Reports />} />
              <Route path="graphs" element={<Graphs />} />
              <Route path="search" element={<SearchQuestions />} />
              <Route path="notes" element={<Notes />} />
              <Route path="medical-library" element={<MedicalLibrary />} />
              <Route path="my-notebook" element={<MyNotebook />} />
              <Route path="settings" element={<Settings />} />
            </Route>
            <Route path="/dashboard/exam/:testId" element={<ExamInterface />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
