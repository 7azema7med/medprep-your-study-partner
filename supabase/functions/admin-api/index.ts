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

    switch (action) {
      // ─── USER MANAGEMENT ──────────────────────────────────────
      case "list_users": {
        const page = parseInt(url.searchParams.get("page") || "1");
        const perPage = parseInt(url.searchParams.get("per_page") || "50");
        const { data, error } = await supabaseAdmin.auth.admin.listUsers({ page, perPage });
        if (error) throw error;

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
        const { data: loginHistory } = await supabaseAdmin.from("login_history").select("*").eq("user_id", userId).order("created_at", { ascending: false }).limit(20);
        return json({ user: userData.user, profile, roles, subscriptions: subs, audit_logs: logs, login_history: loginHistory });
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
        if (body.role && body.role !== "user") {
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
          if (body.ban) updates.ban_duration = "876000h";
          else updates.ban_duration = "none";
        }
        const { data, error } = await supabaseAdmin.auth.admin.updateUserById(body.user_id, updates);
        if (error) throw error;
        if (body.username || body.phone || body.country) {
          await supabaseAdmin.from("profiles").upsert({ user_id: body.user_id, username: body.username || undefined, phone: body.phone, country: body.country });
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

      case "force_logout": {
        const body = await req.json();
        await supabaseAdmin.auth.admin.signOut(body.user_id);
        await logAudit(supabaseAdmin, user.id, "force_logout", "user", body.user_id, null, null);
        return json({ success: true });
      }

      // ─── ROLES ────────────────────────────────────────────────
      case "assign_role": {
        const body = await req.json();
        // Prevent non-super_admin from assigning super_admin
        if (body.role === "super_admin") {
          const { data: callerRole } = await supabaseAdmin.from("user_roles").select("role").eq("user_id", user.id).eq("role", "super_admin").maybeSingle();
          if (!callerRole) throw new Error("Forbidden: Only super_admin can assign super_admin role");
        }
        await supabaseAdmin.from("user_roles").upsert({ user_id: body.user_id, role: body.role }, { onConflict: "user_id,role" });
        await logAudit(supabaseAdmin, user.id, "assign_role", "user_roles", body.user_id, null, { role: body.role });
        return json({ success: true });
      }

      case "remove_role": {
        const body = await req.json();
        if (body.role === "super_admin") {
          const { data: callerRole } = await supabaseAdmin.from("user_roles").select("role").eq("user_id", user.id).eq("role", "super_admin").maybeSingle();
          if (!callerRole) throw new Error("Forbidden: Only super_admin can remove super_admin role");
        }
        await supabaseAdmin.from("user_roles").delete().eq("user_id", body.user_id).eq("role", body.role);
        await logAudit(supabaseAdmin, user.id, "remove_role", "user_roles", body.user_id, { role: body.role }, null);
        return json({ success: true });
      }

      // ─── SUBSCRIPTIONS ────────────────────────────────────────
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

      case "revoke_subscription": {
        const body = await req.json();
        const { data: oldSub } = await supabaseAdmin.from("subscriptions").select("*").eq("id", body.subscription_id).single();
        const { error } = await supabaseAdmin.from("subscriptions").update({ status: "revoked" }).eq("id", body.subscription_id);
        if (error) throw error;
        await logAudit(supabaseAdmin, user.id, "revoke_subscription", "subscriptions", body.subscription_id, oldSub, { status: "revoked" });
        return json({ success: true });
      }

      // ─── QUESTIONS (admin CRUD via service role) ──────────────
      case "create_question": {
        const body = await req.json();
        const { data: q, error } = await supabaseAdmin.from("questions").insert({
          question_text: body.question_text,
          explanation: body.explanation || null,
          difficulty: body.difficulty || "medium",
          subject_id: body.subject_id || null,
        }).select().single();
        if (error) throw error;
        if (body.choices?.length) {
          await supabaseAdmin.from("answer_choices").insert(
            body.choices.map((c: any) => ({ ...c, question_id: q.id }))
          );
        }
        await logAudit(supabaseAdmin, user.id, "create_question", "questions", q.id, null, { question_text: body.question_text?.slice(0, 100) });
        return json({ question: q });
      }

      case "update_question": {
        const body = await req.json();
        const { data: old } = await supabaseAdmin.from("questions").select("*").eq("id", body.id).single();
        const { error } = await supabaseAdmin.from("questions").update({
          question_text: body.question_text,
          explanation: body.explanation,
          difficulty: body.difficulty,
          subject_id: body.subject_id || null,
        }).eq("id", body.id);
        if (error) throw error;
        if (body.choices) {
          await supabaseAdmin.from("answer_choices").delete().eq("question_id", body.id);
          await supabaseAdmin.from("answer_choices").insert(
            body.choices.map((c: any) => ({ ...c, question_id: body.id }))
          );
        }
        await logAudit(supabaseAdmin, user.id, "update_question", "questions", body.id, { difficulty: old?.difficulty }, { difficulty: body.difficulty });
        return json({ success: true });
      }

      case "delete_question": {
        const body = await req.json();
        await supabaseAdmin.from("answer_choices").delete().eq("question_id", body.question_id);
        await supabaseAdmin.from("questions").delete().eq("id", body.question_id);
        await logAudit(supabaseAdmin, user.id, "delete_question", "questions", body.question_id, null, null);
        return json({ success: true });
      }

      case "bulk_delete_questions": {
        const body = await req.json();
        for (const qId of body.question_ids) {
          await supabaseAdmin.from("answer_choices").delete().eq("question_id", qId);
          await supabaseAdmin.from("questions").delete().eq("id", qId);
        }
        await logAudit(supabaseAdmin, user.id, "bulk_delete_questions", "questions", null, null, { count: body.question_ids.length });
        return json({ success: true, deleted: body.question_ids.length });
      }

      case "import_questions": {
        const body = await req.json();
        const results = { success: 0, errors: [] as any[] };
        for (let i = 0; i < body.questions.length; i++) {
          const q = body.questions[i];
          try {
            if (!q.question_text?.trim()) throw new Error("Empty question text");
            if (!q.choices?.length || !q.choices.some((c: any) => c.is_correct)) throw new Error("No correct answer");
            const { data: newQ, error } = await supabaseAdmin.from("questions").insert({
              question_text: q.question_text,
              explanation: q.explanation || null,
              difficulty: q.difficulty || "medium",
              subject_id: q.subject_id || null,
            }).select().single();
            if (error) throw error;
            await supabaseAdmin.from("answer_choices").insert(
              q.choices.map((c: any) => ({ choice_letter: c.choice_letter, choice_text: c.choice_text, is_correct: c.is_correct, explanation: c.explanation || null, question_id: newQ.id }))
            );
            results.success++;
          } catch (e: any) {
            results.errors.push({ row: i + 1, error: e.message, question: q.question_text?.slice(0, 80) });
          }
        }
        await logAudit(supabaseAdmin, user.id, "import_questions", "questions", null, null, { total: body.questions.length, success: results.success, errors: results.errors.length });
        return json(results);
      }

      // ─── NOTES (admin CRUD via service role) ──────────────────
      case "delete_note": {
        const body = await req.json();
        await supabaseAdmin.from("notes").delete().eq("id", body.note_id);
        await logAudit(supabaseAdmin, user.id, "delete_note", "notes", body.note_id, null, null);
        return json({ success: true });
      }

      // ─── EXAMS (admin delete via service role) ────────────────
      case "delete_test": {
        const body = await req.json();
        await supabaseAdmin.from("test_questions").delete().eq("test_id", body.test_id);
        await supabaseAdmin.from("tests").delete().eq("id", body.test_id);
        await logAudit(supabaseAdmin, user.id, "delete_test", "tests", body.test_id, null, null);
        return json({ success: true });
      }

      // ─── ACTIVATION CODES ─────────────────────────────────────
      case "batch_generate_codes": {
        const body = await req.json();
        const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
        const codes = [];
        for (let i = 0; i < (body.count || 1); i++) {
          let code = (body.prefix || "MEDPREP") + "-";
          for (let j = 0; j < 8; j++) code += chars[Math.floor(Math.random() * chars.length)];
          codes.push({
            code,
            duration_days: body.duration_days || 30,
            max_uses: body.max_uses || 1,
            plan_id: body.plan_id || null,
            is_active: true,
            created_by: user.id,
          });
        }
        const { data, error } = await supabaseAdmin.from("activation_codes").insert(codes).select();
        if (error) throw error;
        await logAudit(supabaseAdmin, user.id, "batch_generate_codes", "activation_codes", null, null, { count: codes.length });
        return json({ codes: data });
      }

      // ─── SETTINGS (admin CRUD via service role) ───────────────
      case "update_settings": {
        const body = await req.json();
        for (const [key, value] of Object.entries(body.settings)) {
          await supabaseAdmin.from("site_settings").update({ value: value as string, updated_at: new Date().toISOString() }).eq("key", key);
        }
        await logAudit(supabaseAdmin, user.id, "update_settings", "site_settings", null, null, { keys: Object.keys(body.settings) });
        return json({ success: true });
      }

      // ─── SUBJECTS (admin CRUD) ────────────────────────────────
      case "create_subject": {
        const body = await req.json();
        const { data, error } = await supabaseAdmin.from("subjects").insert({ name: body.name, category: body.category || "subject" }).select().single();
        if (error) throw error;
        return json({ subject: data });
      }

      case "update_subject": {
        const body = await req.json();
        const { error } = await supabaseAdmin.from("subjects").update({ name: body.name, category: body.category }).eq("id", body.id);
        if (error) throw error;
        return json({ success: true });
      }

      case "delete_subject": {
        const body = await req.json();
        const { error } = await supabaseAdmin.from("subjects").delete().eq("id", body.id);
        if (error) throw error;
        return json({ success: true });
      }

      // ─── DASHBOARD STATS ──────────────────────────────────────
      case "dashboard_stats": {
        const { data: usersData } = await supabaseAdmin.auth.admin.listUsers({ perPage: 1 });
        const totalUsers = usersData?.total || 0;

        const { count: totalQuestions } = await supabaseAdmin.from("questions").select("*", { count: "exact", head: true });
        const { count: totalTests } = await supabaseAdmin.from("tests").select("*", { count: "exact", head: true });
        const { count: totalNotes } = await supabaseAdmin.from("notes").select("*", { count: "exact", head: true });
        const { count: adminCount } = await supabaseAdmin.from("user_roles").select("*", { count: "exact", head: true }).neq("role", "user");
        const { count: activeCodes } = await supabaseAdmin.from("activation_codes").select("*", { count: "exact", head: true }).eq("is_active", true);
        const { count: usedCodes } = await supabaseAdmin.from("activation_codes").select("*", { count: "exact", head: true }).gt("used_count", 0);
        const { count: activeSubs } = await supabaseAdmin.from("subscriptions").select("*", { count: "exact", head: true }).eq("status", "active");
        const { data: recentLogs } = await supabaseAdmin.from("audit_logs").select("*").order("created_at", { ascending: false }).limit(15);
        const { data: recentLogins } = await supabaseAdmin.from("login_history").select("*").order("created_at", { ascending: false }).limit(15);
        const { count: failedLogins } = await supabaseAdmin.from("login_history").select("*", { count: "exact", head: true }).eq("success", false);
        const { count: totalSubjects } = await supabaseAdmin.from("subjects").select("*", { count: "exact", head: true });

        // Get banned users count
        const { data: allUsers } = await supabaseAdmin.auth.admin.listUsers({ perPage: 1000 });
        const bannedCount = allUsers?.users?.filter(u => u.banned_until)?.length || 0;

        return json({
          total_users: totalUsers,
          total_questions: totalQuestions || 0,
          total_tests: totalTests || 0,
          total_notes: totalNotes || 0,
          admin_count: adminCount || 0,
          active_codes: activeCodes || 0,
          used_codes: usedCodes || 0,
          active_subscriptions: activeSubs || 0,
          failed_logins: failedLogins || 0,
          recent_audit_logs: recentLogs || [],
          recent_logins: recentLogins || [],
          total_subjects: totalSubjects || 0,
          banned_users: bannedCount,
        });
      }

      // ─── ANALYTICS ────────────────────────────────────────────
      case "analytics": {
        const { count: totalQuestions } = await supabaseAdmin.from("questions").select("*", { count: "exact", head: true });
        const { count: totalTests } = await supabaseAdmin.from("tests").select("*", { count: "exact", head: true });
        const { count: completedTests } = await supabaseAdmin.from("tests").select("*", { count: "exact", head: true }).eq("status", "completed");
        const { count: totalNotes } = await supabaseAdmin.from("notes").select("*", { count: "exact", head: true });
        const { count: activeSubs } = await supabaseAdmin.from("subscriptions").select("*", { count: "exact", head: true }).eq("status", "active");
        const { count: activeCodes } = await supabaseAdmin.from("activation_codes").select("*", { count: "exact", head: true }).eq("is_active", true);

        // Subject distribution
        const { data: subjects } = await supabaseAdmin.from("subjects").select("name, question_count").order("question_count", { ascending: false }).limit(15);

        // Difficulty distribution
        const { data: easyQ } = await supabaseAdmin.from("questions").select("id", { count: "exact", head: true }).eq("difficulty", "easy");
        const { data: medQ } = await supabaseAdmin.from("questions").select("id", { count: "exact", head: true }).eq("difficulty", "medium");
        const { data: hardQ } = await supabaseAdmin.from("questions").select("id", { count: "exact", head: true }).eq("difficulty", "hard");

        // Recent tests with scores
        const { data: recentTests } = await supabaseAdmin.from("tests").select("score, created_at, status").order("created_at", { ascending: false }).limit(50);

        return json({
          total_questions: totalQuestions || 0,
          total_tests: totalTests || 0,
          completed_tests: completedTests || 0,
          total_notes: totalNotes || 0,
          active_subscriptions: activeSubs || 0,
          active_codes: activeCodes || 0,
          subjects: subjects || [],
          recent_tests: recentTests || [],
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

async function logAudit(client: any, actorId: string, action: string, entityType: string, entityId: string | null, oldValues: any, newValues: any) {
  await client.from("audit_logs").insert({
    actor_id: actorId,
    action,
    entity_type: entityType,
    entity_id: entityId,
    old_values: oldValues,
    new_values: newValues,
  });
}
