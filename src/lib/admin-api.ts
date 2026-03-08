import { supabase } from "@/integrations/supabase/client";

async function callAdminApi(action: string, params?: Record<string, string>, body?: any) {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error("Not authenticated");

  const searchParams = new URLSearchParams({ action, ...params });
  
  const options: RequestInit = {
    method: body ? "POST" : "GET",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${session.access_token}`,
      "apikey": import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
    },
  };
  if (body) options.body = JSON.stringify(body);

  const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-api?${searchParams}`;
  const res = await fetch(url, options);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Admin API error");
  return data;
}

export const adminApi = {
  getDashboardStats: () => callAdminApi("dashboard_stats"),
  listUsers: (page = 1, perPage = 50) => callAdminApi("list_users", { page: String(page), per_page: String(perPage) }),
  getUser: (userId: string) => callAdminApi("get_user", { user_id: userId }),
  createUser: (data: any) => callAdminApi("create_user", {}, data),
  updateUser: (data: any) => callAdminApi("update_user", {}, data),
  deleteUser: (userId: string) => callAdminApi("delete_user", {}, { user_id: userId }),
  assignRole: (userId: string, role: string) => callAdminApi("assign_role", {}, { user_id: userId, role }),
  removeRole: (userId: string, role: string) => callAdminApi("remove_role", {}, { user_id: userId, role }),
  assignSubscription: (data: any) => callAdminApi("assign_subscription", {}, data),
  bootstrapAdmin: async () => {
    const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/bootstrap-admin`;
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "apikey": import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
      },
    });
    return res.json();
  },
};
