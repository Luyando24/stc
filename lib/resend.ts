import { Resend } from "resend";
import { createClient } from "@supabase/supabase-js";

export function getAppUrl() {
  const envUrl = process.env.NEXT_PUBLIC_APP_URL;
  if (envUrl && !envUrl.includes("localhost")) {
    return envUrl.replace(/\/$/, "");
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`.replace(/\/$/, "");
  }
  return "https://stc-logistics.com";
}

export async function getEmailSettings() {
  const ENV_RESEND_API_KEY = process.env.RESEND_API_KEY;
  const ENV_FROM_EMAIL = process.env.RESEND_FROM_EMAIL ?? "notifications@stclogistics.com";
  const ENV_ADMIN_NOTIFICATION_EMAIL = process.env.ADMIN_NOTIFICATION_EMAIL ?? "admin@stclogistics.com";

  let apiKey = ENV_RESEND_API_KEY;
  let fromEmail = ENV_FROM_EMAIL;
  let adminNotificationEmail = ENV_ADMIN_NOTIFICATION_EMAIL;

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
      const adminEmailRow = dbSettings.find((r: any) => r.key === "admin_notification_email");

      if (apiKeyRow && apiKeyRow.value && apiKeyRow.value !== "your_resend_api_key") {
        apiKey = apiKeyRow.value;
      }
      if (fromEmailRow && fromEmailRow.value && fromEmailRow.value !== "notifications@stclogistics.com") {
        fromEmail = fromEmailRow.value;
      }
      if (adminEmailRow && adminEmailRow.value) {
        adminNotificationEmail = adminEmailRow.value;
      }
    }
  } catch (err) {
    console.error("Failed to fetch email settings from DB, using env variables:", err);
  }

  return { apiKey, fromEmail, adminNotificationEmail };
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

export async function notifyParcelArrived(
  email: string,
  fullName: string,
  localTrackingNumber: string,
  parcelId: string,
  weightKg?: number | null,
  dimensions?: string | null,
  supplierName?: string | null
) {
  const appUrl = getAppUrl();
  const subject = `Parcel Arrived at China Warehouse: ${localTrackingNumber}`;
  
  const weightDisplay = weightKg ? `${weightKg} kg` : "Awaiting measurement";
  const dimensionsDisplay = dimensions || "Awaiting measurement";
  const supplierDisplay = supplierName || "Not specified";

  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #1e293b; line-height: 1.6;">
      <div style="text-align: center; margin-bottom: 24px;">
        <h2 style="color: #2563eb; margin-bottom: 4px;">Parcel Received in China!</h2>
        <p style="font-size: 14px; color: #64748b; margin-top: 0;">STC Logistics Warehouse Consolidation</p>
      </div>

      <p style="font-size: 16px; margin-top: 0;">Hello ${fullName || "Customer"},</p>
      
      <p>We are pleased to inform you that a package sent to your warehouse code has been physically received at our Guangzhou warehouse in China.</p>

      <!-- Parcel Details Card -->
      <div style="border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; margin: 24px 0; background-color: #f8fafc;">
        <h3 style="margin-top: 0; color: #0f172a; font-size: 14px; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 12px; border-bottom: 1px solid #e2e8f0; padding-bottom: 8px;">Received Package Specifications</h3>
        
        <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
          <tr>
            <td style="padding: 6px 0; color: #64748b; font-weight: 500; width: 150px; vertical-align: top;">China Bill Number:</td>
            <td style="padding: 6px 0; font-family: monospace; font-weight: bold; color: #0f172a; vertical-align: top;">${localTrackingNumber}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #64748b; font-weight: 500; vertical-align: top;">Supplier / Source:</td>
            <td style="padding: 6px 0; font-weight: bold; color: #0f172a; vertical-align: top;">${supplierDisplay}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #64748b; font-weight: 500; vertical-align: top;">Package Weight:</td>
            <td style="padding: 6px 0; font-weight: bold; color: #0f172a; vertical-align: top;">${weightDisplay}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #64748b; font-weight: 500; vertical-align: top;">Dimensions:</td>
            <td style="padding: 6px 0; font-weight: bold; color: #0f172a; vertical-align: top;">${dimensionsDisplay}</td>
          </tr>
        </table>
      </div>

      <!-- What this means -->
      <div style="margin: 24px 0;">
        <h3 style="color: #0f172a; font-size: 15px; margin-bottom: 8px;">What does this mean?</h3>
        <p style="margin: 0; font-size: 14px; color: #475569;">
          Your package is now safely stored in your dedicated customer bin at our warehouse. Before we can consolidate this package and load it for international shipping to Africa, <strong>you must declare the package items and their value</strong>. This is required for international customs clearance and invoicing.
        </p>
      </div>

      <!-- What to do next -->
      <div style="margin: 24px 0; border-left: 4px solid #2563eb; padding-left: 16px;">
        <h3 style="color: #0f172a; font-size: 15px; margin-bottom: 10px;">What do I need to do next?</h3>
        <ol style="padding-left: 16px; margin: 0; font-size: 13px; color: #334155; space-y-2;">
          <li style="margin-bottom: 6px;">
            <strong>Provide Package Details</strong>: Log in to your STC Logistics Dashboard, navigate to the <em>My Parcels</em> tab, and click <strong>Fill Details</strong> next to this parcel.
          </li>
          <li style="margin-bottom: 6px;">
            <strong>Declare Items &amp; Value</strong>: Enter a clear English description of the items (e.g., "Leather Shoes") and their purchase value in Chinese Renminbi (¥).
          </li>
          <li style="margin-bottom: 6px;">
            <strong>Request Shipment</strong>: Once all your supplier packages show "Arrived" and have details filled, select them and click <strong>Ship Parcel</strong> to request international cargo transit.
          </li>
        </ol>
      </div>

      <div style="margin: 32px 0 16px 0; text-align: center;">
        <a href="${appUrl}/dashboard/parcels/${parcelId}" style="background-color: #2563eb; color: white; padding: 12px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block; text-align: center; box-shadow: 0 4px 6px -1px rgba(37, 99, 235, 0.2);">Fill Parcel Details Now</a>
      </div>

      <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
      <p style="font-size: 12px; color: #64748b; text-align: center; margin: 0;">STC Logistics · China to Africa Freight Forwarding</p>
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
  const appUrl = getAppUrl();
  const subject = `Shipment Booked: ${stcTrackingNumber}`;
  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #1e293b;">
      <h2 style="color: #2563eb;">Shipment Booked &amp; Consolidated</h2>
      <p>Hello ${fullName || "Customer"},</p>
      <p>Your shipment <strong>${stcTrackingNumber}</strong> has been successfully booked for <strong>${mode} freight</strong> to <strong>${destination}</strong>.</p>
      <p>You can track the live status and journey of your shipment directly on our website using your STC tracking number.</p>
      <div style="margin: 24px 0;">
        <a href="${appUrl}/track?q=${stcTrackingNumber}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">Track Shipment</a>
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
  const appUrl = getAppUrl();
  const statusLabel = status.replace(/_/g, " ").toUpperCase();
  const subject = `Shipment Update: ${stcTrackingNumber} is now ${statusLabel}`;
  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #1e293b;">
      <h2 style="color: #2563eb;">Shipment Status Update</h2>
      <p>Hello ${fullName || "Customer"},</p>
      <p>The status of your shipment <strong>${stcTrackingNumber}</strong> has changed to <strong>${statusLabel}</strong>.</p>
      <div style="margin: 24px 0;">
        <a href="${appUrl}/track?q=${stcTrackingNumber}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">Track Live Journey</a>
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
  const appUrl = getAppUrl();
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
        <a href="${appUrl}/dashboard" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block; text-align: center;">Go to Dashboard</a>
      </div>

      <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
      <p style="font-size: 12px; color: #64748b; text-align: center; margin: 0;">STC Logistics · China to Africa Freight Forwarding</p>
    </div>
  `;

  return sendEmail({ to: email, subject, html });
}

export async function notifyAdminNewCustomerRegistered(
  adminEmail: string,
  customerName: string,
  customerEmail: string,
  warehouseCode: string,
  country: string | null
) {
  const appUrl = getAppUrl();
  const subject = `[STC Alert] New Customer Registered: ${customerName} (${warehouseCode})`;
  
  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #1e293b; line-height: 1.6; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
      <div style="text-align: center; margin-bottom: 24px; border-bottom: 2px solid #3b82f6; padding-bottom: 16px;">
        <h2 style="color: #1d4ed8; margin: 0;">New Customer Registration</h2>
        <p style="font-size: 14px; color: #64748b; margin-top: 4px; margin-bottom: 0;">STC Logistics Admin Alert System</p>
      </div>

      <p style="font-size: 15px; margin-top: 0; color: #334155;">Hello Admin,</p>
      <p style="font-size: 14px; color: #475569;">A new customer has successfully registered an account on the STC Logistics platform. Below are the account details:</p>

      <div style="border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin: 20px 0; background-color: #f8fafc;">
        <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
          <tr>
            <td style="padding: 6px 0; color: #64748b; font-weight: 500; width: 140px;">Full Name:</td>
            <td style="padding: 6px 0; font-weight: bold; color: #0f172a;">${customerName}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #64748b; font-weight: 500;">Email Address:</td>
            <td style="padding: 6px 0; font-weight: bold; color: #0f172a;">${customerEmail}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #64748b; font-weight: 500;">Warehouse Code:</td>
            <td style="padding: 6px 0; font-family: monospace; font-weight: bold; color: #1d4ed8; font-size: 16px;">${warehouseCode}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #64748b; font-weight: 500;">Destination Country:</td>
            <td style="padding: 6px 0; font-weight: bold; color: #0f172a;">${country || "Not specified"}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #64748b; font-weight: 500;">Registration Time:</td>
            <td style="padding: 6px 0; color: #0f172a;">${new Date().toLocaleString()}</td>
          </tr>
        </table>
      </div>

      <div style="margin: 28px 0; text-align: center;">
        <a href="${appUrl}/admin/customers" style="background-color: #1d4ed8; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block; font-size: 14px; box-shadow: 0 4px 6px -1px rgba(29, 78, 216, 0.2);">Manage Customers</a>
      </div>

      <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
      <p style="font-size: 11px; color: #94a3b8; text-align: center; margin: 0;">This is an automated system notification. Please do not reply directly to this email.</p>
    </div>
  `;

  return sendEmail({ to: adminEmail, subject, html });
}

export async function notifyAdminNewParcelSubmission(
  adminEmail: string,
  customerName: string,
  warehouseCode: string,
  mode: "air" | "sea",
  destination: string,
  receiverName: string,
  receiverPhone: string,
  receiverAddress: string,
  parcels: Array<{
    local_tracking_number: string;
    item_description: string | null;
    quantity: number;
    declared_value: number | null;
    weight_kg: number | null;
    dimensions: string | null;
    shipping_cost: number | null;
  }>,
  totalCost: number
) {
  const appUrl = getAppUrl();
  const subject = `[STC Alert] Combined Shipping Submission: ${customerName} (${warehouseCode})`;

  const parcelsTableRows = parcels.map(p => `
    <tr style="border-bottom: 1px solid #e2e8f0;">
      <td style="padding: 10px 8px; font-family: monospace; font-size: 13px; color: #1e293b; font-weight: 500;">${p.local_tracking_number}</td>
      <td style="padding: 10px 8px; color: #334155;">${p.item_description || "No description"}</td>
      <td style="padding: 10px 8px; text-align: center; color: #334155;">${p.quantity}</td>
      <td style="padding: 10px 8px; text-align: right; color: #334155;">${p.weight_kg ? `${p.weight_kg} kg` : "—"}</td>
      <td style="padding: 10px 8px; text-align: right; color: #334155;">${p.declared_value ? `¥${p.declared_value}` : "—"}</td>
      <td style="padding: 10px 8px; text-align: right; font-weight: bold; color: #10b981;">${p.shipping_cost ? `$${Number(p.shipping_cost).toFixed(2)}` : "—"}</td>
    </tr>
  `).join("");

  const html = `
    <div style="font-family: sans-serif; max-width: 700px; margin: 0 auto; padding: 20px; color: #1e293b; line-height: 1.6; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
      <div style="text-align: center; margin-bottom: 24px; border-bottom: 2px solid #059669; padding-bottom: 16px;">
        <h2 style="color: #059669; margin: 0;">New Shipping Request Received</h2>
        <p style="font-size: 14px; color: #64748b; margin-top: 4px; margin-bottom: 0;">Consolidated Cargo Shipping Request</p>
      </div>

      <p style="font-size: 15px; margin-top: 0; color: #334155;">Hello Admin,</p>
      <p style="font-size: 14px; color: #475569;">Customer <strong>${customerName} (${warehouseCode})</strong> has submitted a new consolidated shipping request for <strong>${parcels.length} parcel(s)</strong>.</p>

      <div style="border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin: 20px 0; background-color: #f8fafc;">
        <h3 style="margin-top: 0; color: #0f172a; font-size: 14px; border-bottom: 1px solid #e2e8f0; padding-bottom: 6px; margin-bottom: 12px;">Transit & Delivery Details</h3>
        <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
          <tr>
            <td style="padding: 4px 0; color: #64748b; font-weight: 500; width: 150px;">Freight Mode:</td>
            <td style="padding: 4px 0; font-weight: bold; color: #0f172a; text-transform: uppercase;">${mode} Freight</td>
          </tr>
          <tr>
            <td style="padding: 4px 0; color: #64748b; font-weight: 500;">Destination:</td>
            <td style="padding: 4px 0; font-weight: bold; color: #0f172a;">${destination}</td>
          </tr>
          <tr>
            <td style="padding: 4px 0; color: #64748b; font-weight: 500;">Receiver Name:</td>
            <td style="padding: 4px 0; font-weight: bold; color: #0f172a;">${receiverName}</td>
          </tr>
          <tr>
            <td style="padding: 4px 0; color: #64748b; font-weight: 500;">Receiver Phone:</td>
            <td style="padding: 4px 0; font-weight: bold; color: #0f172a;">${receiverPhone}</td>
          </tr>
          <tr>
            <td style="padding: 4px 0; color: #64748b; font-weight: 500; vertical-align: top;">Receiver Address:</td>
            <td style="padding: 4px 0; color: #334155; font-weight: 500; vertical-align: top;">${receiverAddress}</td>
          </tr>
        </table>
      </div>

      <div style="margin: 24px 0;">
        <h3 style="margin-top: 0; color: #0f172a; font-size: 14px; margin-bottom: 10px;">Consolidated Package List</h3>
        <table style="width: 100%; border-collapse: collapse; font-size: 13px; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
          <thead>
            <tr style="background-color: #f1f5f9; border-bottom: 1px solid #e2e8f0; text-align: left;">
              <th style="padding: 10px 8px; font-weight: 600; color: #475569;">Tracking #</th>
              <th style="padding: 10px 8px; font-weight: 600; color: #475569;">Description</th>
              <th style="padding: 10px 8px; font-weight: 600; color: #475569; text-align: center;">Qty</th>
              <th style="padding: 10px 8px; font-weight: 600; color: #475569; text-align: right;">Weight</th>
              <th style="padding: 10px 8px; font-weight: 600; color: #475569; text-align: right;">Declared (¥)</th>
              <th style="padding: 10px 8px; font-weight: 600; color: #475569; text-align: right;">Est. Cost</th>
            </tr>
          </thead>
          <tbody>
            ${parcelsTableRows}
            <tr style="background-color: #fafafa; font-weight: bold; border-top: 2px solid #e2e8f0;">
              <td colspan="5" style="padding: 12px 8px; text-align: right; color: #0f172a;">Combined Estimated Cost:</td>
              <td style="padding: 12px 8px; text-align: right; color: #059669; font-size: 15px;">$${totalCost.toFixed(2)} USD</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div style="margin: 28px 0; text-align: center;">
        <a href="${appUrl}/admin/parcels?status=arrived" style="background-color: #059669; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block; font-size: 14px; box-shadow: 0 4px 6px -1px rgba(5, 150, 105, 0.2);">Process Ready Shipments</a>
      </div>

      <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
      <p style="font-size: 11px; color: #94a3b8; text-align: center; margin: 0;">This is an automated system notification. Please do not reply directly to this email.</p>
    </div>
  `;

  return sendEmail({ to: adminEmail, subject, html });
}


