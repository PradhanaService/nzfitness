import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.41.1";
import nodemailer from "npm:nodemailer@6.10.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const OTP_EXPIRY_MINUTES = 10;
const OTP_RESEND_COOLDOWN_SECONDS = 60;
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

const generateOtp = () => Math.floor(100000 + Math.random() * 900000).toString();

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { email } = await req.json();
    const normalizedEmail = typeof email === "string" ? email.trim().toLowerCase() : "";

    if (!emailRegex.test(normalizedEmail)) {
      return jsonResponse({ error: "Please enter a valid email address." }, 400);
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    const smtpUser = Deno.env.get("SMTP_GMAIL_USER") ?? "";
    const smtpPass = Deno.env.get("SMTP_GMAIL_APP_PASSWORD") ?? "";
    const smtpFromName = Deno.env.get("SMTP_FROM_NAME") ?? "NOIZE Fitness";

    if (!supabaseUrl || !serviceRoleKey) {
      throw new Error("Supabase server credentials are not configured.");
    }

    if (!smtpUser || !smtpPass) {
      throw new Error("Gmail SMTP credentials are not configured.");
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey);
    const now = new Date();
    const cooldownThreshold = new Date(now.getTime() - OTP_RESEND_COOLDOWN_SECONDS * 1000).toISOString();

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

    const { data: recentOtp, error: recentOtpError } = await supabase
      .from("email_otp_codes")
      .select("created_at")
      .eq("email", normalizedEmail)
      .eq("purpose", OTP_PURPOSE)
      .is("consumed_at", null)
      .gte("created_at", cooldownThreshold)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (recentOtpError) {
      throw recentOtpError;
    }

    if (recentOtp) {
      return jsonResponse(
        {
          error: "Too many email requests. Please wait 1 minute and try again.",
          code: "otp_rate_limit",
        },
        429,
      );
    }

    const otp = generateOtp();
    const expiresAt = new Date(now.getTime() + OTP_EXPIRY_MINUTES * 60 * 1000).toISOString();

    await supabase
      .from("email_otp_codes")
      .update({
        consumed_at: now.toISOString(),
      })
      .eq("email", normalizedEmail)
      .eq("purpose", OTP_PURPOSE)
      .is("consumed_at", null);

    const { data: insertedOtp, error: insertError } = await supabase
      .from("email_otp_codes")
      .insert({
        email: normalizedEmail,
        purpose: OTP_PURPOSE,
        otp_code: otp,
        expires_at: expiresAt,
      })
      .select("id")
      .single();

    if (insertError) {
      throw insertError;
    }

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    });

    try {
      await transporter.sendMail({
        from: `"${smtpFromName}" <${smtpUser}>`,
        to: normalizedEmail,
        subject: "Your NOIZE verification OTP",
        text: `Your NOIZE verification code is ${otp}. It expires in ${OTP_EXPIRY_MINUTES} minutes.`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 520px; margin: 0 auto; color: #111827;">
            <h2 style="margin-bottom: 12px;">NOIZE verification code</h2>
            <p style="font-size: 15px; line-height: 1.6;">Use the OTP below to continue your NOIZE sign-in.</p>
            <div style="margin: 24px 0; padding: 18px; border-radius: 14px; background: #f3f4f6; text-align: center; font-size: 32px; font-weight: 700; letter-spacing: 8px;">
              ${otp}
            </div>
            <p style="font-size: 14px; line-height: 1.6;">This code expires in ${OTP_EXPIRY_MINUTES} minutes. If you did not request it, you can ignore this email.</p>
          </div>
        `,
      });
    } catch (mailError) {
      await supabase.from("email_otp_codes").delete().eq("id", insertedOtp.id);
      throw mailError;
    }

    return jsonResponse({
      success: true,
      message: "Verification OTP sent successfully.",
    });
  } catch (error) {
    console.error("send-email-otp failed", error);
    return jsonResponse(
      {
        error: error instanceof Error ? error.message : "Failed to send OTP.",
      },
      400,
    );
  }
});
