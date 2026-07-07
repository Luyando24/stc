/// <reference path="../pb_data/types.d.ts" />
onRecordUpdate((e) => {
  const original = e.record.original();
  const currentStatus = e.record.get("status");
  const previousStatus = original.get("status");
  
  if (previousStatus !== "active" && currentStatus === "active") {
    const message = new MailerMessage({
      from: {
        address: $app.settings().meta.senderAddress,
        name: "STC Logistics Admin"
      },
      to: [{ address: e.record.get("email") }],
      subject: "Your Admin Account Has Been Approved",
      html: `
        <h2>Account Approval Notification</h2>
        <p>Hello ${e.record.get("fullName")},</p>
        <p>Great news! Your admin account has been approved and is now active.</p>
        <p>You can now log in to the STC Logistics Admin Portal using your email and password.</p>
        <p><strong>Login Details:</strong></p>
        <ul>
          <li>Email: ${e.record.get("email")}</li>
          <li>Portal: https://stc-logistics.com/admin</li>
        </ul>
        <p>If you have any questions or need assistance, please contact our support team.</p>
        <p>Best regards,<br>STC Logistics Team</p>
      `
    });
    $app.newMailClient().send(message);
  }
  e.next();
}, "admins");