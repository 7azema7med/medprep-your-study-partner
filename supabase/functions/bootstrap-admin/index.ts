import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Check if Hazem already exists
    const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers();
    const hazem = existingUsers?.users?.find(u => u.email === "2341interstellar@gmail.com");

    if (hazem) {
      // Ensure role exists
      const { data: existingRole } = await supabaseAdmin
        .from("user_roles")
        .select("id")
        .eq("user_id", hazem.id)
        .eq("role", "super_admin")
        .maybeSingle();

      if (!existingRole) {
        await supabaseAdmin.from("user_roles").insert({ user_id: hazem.id, role: "super_admin" });
      }
      return new Response(JSON.stringify({ message: "Admin already exists", user_id: hazem.id }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Create the super admin user
    // In production, use environment variables: ADMIN_EMAIL, ADMIN_PASSWORD
    const { data: newUser, error } = await supabaseAdmin.auth.admin.createUser({
      email: "2341interstellar@gmail.com",
      password: "1232004",
      email_confirm: true,
      user_metadata: { username: "Hazem", force_password_change: true },
    });

    if (error) throw error;

    // Assign super_admin role
    await supabaseAdmin.from("user_roles").insert({ user_id: newUser.user.id, role: "super_admin" });

    // Create profile
    await supabaseAdmin.from("profiles").upsert({
      user_id: newUser.user.id,
      username: "Hazem",
      country: null,
      phone: null,
    });

    // Log the action
    await supabaseAdmin.from("audit_logs").insert({
      actor_id: newUser.user.id,
      action: "admin_bootstrap",
      entity_type: "user",
      entity_id: newUser.user.id,
      new_values: { email: "hazem@medprep.com", role: "super_admin" },
    });

    return new Response(JSON.stringify({ message: "Super admin created", user_id: newUser.user.id }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
