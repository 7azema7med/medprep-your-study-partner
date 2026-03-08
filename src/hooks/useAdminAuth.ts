import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

export function useAdminAuth() {
  const { user, loading: authLoading } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminRole, setAdminRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setIsAdmin(false);
      setAdminRole(null);
      setLoading(false);
      return;
    }

    const checkAdmin = async () => {
      const { data } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .in("role", ["super_admin", "admin", "editor", "moderator", "support", "content_manager", "question_reviewer"]);

      if (data && data.length > 0) {
        setIsAdmin(true);
        // Highest priority role
        const priority = ["super_admin", "admin", "editor", "moderator", "content_manager", "question_reviewer", "support"];
        const topRole = priority.find(r => data.some(d => d.role === r));
        setAdminRole(topRole || data[0].role);
      } else {
        setIsAdmin(false);
        setAdminRole(null);
      }
      setLoading(false);
    };

    checkAdmin();
  }, [user, authLoading]);

  return { isAdmin, adminRole, loading, user };
}
