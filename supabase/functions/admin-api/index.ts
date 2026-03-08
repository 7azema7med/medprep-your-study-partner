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
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header");

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Verify the caller is an admin
    const supabaseUser = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: authError } = await supabaseUser.auth.getUser();
    if (authError || !user) throw new Error("Unauthorized");

    const { data: isAdmin } = await supabaseAdmin.rpc("is_admin", { _user_id: user.id });
    if (!isAdmin) throw new Error("Forbidden: Admin access required");

    const url = new URL(req.url);
    const action = url.searchParams.get("action");

    // Route actions
    switch (action) {
      case "list_users": {
        const page = parseInt(url.searchParams.get("page") || "1");
        const perPage = parseInt(url.searchParams.get("per_page") || "50");
        const { data, error } = await supabaseAdmin.auth.admin.listUsers({ page, perPage });
        if (error) throw error;

        // Enrich with roles and profiles
        const userIds = data.users.map(u => u.id);
        const { data: roles } = await supabaseAdmin.from("user_roles").select("*").in("user_id", userIds);
        const { data: profiles } = await supabaseAdmin.from("profiles").select("*").in("user_id", userIds);
        const { data: subs } = await supabaseAdmin.from("subscriptions").select("*").in("user_id", userIds).eq("status", "active");

        const enriched = data.users.map(u => ({
          id: u.id,
          email: u.email,
          username: u.user_metadata?.username || profiles?.find(p => p.user_id === u.id)?.username || "",
          phone: profiles?.find(p => p.user_id === u.id)?.phone || "",
          country: profiles?.find(p => p.user_id === u.id)?.country || "",
          roles: roles?.filter(r => r.user_id === u.id).map(r => r.role) || [],
          has_subscription: subs?.some(s => s.user_id === u.id) || false,
          email_confirmed: !!u.email_confirmed_at,
          created_at: u.created_at,
          last_sign_in_at: u.last_sign_in_at,
          banned: u.banned_until ? true : false,
        }));

        return json({ users: enriched, total: data.total || enriched.length });
      }

      case "get_user": {
        const userId = url.searchParams.get("user_id");
        if (!userId) throw new Error("user_id required");
        const { data: userData, error } = await supabaseAdmin.auth.admin.getUserById(userId);
        if (error) throw error;
        const { data: roles } = await supabaseAdmin.from("user_roles").select("*").eq("user_id", userId);
        const { data: profile } = await supabaseAdmin.from("profiles").select("*").eq("user_id", userId).maybeSingle();
        const { data: subs } = await supabaseAdmin.from("subscriptions").select("*, plans(*)").eq("user_id", userId);
        const { data: logs } = await supabaseAdmin.from("audit_logs").select("*").eq("entity_id", userId).order("created_at", { ascending: false }).limit(20);
        return json({ user: userData.user, profile, roles, subscriptions: subs, audit_logs: logs });
      }

      case "create_user": {
        const body = await req.json();
        const { data: newUser, error } = await supabaseAdmin.auth.admin.createUser({
          email: body.email,
          password: body.password,
          email_confirm: body.email_confirm ?? true,
          user_metadata: { username: body.username },
        });
        if (error) throw error;
        if (body.username) {
          await supabaseAdmin.from("profiles").upsert({ user_id: newUser.user.id, username: body.username, country: body.country, phone: body.phone });
        }
        if (body.role) {
          await supabaseAdmin.from("user_roles").insert({ user_id: newUser.user.id, role: body.role });
        }
        await logAudit(supabaseAdmin, user.id, "create_user", "user", newUser.user.id, null, { email: body.email, role: body.role });
        return json({ user: newUser.user });
      }

      case "update_user": {
        const body = await req.json();
        const updates: any = {};
        if (body.email) updates.email = body.email;
        if (body.password) updates.password = body.password;
        if (body.username) updates.user_metadata = { username: body.username };
        if (body.ban !== undefined) {
          if (body.ban) updates.ban_duration = "876000h"; // ~100 years
          else updates.ban_duration = "none";
        }
        const { data, error } = await supabaseAdmin.auth.admin.updateUserById(body.user_id, updates);
        if (error) throw error;
        if (body.username || body.phone || body.country) {
          await supabaseAdmin.from("profiles").upsert({ user_id: body.user_id, username: body.username, phone: body.phone, country: body.country });
        }
        await logAudit(supabaseAdmin, user.id, "update_user", "user", body.user_id, null, updates);
        return json({ user: data.user });
      }

      case "delete_user": {
        const body = await req.json();
        const { error } = await supabaseAdmin.auth.admin.deleteUser(body.user_id);
        if (error) throw error;
        await logAudit(supabaseAdmin, user.id, "delete_user", "user", body.user_id, null, null);
        return json({ success: true });
      }

      case "assign_role": {
        const body = await req.json();
        await supabaseAdmin.from("user_roles").upsert({ user_id: body.user_id, role: body.role });
        await logAudit(supabaseAdmin, user.id, "assign_role", "user_roles", body.user_id, null, { role: body.role });
        return json({ success: true });
      }

      case "remove_role": {
        const body = await req.json();
        await supabaseAdmin.from("user_roles").delete().eq("user_id", body.user_id).eq("role", body.role);
        await logAudit(supabaseAdmin, user.id, "remove_role", "user_roles", body.user_id, { role: body.role }, null);
        return json({ success: true });
      }

      case "assign_subscription": {
        const body = await req.json();
        const startsAt = new Date();
        const endsAt = new Date(startsAt.getTime() + body.duration_days * 86400000);
        const { data, error } = await supabaseAdmin.from("subscriptions").insert({
          user_id: body.user_id,
          plan_id: body.plan_id,
          starts_at: startsAt.toISOString(),
          ends_at: endsAt.toISOString(),
          status: "active",
          granted_by: user.id,
          source: body.source || "manual",
        }).select().single();
        if (error) throw error;
        await logAudit(supabaseAdmin, user.id, "assign_subscription", "subscriptions", data.id, null, data);
        return json({ subscription: data });
      }

      case "dashboard_stats": {
        const { data: usersData } = await supabaseAdmin.auth.admin.listUsers({ perPage: 1 });
        const totalUsers = usersData?.total || 0;

        const { count: totalQuestions } = await supabaseAdmin.from("questions").select("*", { count: "exact", head: true });
        const { count: totalTests } = await supabaseAdmin.from("tests").select("*", { count: "exact", head: true });
        const { count: totalNotes } = await supabaseAdmin.from("notes").select("*", { count: "exact", head: true });
        const { count: activeRoles } = await supabaseAdmin.from("user_roles").select("*", { count: "exact", head: true }).neq("role", "user");
        const { count: activeCodes } = await supabaseAdmin.from("activation_codes").select("*", { count: "exact", head: true }).eq("is_active", true);
        const { count: activeSubs } = await supabaseAdmin.from("subscriptions").select("*", { count: "exact", head: true }).eq("status", "active");
        const { data: recentLogs } = await supabaseAdmin.from("audit_logs").select("*").order("created_at", { ascending: false }).limit(10);
        const { data: recentLogins } = await supabaseAdmin.from("login_history").select("*").order("created_at", { ascending: false }).limit(10);
        const { count: failedLogins } = await supabaseAdmin.from("login_history").select("*", { count: "exact", head: true }).eq("success", false);

        return json({
          total_users: totalUsers,
          total_questions: totalQuestions || 0,
          total_tests: totalTests || 0,
          total_notes: totalNotes || 0,
          admin_count: activeRoles || 0,
          active_codes: activeCodes || 0,
          active_subscriptions: activeSubs || 0,
          failed_logins: failedLogins || 0,
          recent_audit_logs: recentLogs || [],
          recent_logins: recentLogins || [],
        });
      }

      default:
        throw new Error(`Unknown action: ${action}`);
    }
  } catch (err) {
    const status = err.message?.includes("Forbidden") ? 403 : err.message?.includes("Unauthorized") ? 401 : 400;
    return new Response(JSON.stringify({ error: err.message }), {
      status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

function json(data: any) {
  return new Response(JSON.stringify(data), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

async function logAudit(client: any, actorId: string, action: string, entityType: string, entityId: string, oldValues: any, newValues: any) {
  await client.from("audit_logs").insert({
    actor_id: actorId,
    action,
    entity_type: entityType,
    entity_id: entityId,
    old_values: oldValues,
    new_values: newValues,
  });
}
