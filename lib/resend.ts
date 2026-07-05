import { Resend } from "resend";

const resendApiKey = process.env.RESEND_API_KEY;
const fromEmail = process.env.RESEND_FROM_EMAIL ?? "notifications@stclogistics.com";

export const resend = resendApiKey ? new Resend(resendApiKey) : null;

interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail({ to, subject, html }: SendEmailParams) {
  if (!resend) {
    console.warn("Resend API key is missing. Skipping email send:", { to, subject });
    return { success: false, warning: "Resend API key not configured" };
  }

  try {
    const { data, error } = await resend.emails.send({
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
