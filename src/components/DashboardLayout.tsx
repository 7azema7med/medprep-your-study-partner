import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import {
  BookOpen, Home, FileQuestion, FilePlus, History, BarChart3,
  TrendingUp, FileText, LineChart, Search, StickyNote,
  Library, BookMarked, ChevronDown, ChevronRight, Menu, X, LogOut, User, Settings, Shield, Layers
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { motion, AnimatePresence } from "framer-motion";

interface NavItem {
  label: string;
  to?: string;
  icon: React.ElementType;
  children?: { label: string; to: string; icon: React.ElementType }[];
}

const navItems: NavItem[] = [
  { label: "Dashboard", to: "/dashboard", icon: Home },
  { label: "Browse Topics", to: "/dashboard/browse", icon: Layers },
  {
    label: "QBank",
    icon: FileQuestion,
    children: [
      { label: "Create Test", to: "/dashboard/create-test", icon: FilePlus },
      { label: "Previous Tests", to: "/dashboard/previous-tests", icon: History },
      { label: "Performance", to: "/dashboard/performance", icon: BarChart3 },
      { label: "Search Questions", to: "/dashboard/search", icon: Search },
      { label: "Notes", to: "/dashboard/notes", icon: StickyNote },
    ],
  },
  { label: "Medical Library", to: "/dashboard/medical-library", icon: Library },
  { label: "My Notebook", to: "/dashboard/my-notebook", icon: BookMarked },
  { label: "Settings", to: "/dashboard/settings", icon: Settings },
];

const performanceChildren = [
  { label: "Overall", to: "/dashboard/performance", icon: TrendingUp },
  { label: "Reports", to: "/dashboard/reports", icon: FileText },
  { label: "Graphs", to: "/dashboard/graphs", icon: LineChart },
];

export default function DashboardLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut, loading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [expandedGroups, setExpandedGroups] = useState<string[]>(["QBank"]);
  const [perfExpanded, setPerfExpanded] = useState(false);
  const [profileName, setProfileName] = useState("Student");
  const [profileEmail, setProfileEmail] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      navigate("/login");
      return;
    }
    if (user) {
      setProfileEmail(user.email || "");
      setProfileName(user.user_metadata?.username || user.email?.split("@")[0] || "Student");
      // Check admin
      supabase.from("user_roles").select("role").eq("user_id", user.id)
        .in("role", ["super_admin", "admin", "editor", "moderator", "support", "content_manager", "question_reviewer"])
        .then(({ data }) => setIsAdmin(!!(data && data.length > 0)));
    }
  }, [user, loading, navigate]);

  const isActive = (path: string) => location.pathname === path;

  const toggleGroup = (label: string) => {
    setExpandedGroups((prev) =>
      prev.includes(label) ? prev.filter((g) => g !== label) : [...prev, label]
    );
  };

  const handleLogout = async () => {
    await signOut();
    navigate("/");
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <aside
        className={`flex flex-col transition-all duration-300 ${
          sidebarOpen ? "w-60" : "w-0 -ml-60 md:w-14 md:ml-0"
        } shrink-0 overflow-hidden bg-sidebar`}
      >
        <div className="flex h-12 items-center gap-2 border-b border-sidebar-border px-3">
          <BookOpen className="h-5 w-5 text-sidebar-foreground" />
          {sidebarOpen && (
            <span className="text-sm font-bold text-sidebar-foreground">MedPrep</span>
          )}
        </div>

        <nav className="flex-1 overflow-y-auto px-2 py-2">
          {navItems.map((item) => {
            if (item.children) {
              const isExpanded = expandedGroups.includes(item.label);
              return (
                <div key={item.label} className="mb-0.5">
                  <button
                    onClick={() => toggleGroup(item.label)}
                    className={`flex w-full items-center gap-2.5 rounded-md px-2.5 py-1.5 text-[13px] font-medium transition-colors ${
                      isExpanded ? "bg-sidebar-accent text-sidebar-foreground" : "text-sidebar-foreground/65 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                    }`}
                  >
                    <item.icon className="h-4 w-4 shrink-0" />
                    {sidebarOpen && (
                      <>
                        <span className="flex-1 text-left">{item.label}</span>
                        <motion.div animate={{ rotate: isExpanded ? 90 : 0 }} transition={{ duration: 0.15 }}>
                          <ChevronRight className="h-3.5 w-3.5" />
                        </motion.div>
                      </>
                    )}
                  </button>
                  <AnimatePresence>
                    {isExpanded && sidebarOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.15 }}
                        className="ml-3.5 mt-0.5 space-y-0.5 overflow-hidden border-l border-sidebar-border/50 pl-2.5"
                      >
                        {item.children.map((child) => {
                          if (child.label === "Performance") {
                            return (
                              <div key={child.label}>
                                <button
                                  onClick={() => setPerfExpanded(!perfExpanded)}
                                  className={`flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-[12px] transition-colors ${
                                    ["/dashboard/performance", "/dashboard/reports", "/dashboard/graphs"].includes(location.pathname)
                                      ? "font-medium text-sidebar-foreground bg-sidebar-primary/80"
                                      : "text-sidebar-foreground/55 hover:text-sidebar-foreground"
                                  }`}
                                >
                                  <child.icon className="h-3.5 w-3.5 shrink-0" />
                                  <span className="flex-1 text-left">{child.label}</span>
                                  <motion.div animate={{ rotate: perfExpanded ? 90 : 0 }} transition={{ duration: 0.15 }}>
                                    <ChevronRight className="h-3 w-3" />
                                  </motion.div>
                                </button>
                                <AnimatePresence>
                                  {perfExpanded && (
                                    <motion.div
                                      initial={{ height: 0, opacity: 0 }}
                                      animate={{ height: "auto", opacity: 1 }}
                                      exit={{ height: 0, opacity: 0 }}
                                      transition={{ duration: 0.15 }}
                                      className="ml-3 mt-0.5 space-y-0.5 overflow-hidden"
                                    >
                                      {performanceChildren.map((pc) => (
                                        <Link
                                          key={pc.to}
                                          to={pc.to}
                                          className={`flex items-center gap-2 rounded-md px-2 py-1 text-[11px] transition-colors ${
                                            isActive(pc.to)
                                              ? "font-medium text-sidebar-foreground bg-sidebar-primary/80"
                                              : "text-sidebar-foreground/50 hover:text-sidebar-foreground"
                                          }`}
                                        >
                                          <pc.icon className="h-3 w-3 shrink-0" />
                                          <span>{pc.label}</span>
                                        </Link>
                                      ))}
                                    </motion.div>
                                  )}
                                </AnimatePresence>
                              </div>
                            );
                          }
                          return (
                            <Link
                              key={child.to}
                              to={child.to}
                              className={`flex items-center gap-2 rounded-md px-2 py-1.5 text-[12px] transition-colors ${
                                isActive(child.to)
                                  ? "font-medium text-sidebar-foreground bg-sidebar-primary/80"
                                  : "text-sidebar-foreground/55 hover:text-sidebar-foreground"
                              }`}
                            >
                              <child.icon className="h-3.5 w-3.5 shrink-0" />
                              <span>{child.label}</span>
                            </Link>
                          );
                        })}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            }

            return (
              <Link
                key={item.to}
                to={item.to!}
                className={`mb-0.5 flex items-center gap-2.5 rounded-md px-2.5 py-1.5 text-[13px] transition-colors ${
                  isActive(item.to!)
                    ? "font-medium text-sidebar-foreground bg-sidebar-primary/80"
                    : "text-sidebar-foreground/65 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                }`}
              >
                <item.icon className="h-4 w-4 shrink-0" />
                {sidebarOpen && <span>{item.label}</span>}
              </Link>
            );
          })}

          {isAdmin && (
            <Link
              to="/admin"
              className="mt-2 flex items-center gap-2.5 rounded-md border border-sidebar-border/50 px-2.5 py-1.5 text-[12px] font-medium text-sidebar-foreground/65 transition-colors hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
            >
              <Shield className="h-4 w-4 shrink-0" />
              {sidebarOpen && <span>Admin Panel</span>}
            </Link>
          )}
        </nav>

        {sidebarOpen && (
          <div className="border-t border-sidebar-border p-3">
            <div className="flex items-center gap-2.5">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-sidebar-accent text-[11px] font-bold text-sidebar-foreground">
                {profileName[0]?.toUpperCase() || "S"}
              </div>
              <div className="flex-1 overflow-hidden">
                <p className="truncate text-[12px] font-medium text-sidebar-foreground">{profileName}</p>
                <p className="truncate text-[10px] text-sidebar-foreground/45">{profileEmail}</p>
              </div>
            </div>
          </div>
        )}
      </aside>

      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex h-11 items-center justify-between border-b border-border/60 bg-card px-4">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-muted-foreground transition-colors hover:text-foreground">
              {sidebarOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
            <span className="text-[13px] font-semibold text-foreground">Welcome, {profileName}</span>
          </div>
          <div className="flex items-center gap-1">
            <ThemeToggle />
            <Button variant="ghost" size="sm" className="h-7 text-[11px]" asChild>
              <Link to="/"><Home className="mr-1 h-3.5 w-3.5" />Home</Link>
            </Button>
            <Button variant="ghost" size="sm" className="h-7 text-[11px]" onClick={handleLogout}>
              <LogOut className="mr-1 h-3.5 w-3.5" />Logout
            </Button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto bg-background p-5">
          <Outlet />
        </main>

        <footer className="border-t border-border/60 bg-card px-4 py-1.5 text-center text-[10px] text-muted-foreground">
          © {new Date().getFullYear()} MedPrep. All rights reserved.
        </footer>
      </div>
    </div>
  );
}
