import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { notifyWelcome } from "@/lib/resend";
import { z } from "zod";

const SignupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  fullName: z.string().min(1),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = SignupSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid parameters" }, { status: 400 });
    }

    const { email, password, fullName } = parsed.data;
    const supabase = await createClient();

    // Call Supabase Auth to sign up
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
      },
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // Retrieve the warehouse code from profiles
    // The database trigger public.handle_new_user executes on insert to auth.users,
    // which inserts the profile. We query it using the service role client.
    if (data?.user) {
      const { createServiceClient } = require("@/lib/supabase/server");
      const serviceClient = createServiceClient();

      let warehouseCode = null;
      
      // Retry up to 5 times (total 2.5 seconds) to handle trigger execution latency
      for (let i = 0; i < 5; i++) {
        const { data: profile } = await serviceClient
          .from("profiles")
          .select("warehouse_code")
          .eq("id", data.user.id)
          .maybeSingle();

        if (profile?.warehouse_code) {
          warehouseCode = profile.warehouse_code;
          break;
        }

        await new Promise((resolve) => setTimeout(resolve, 500));
      }

      if (warehouseCode) {
        try {
          await notifyWelcome(email, fullName, warehouseCode);

          const { getEmailSettings, notifyAdminNewCustomerRegistered } = require("@/lib/resend");
          const { adminNotificationEmail } = await getEmailSettings();
          if (adminNotificationEmail) {
            await notifyAdminNewCustomerRegistered(adminNotificationEmail, fullName, email, warehouseCode, null);
          }
        } catch (emailErr) {
          console.error("Failed to send welcome/admin alert email:", emailErr);
          // Don't fail signup if welcome email fails
        }
      } else {
        console.error(`Trigger warning: Warehouse profile not found for user ${data.user.id}`);
      }
    }

    return NextResponse.json({ success: true, session: data.session });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "An unexpected error occurred" }, { status: 500 });
  }
}
