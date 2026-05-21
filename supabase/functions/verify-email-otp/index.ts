import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.41.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const OTP_MAX_ATTEMPTS = 5;
const OTP_PURPOSE = "email_login";
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const jsonResponse = (body: Record<string, unknown>, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
    },
  });

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { email, token } = await req.json();
    const normalizedEmail = typeof email === "string" ? email.trim().toLowerCase() : "";
    const normalizedToken = typeof token === "string" ? token.trim() : "";

    if (!emailRegex.test(normalizedEmail)) {
      return jsonResponse({ error: "Please enter a valid email address." }, 400);
    }

    if (!/^\d{6}$/.test(normalizedToken)) {
      return jsonResponse({ error: "Please enter the 6-digit OTP." }, 400);
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

    if (!supabaseUrl || !serviceRoleKey) {
      throw new Error("Supabase server credentials are not configured.");
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey);
    const nowIso = new Date().toISOString();

    const { data: existingMember, error: existingMemberError } = await supabase
      .from("offline_members")
      .select("phone_number, email_verified_at")
      .eq("email", normalizedEmail)
      .not("email_verified_at", "is", null)
      .limit(1)
      .maybeSingle();

    if (existingMemberError) {
      throw existingMemberError;
    }

    if (existingMember) {
      return jsonResponse(
        {
          error: "This email has already used its offline offer access. Only one verified use is allowed per email.",
          code: "email_already_used",
        },
        409,
      );
    }

    const { data: otpRecord, error: otpError } = await supabase
      .from("email_otp_codes")
      .select("id, otp_code, expires_at, attempt_count")
      .eq("email", normalizedEmail)
      .eq("purpose", OTP_PURPOSE)
      .is("consumed_at", null)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (otpError) {
      throw otpError;
    }

    if (!otpRecord) {
      return jsonResponse(
        {
          error: "No active OTP found. Please request a new code.",
          code: "otp_missing",
        },
        400,
      );
    }

    if (new Date(otpRecord.expires_at).getTime() < Date.now()) {
      await supabase
        .from("email_otp_codes")
        .update({ consumed_at: nowIso })
        .eq("id", otpRecord.id);

      return jsonResponse(
        {
          error: "OTP expired. Resend OTP.",
          code: "otp_expired",
        },
        400,
      );
    }

    if ((otpRecord.attempt_count ?? 0) >= OTP_MAX_ATTEMPTS) {
      await supabase
        .from("email_otp_codes")
        .update({ consumed_at: nowIso })
        .eq("id", otpRecord.id);

      return jsonResponse(
        {
          error: "Too many wrong attempts. Please request a new code.",
          code: "otp_attempts_exceeded",
        },
        429,
      );
    }

    if (otpRecord.otp_code !== normalizedToken) {
      const nextAttemptCount = (otpRecord.attempt_count ?? 0) + 1;
      await supabase
        .from("email_otp_codes")
        .update({
          attempt_count: nextAttemptCount,
          consumed_at: nextAttemptCount >= OTP_MAX_ATTEMPTS ? nowIso : null,
        })
        .eq("id", otpRecord.id);

      return jsonResponse(
        {
          error: "Invalid OTP. Please try again.",
          code: "otp_invalid",
          attempts_left: Math.max(OTP_MAX_ATTEMPTS - nextAttemptCount, 0),
        },
        400,
      );
    }

    const { error: consumeError } = await supabase
      .from("email_otp_codes")
      .update({
        attempt_count: (otpRecord.attempt_count ?? 0) + 1,
        verified_at: nowIso,
        consumed_at: nowIso,
      })
      .eq("id", otpRecord.id);

    if (consumeError) {
      throw consumeError;
    }

    return jsonResponse({
      success: true,
      email: normalizedEmail,
      verified_at: nowIso,
    });
  } catch (error) {
    console.error("verify-email-otp failed", error);
    return jsonResponse(
      {
        error: error instanceof Error ? error.message : "Failed to verify OTP.",
      },
      400,
    );
  }
});
