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
  // Dashboard
  getDashboardStats: () => callAdminApi("dashboard_stats"),
  getAnalytics: () => callAdminApi("analytics"),

  // Users
  listUsers: (page = 1, perPage = 50) => callAdminApi("list_users", { page: String(page), per_page: String(perPage) }),
  getUser: (userId: string) => callAdminApi("get_user", { user_id: userId }),
  createUser: (data: any) => callAdminApi("create_user", {}, data),
  updateUser: (data: any) => callAdminApi("update_user", {}, data),
  deleteUser: (userId: string) => callAdminApi("delete_user", {}, { user_id: userId }),
  forceLogout: (userId: string) => callAdminApi("force_logout", {}, { user_id: userId }),

  // Roles
  assignRole: (userId: string, role: string) => callAdminApi("assign_role", {}, { user_id: userId, role }),
  removeRole: (userId: string, role: string) => callAdminApi("remove_role", {}, { user_id: userId, role }),

  // Subscriptions
  assignSubscription: (data: any) => callAdminApi("assign_subscription", {}, data),
  revokeSubscription: (subscriptionId: string) => callAdminApi("revoke_subscription", {}, { subscription_id: subscriptionId }),

  // Questions
  createQuestion: (data: any) => callAdminApi("create_question", {}, data),
  updateQuestion: (data: any) => callAdminApi("update_question", {}, data),
  deleteQuestion: (questionId: string) => callAdminApi("delete_question", {}, { question_id: questionId }),
  bulkDeleteQuestions: (ids: string[]) => callAdminApi("bulk_delete_questions", {}, { question_ids: ids }),
  importQuestions: (questions: any[]) => callAdminApi("import_questions", {}, { questions }),

  // Notes
  deleteNote: (noteId: string) => callAdminApi("delete_note", {}, { note_id: noteId }),

  // Exams
  deleteTest: (testId: string) => callAdminApi("delete_test", {}, { test_id: testId }),

  // Activation Codes
  batchGenerateCodes: (data: any) => callAdminApi("batch_generate_codes", {}, data),

  // Settings
  updateSettings: (settings: Record<string, string>) => callAdminApi("update_settings", {}, { settings }),

  // Subjects
  createSubject: (data: any) => callAdminApi("create_subject", {}, data),
  updateSubject: (data: any) => callAdminApi("update_subject", {}, data),
  deleteSubject: (id: string) => callAdminApi("delete_subject", {}, { id }),

  // Bootstrap
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
