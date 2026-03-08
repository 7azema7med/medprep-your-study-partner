import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import {
  BookOpen, Home, FileQuestion, FilePlus, History, BarChart3,
  TrendingUp, FileText, LineChart, Search, StickyNote,
  Library, BookMarked, ChevronDown, ChevronRight, Menu, X, LogOut, User
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

interface NavItem {
  label: string;
  to?: string;
  icon: React.ElementType;
  children?: { label: string; to: string; icon: React.ElementType }[];
}

const navItems: NavItem[] = [
  { label: "Dashboard", to: "/dashboard", icon: Home },
  {
    label: "QBank",
    icon: FileQuestion,
    children: [
      { label: "Create Test", to: "/dashboard/create-test", icon: FilePlus },
      { label: "Previous Tests", to: "/dashboard/previous-tests", icon: History },
      {
        label: "Performance", to: "/dashboard/performance", icon: BarChart3,
      },
      { label: "Search Questions", to: "/dashboard/search", icon: Search },
      { label: "Notes", to: "/dashboard/notes", icon: StickyNote },
    ],
  },
  { label: "Medical Library", to: "/dashboard/medical-library", icon: Library },
  { label: "My Notebook", to: "/dashboard/my-notebook", icon: BookMarked },
];

const performanceChildren = [
  { label: "Overall", to: "/dashboard/performance", icon: TrendingUp },
  { label: "Reports", to: "/dashboard/reports", icon: FileText },
  { label: "Graphs", to: "/dashboard/graphs", icon: LineChart },
];

export default function DashboardLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [expandedGroups, setExpandedGroups] = useState<string[]>(["QBank"]);
  const [perfExpanded, setPerfExpanded] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  const toggleGroup = (label: string) => {
    setExpandedGroups((prev) =>
      prev.includes(label) ? prev.filter((g) => g !== label) : [...prev, label]
    );
  };

  const handleLogout = () => {
    localStorage.removeItem("medprep_user");
    navigate("/");
  };

  const user = JSON.parse(localStorage.getItem("medprep_user") || '{"name":"Student","email":"student@medprep.com"}');

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <aside
        className={`flex flex-col transition-all duration-300 ${
          sidebarOpen ? "w-64" : "w-0 -ml-64 md:w-16 md:ml-0"
        } shrink-0 overflow-hidden`}
        style={{ background: "hsl(207, 80%, 35%)" }}
      >
        {/* Logo */}
        <div className="flex h-16 items-center justify-center border-b border-sidebar-border px-4">
          <BookOpen className="h-7 w-7 text-sidebar-foreground" />
          {sidebarOpen && (
            <span className="ml-2 text-lg font-bold text-sidebar-foreground">MedPrep</span>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-2 py-4">
          {navItems.map((item) => {
            if (item.children) {
              const isExpanded = expandedGroups.includes(item.label);
              return (
                <div key={item.label} className="mb-1">
                  <button
                    onClick={() => toggleGroup(item.label)}
                    className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-sidebar-foreground/80 hover:text-sidebar-foreground"
                    style={{ background: isExpanded ? "hsl(207, 80%, 40%)" : "transparent" }}
                  >
                    <item.icon className="h-4 w-4 shrink-0" />
                    {sidebarOpen && (
                      <>
                        <span className="flex-1 text-left">{item.label}</span>
                        {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                      </>
                    )}
                  </button>
                  {isExpanded && sidebarOpen && (
                    <div className="ml-4 mt-1 space-y-0.5">
                      {item.children.map((child) => {
                        if (child.label === "Performance") {
                          return (
                            <div key={child.label}>
                              <button
                                onClick={() => setPerfExpanded(!perfExpanded)}
                                className={`flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm ${
                                  ["/dashboard/performance", "/dashboard/reports", "/dashboard/graphs"].includes(location.pathname)
                                    ? "font-medium text-sidebar-foreground"
                                    : "text-sidebar-foreground/70 hover:text-sidebar-foreground"
                                }`}
                                style={{
                                  background: ["/dashboard/performance", "/dashboard/reports", "/dashboard/graphs"].includes(location.pathname) ? "hsl(207, 90%, 45%)" : "transparent",
                                }}
                              >
                                <child.icon className="h-4 w-4 shrink-0" />
                                <span className="flex-1 text-left">{child.label}</span>
                                {perfExpanded ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
                              </button>
                              {perfExpanded && (
                                <div className="ml-4 mt-0.5 space-y-0.5">
                                  {performanceChildren.map((pc) => (
                                    <Link
                                      key={pc.to}
                                      to={pc.to}
                                      className={`flex items-center gap-3 rounded-md px-3 py-1.5 text-sm ${
                                        isActive(pc.to)
                                          ? "font-medium text-sidebar-foreground"
                                          : "text-sidebar-foreground/60 hover:text-sidebar-foreground"
                                      }`}
                                      style={{ background: isActive(pc.to) ? "hsl(207, 90%, 45%)" : "transparent" }}
                                    >
                                      <pc.icon className="h-3.5 w-3.5 shrink-0" />
                                      <span>{pc.label}</span>
                                    </Link>
                                  ))}
                                </div>
                              )}
                            </div>
                          );
                        }
                        return (
                          <Link
                            key={child.to}
                            to={child.to}
                            className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm ${
                              isActive(child.to)
                                ? "font-medium text-sidebar-foreground"
                                : "text-sidebar-foreground/70 hover:text-sidebar-foreground"
                            }`}
                            style={{ background: isActive(child.to) ? "hsl(207, 90%, 45%)" : "transparent" }}
                          >
                            <child.icon className="h-4 w-4 shrink-0" />
                            <span>{child.label}</span>
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            }

            return (
              <Link
                key={item.to}
                to={item.to!}
                className={`mb-1 flex items-center gap-3 rounded-md px-3 py-2.5 text-sm ${
                  isActive(item.to!)
                    ? "font-medium text-sidebar-foreground"
                    : "text-sidebar-foreground/80 hover:text-sidebar-foreground"
                }`}
                style={{ background: isActive(item.to!) ? "hsl(207, 90%, 45%)" : "transparent" }}
              >
                <item.icon className="h-4 w-4 shrink-0" />
                {sidebarOpen && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* User info */}
        {sidebarOpen && (
          <div className="border-t border-sidebar-border p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-sidebar-accent">
                <User className="h-4 w-4 text-sidebar-foreground" />
              </div>
              <div className="flex-1 overflow-hidden">
                <p className="truncate text-sm font-medium text-sidebar-foreground">{user.name}</p>
                <p className="truncate text-xs text-sidebar-foreground/60">{user.email}</p>
              </div>
            </div>
          </div>
        )}
      </aside>

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header */}
        <header className="flex h-14 items-center justify-between border-b bg-card px-4">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(!sidebarOpen)}>
              {sidebarOpen ? <X className="h-5 w-5 text-muted-foreground" /> : <Menu className="h-5 w-5 text-muted-foreground" />}
            </button>
            <span className="text-lg font-semibold">Welcome, {user.name}</span>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" asChild>
              <Link to="/">
                <Home className="mr-1 h-4 w-4" /> Home
              </Link>
            </Button>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="mr-1 h-4 w-4" /> Logout
            </Button>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto bg-background p-6">
          <Outlet />
        </main>

        {/* Footer */}
        <footer className="border-t bg-card px-4 py-2 text-center text-xs text-muted-foreground">
          Copyright © MedPrep. All rights reserved.
        </footer>
      </div>
    </div>
  );
}
