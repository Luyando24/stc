import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { sendEmail } from "@/lib/resend";
import { z } from "zod";

const SettingsSchema = z.object({
  action: z.enum(["save", "test"]),
  resend_api_key: z.string().optional(),
  resend_from_email: z.string().email().optional(),
  test_recipient: z.string().email().optional(),
});

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Check admin role
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Fetch settings from system_settings
  const { data: dbSettings, error } = await supabase
    .from("system_settings")
    .select("key, value");

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const apiKeyRow = dbSettings?.find((r) => r.key === "resend_api_key");
  const fromEmailRow = dbSettings?.find((r) => r.key === "resend_from_email");

  const rawApiKey = apiKeyRow?.value ?? "";
  const fromEmail = fromEmailRow?.value ?? "";

  // Mask the API Key
  let maskedApiKey = "";
  if (rawApiKey && rawApiKey !== "your_resend_api_key") {
    if (rawApiKey.startsWith("re_") && rawApiKey.length > 10) {
      maskedApiKey = `${rawApiKey.substring(0, 5)}...${rawApiKey.substring(rawApiKey.length - 4)}`;
    } else {
      maskedApiKey = "••••••••••••••••";
    }
  } else {
    maskedApiKey = "your_resend_api_key";
  }

  return NextResponse.json({
    resend_api_key: maskedApiKey,
    resend_from_email: fromEmail,
  });
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Check admin role
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const parsed = SettingsSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid parameters", details: parsed.error.format() }, { status: 400 });
    }

    const { action, resend_api_key, resend_from_email, test_recipient } = parsed.data;

    if (action === "save") {
      // 1. Update from_email if provided
      if (resend_from_email) {
        const { error: err1 } = await supabase
          .from("system_settings")
          .upsert({ key: "resend_from_email", value: resend_from_email, description: "From email address for Resend notifications" });

        if (err1) {
          return NextResponse.json({ error: `Failed to save from email: ${err1.message}` }, { status: 500 });
        }
      }

      // 2. Update api_key if provided and not masked
      if (resend_api_key) {
        const trimmedKey = resend_api_key.trim();
        const isMasked = trimmedKey.includes("...") || trimmedKey.includes("•••") || trimmedKey.includes("•");
        const isPlaceholder = trimmedKey === "your_resend_api_key";

        if (!isMasked && !isPlaceholder && trimmedKey.length > 0) {
          const { error: err2 } = await supabase
            .from("system_settings")
            .upsert({ key: "resend_api_key", value: trimmedKey, description: "API key for Resend email service" });

          if (err2) {
            return NextResponse.json({ error: `Failed to save API key: ${err2.message}` }, { status: 500 });
          }
        }
      }

      return NextResponse.json({ success: true, message: "Settings saved successfully" });
    }

    if (action === "test") {
      if (!test_recipient) {
        return NextResponse.json({ error: "Recipient email is required for testing" }, { status: 400 });
      }

      const subject = "STC Logistics - Resend Integration Test";
      const html = `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff; color: #1e293b;">
          <h2 style="color: #2563eb; margin-top: 0;">Test Email Successful!</h2>
          <p>Hello,</p>
          <p>This is a test email verifying that your Resend email integration with the <strong>STC Logistics Admin Dashboard</strong> is configured correctly and fully operational.</p>
          <p>Sent at: <strong>${new Date().toLocaleString()}</strong></p>
          <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
          <p style="font-size: 12px; color: #64748b; margin-bottom: 0;">STC Logistics Admin Portal Settings</p>
        </div>
      `;

      const result = await sendEmail({
        to: test_recipient,
        subject,
        html,
      });

      if (!result.success) {
        return NextResponse.json({
          error: "Failed to send test email",
          details: result.error || result.warning,
        }, { status: 400 });
      }

      return NextResponse.json({ success: true, message: `Test email sent successfully to ${test_recipient}` });
    }

    return NextResponse.json({ error: "Unsupported action" }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "An unexpected error occurred" }, { status: 500 });
  }
}
