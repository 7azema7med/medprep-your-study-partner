import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import {
  LayoutDashboard, Users, Shield, Key, FileQuestion, StickyNote,
  BookOpen, Settings, ScrollText, CreditCard, BarChart3, Menu, X,
  LogOut, ChevronDown, ChevronRight, Home, UserCog, Library
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useAdminAuth } from "@/hooks/useAdminAuth";

interface NavItem {
  label: string;
  to?: string;
  icon: React.ElementType;
  children?: { label: string; to: string; icon: React.ElementType }[];
}

const navItems: NavItem[] = [
  { label: "Dashboard", to: "/admin", icon: LayoutDashboard },
  { label: "Security", to: "/admin/security", icon: Shield },
  {
    label: "Users",
    icon: Users,
    children: [
      { label: "All Users", to: "/admin/users", icon: Users },
      { label: "Admins", to: "/admin/admins", icon: UserCog },
      { label: "Roles & Permissions", to: "/admin/roles", icon: Key },
    ],
  },
  { label: "Questions", to: "/admin/questions", icon: FileQuestion },
  { label: "Notes", to: "/admin/notes", icon: StickyNote },
  { label: "Exams", to: "/admin/exams", icon: BookOpen },
  { label: "Medical Library", to: "/admin/library", icon: Library },
  { label: "Activation Codes", to: "/admin/codes", icon: Key },
  { label: "Plans & Subs", to: "/admin/plans", icon: CreditCard },
  { label: "Analytics", to: "/admin/analytics", icon: BarChart3 },
  { label: "Audit Logs", to: "/admin/audit-logs", icon: ScrollText },
  { label: "Settings", to: "/admin/settings", icon: Settings },
];

export default function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const { isAdmin, adminRole, loading, user } = useAdminAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [expandedGroups, setExpandedGroups] = useState<string[]>(["Users"]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-4 bg-background">
        <Shield className="h-16 w-16 text-destructive" />
        <h1 className="text-2xl font-bold text-foreground">Access Denied</h1>
        <p className="text-muted-foreground">You don't have admin privileges.</p>
        <Button onClick={() => navigate("/dashboard")}>Go to Dashboard</Button>
      </div>
    );
  }

  const isActive = (path: string) => location.pathname === path;
  const isGroupActive = (children: { to: string }[]) => children.some(c => location.pathname === c.to);

  const toggleGroup = (label: string) => {
    setExpandedGroups(prev =>
      prev.includes(label) ? prev.filter(g => g !== label) : [...prev, label]
    );
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <aside
        className={`flex flex-col transition-all duration-300 ${sidebarOpen ? "w-64" : "w-0 -ml-64 md:w-16 md:ml-0"} shrink-0 overflow-hidden bg-[hsl(220,25%,12%)]`}
      >
        <div className="flex h-14 items-center gap-2 border-b border-white/10 px-4">
          <Shield className="h-6 w-6 text-primary" />
          {sidebarOpen && <span className="text-base font-bold text-white">MedPrep Admin</span>}
        </div>

        <nav className="flex-1 overflow-y-auto px-2 py-3">
          {navItems.map(item => {
            if (item.children) {
              const isExpanded = expandedGroups.includes(item.label);
              return (
                <div key={item.label} className="mb-0.5">
                  <button
                    onClick={() => toggleGroup(item.label)}
                    className={`flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                      isGroupActive(item.children) ? "bg-white/10 text-white" : "text-white/60 hover:bg-white/5 hover:text-white"
                    }`}
                  >
                    <item.icon className="h-4 w-4 shrink-0" />
                    {sidebarOpen && (
                      <>
                        <span className="flex-1 text-left">{item.label}</span>
                        {isExpanded ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
                      </>
                    )}
                  </button>
                  {isExpanded && sidebarOpen && (
                    <div className="ml-4 mt-0.5 space-y-0.5">
                      {item.children.map(child => (
                        <Link
                          key={child.to}
                          to={child.to}
                          className={`flex items-center gap-3 rounded-md px-3 py-1.5 text-sm transition-colors ${
                            isActive(child.to) ? "bg-primary text-white font-medium" : "text-white/50 hover:bg-white/5 hover:text-white"
                          }`}
                        >
                          <child.icon className="h-3.5 w-3.5 shrink-0" />
                          <span>{child.label}</span>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              );
            }
            return (
              <Link
                key={item.to}
                to={item.to!}
                className={`mb-0.5 flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors ${
                  isActive(item.to!) ? "bg-primary text-white font-medium" : "text-white/60 hover:bg-white/5 hover:text-white"
                }`}
              >
                <item.icon className="h-4 w-4 shrink-0" />
                {sidebarOpen && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {sidebarOpen && (
          <div className="border-t border-white/10 p-3">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-xs font-bold text-white">
                {user?.email?.[0]?.toUpperCase() || "A"}
              </div>
              <div className="flex-1 overflow-hidden">
                <p className="truncate text-xs font-medium text-white">{user?.user_metadata?.username || "Admin"}</p>
                <p className="truncate text-[10px] text-white/40">{adminRole}</p>
              </div>
            </div>
          </div>
        )}
      </aside>

      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex h-12 items-center justify-between border-b bg-card px-4">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(!sidebarOpen)}>
              {sidebarOpen ? <X className="h-4 w-4 text-muted-foreground" /> : <Menu className="h-4 w-4 text-muted-foreground" />}
            </button>
            <span className="text-sm font-semibold text-foreground">Admin Panel</span>
          </div>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="sm" asChild className="h-8 text-xs">
              <Link to="/dashboard"><Home className="mr-1 h-3.5 w-3.5" />User Dashboard</Link>
            </Button>
            <Button variant="ghost" size="sm" className="h-8 text-xs" onClick={async () => { await signOut(); navigate("/"); }}>
              <LogOut className="mr-1 h-3.5 w-3.5" />Logout
            </Button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto bg-background p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
