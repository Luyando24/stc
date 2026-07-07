import { Resend } from "resend";
import { createClient } from "@supabase/supabase-js";

export async function getEmailSettings() {
  const ENV_RESEND_API_KEY = process.env.RESEND_API_KEY;
  const ENV_FROM_EMAIL = process.env.RESEND_FROM_EMAIL ?? "notifications@stclogistics.com";

  let apiKey = ENV_RESEND_API_KEY;
  let fromEmail = ENV_FROM_EMAIL;

  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder-project.supabase.co";
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "placeholder-service-role-key";
    const supabase = createClient(supabaseUrl, serviceRoleKey);
    
    const { data: dbSettings, error } = await supabase
      .from("system_settings")
      .select("key, value");

    if (!error && dbSettings) {
      const apiKeyRow = dbSettings.find((r: any) => r.key === "resend_api_key");
      const fromEmailRow = dbSettings.find((r: any) => r.key === "resend_from_email");

      if (apiKeyRow && apiKeyRow.value && apiKeyRow.value !== "your_resend_api_key") {
        apiKey = apiKeyRow.value;
      }
      if (fromEmailRow && fromEmailRow.value && fromEmailRow.value !== "notifications@stclogistics.com") {
        fromEmail = fromEmailRow.value;
      }
    }
  } catch (err) {
    console.error("Failed to fetch email settings from DB, using env variables:", err);
  }

  return { apiKey, fromEmail };
}

interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail({ to, subject, html }: SendEmailParams) {
  const { apiKey, fromEmail } = await getEmailSettings();

  if (!apiKey || apiKey === "your_resend_api_key") {
    console.warn("Resend API key is missing or placeholder. Skipping email send:", { to, subject });
    return { success: false, warning: "Resend API key not configured" };
  }

  try {
    const resendClient = new Resend(apiKey);
    const { data, error } = await resendClient.emails.send({
      from: `STC Logistics <${fromEmail}>`,
      to,
      subject,
      html,
    });

    if (error) {
      console.error("Resend API Error:", error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (error) {
    console.error("Error sending email via Resend:", error);
    return { success: false, error };
  }
}


/**
 * ── Notification Templates ───────────────────────────────────────
 */

export async function notifyParcelArrived(email: string, fullName: string, localTrackingNumber: string) {
  const subject = `Parcel Arrived at China Warehouse: ${localTrackingNumber}`;
  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #1e293b;">
      <h2 style="color: #2563eb;">Parcel Received!</h2>
      <p>Hello ${fullName || "Customer"},</p>
      <p>Your parcel with China tracking number <strong>${localTrackingNumber}</strong> has physically arrived at our consolidation warehouse in China.</p>
      <p>Our team is inspecting and weighting the parcel. You can now view it in your dashboard and request consolidation or shipment when ready.</p>
      <div style="margin: 24px 0;">
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">Go to Dashboard</a>
      </div>
      <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
      <p style="font-size: 12px; color: #64748b;">STC Logistics · China to Africa Freight Forwarding</p>
    </div>
  `;

  return sendEmail({ to: email, subject, html });
}

export async function notifyShipmentBooked(
  email: string,
  fullName: string,
  stcTrackingNumber: string,
  mode: string,
  destination: string
) {
  const subject = `Shipment Booked: ${stcTrackingNumber}`;
  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #1e293b;">
      <h2 style="color: #2563eb;">Shipment Booked &amp; Consolidated</h2>
      <p>Hello ${fullName || "Customer"},</p>
      <p>Your shipment <strong>${stcTrackingNumber}</strong> has been successfully booked for <strong>${mode} freight</strong> to <strong>${destination}</strong>.</p>
      <p>You can track the live status and journey of your shipment directly on our website using your STC tracking number.</p>
      <div style="margin: 24px 0;">
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/track?q=${stcTrackingNumber}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">Track Shipment</a>
      </div>
      <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
      <p style="font-size: 12px; color: #64748b;">STC Logistics · China to Africa Freight Forwarding</p>
    </div>
  `;

  return sendEmail({ to: email, subject, html });
}

export async function notifyShipmentStatusChanged(
  email: string,
  fullName: string,
  stcTrackingNumber: string,
  status: string
) {
  const statusLabel = status.replace(/_/g, " ").toUpperCase();
  const subject = `Shipment Update: ${stcTrackingNumber} is now ${statusLabel}`;
  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #1e293b;">
      <h2 style="color: #2563eb;">Shipment Status Update</h2>
      <p>Hello ${fullName || "Customer"},</p>
      <p>The status of your shipment <strong>${stcTrackingNumber}</strong> has changed to <strong>${statusLabel}</strong>.</p>
      <div style="margin: 24px 0;">
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/track?q=${stcTrackingNumber}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">Track Live Journey</a>
      </div>
      <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
      <p style="font-size: 12px; color: #64748b;">STC Logistics · China to Africa Freight Forwarding</p>
    </div>
  `;

  return sendEmail({ to: email, subject, html });
}

export async function notifyWelcome(
  email: string,
  fullName: string,
  warehouseCode: string
) {
  const subject = `Welcome to STC Logistics! Your China Warehouse Code: ${warehouseCode}`;
  const address = "广东省广州市越秀区环市西路202号之三美博运动城902";
  const phone = "+86 13434313227";
  const consignee = `STC / ${warehouseCode}`;

  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #1e293b; line-height: 1.6;">
      <h2 style="color: #2563eb; margin-bottom: 8px;">Welcome to STC Logistics!</h2>
      <p style="font-size: 16px; margin-top: 0;">Hello ${fullName || "Customer"},</p>
      <p>Thank you for signing up with STC Logistics. We are excited to help you ship your cargo from China to Africa by air and sea!</p>
      
      <!-- Warehouse Code Box -->
      <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; margin: 24px 0;">
        <h3 style="margin-top: 0; color: #0f172a; font-size: 14px; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 8px;">Your Unique Warehouse Code</h3>
        <div style="font-family: monospace; font-size: 24px; font-weight: bold; color: #2563eb; letter-spacing: 1px; margin: 12px 0 6px 0;">
          ${warehouseCode}
        </div>
        <p style="font-size: 12px; color: #64748b; margin: 0;">Provide this code to your Chinese suppliers so we can identify and consolidate your packages.</p>
      </div>

      <!-- Shipping Address Box -->
      <div style="border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; margin: 24px 0; background-color: #ffffff;">
        <h3 style="margin-top: 0; color: #0f172a; font-size: 14px; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 12px;">Your China Shipping Address</h3>
        
        <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
          <tr>
            <td style="padding: 6px 0; color: #64748b; font-weight: 500; width: 140px; vertical-align: top;">收货人 (Consignee):</td>
            <td style="padding: 6px 0; font-family: monospace; font-weight: bold; color: #0f172a; vertical-align: top;">${consignee}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #64748b; font-weight: 500; vertical-align: top;">电话 (Phone):</td>
            <td style="padding: 6px 0; font-family: monospace; font-weight: bold; color: #0f172a; vertical-align: top;">${phone}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #64748b; font-weight: 500; vertical-align: top;">收货地址 (Address):</td>
            <td style="padding: 6px 0; font-family: sans-serif; color: #0f172a; font-weight: bold; vertical-align: top; line-height: 1.4;">
              ${address} <span style="color: #2563eb; font-family: monospace;">(${warehouseCode})</span>
            </td>
          </tr>
        </table>
      </div>

      <!-- How it works -->
      <div style="margin: 24px 0;">
        <h3 style="color: #0f172a; font-size: 16px; margin-bottom: 12px;">How to Ship with Us</h3>
        <ol style="padding-left: 20px; margin: 0; font-size: 14px; color: #334155;">
          <li style="margin-bottom: 8px;"><strong>Shop Online:</strong> Buy goods on Taobao, 1688, or from your supplier, and use the shipping address above at checkout.</li>
          <li style="margin-bottom: 8px;"><strong>Submit Pre-Alert:</strong> When your supplier ships the parcel, log in and submit the courier tracking number in your dashboard.</li>
          <li style="margin-bottom: 8px;"><strong>Consolidate &amp; Ship:</strong> Once your parcels arrive at our warehouse, select them and request air or sea freight to Africa.</li>
          <li style="margin-bottom: 8px;"><strong>Track:</strong> Track your shipment's journey directly on our website using your STC Tracking Number.</li>
        </ol>
      </div>

      <div style="margin: 32px 0 16px 0; text-align: center;">
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block; text-align: center;">Go to Dashboard</a>
      </div>

      <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
      <p style="font-size: 12px; color: #64748b; text-align: center; margin: 0;">STC Logistics · China to Africa Freight Forwarding</p>
    </div>
  `;

  return sendEmail({ to: email, subject, html });
}

