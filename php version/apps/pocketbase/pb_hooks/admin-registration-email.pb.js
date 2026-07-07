/// <reference path="../pb_data/types.d.ts" />
onRecordAfterCreateSuccess((e) => {
  if (e.record.get("status") === "pending") {
    const message = new MailerMessage({
      from: {
        address: $app.settings().meta.senderAddress,
        name: "STC Logistics Admin"
      },
      to: [{ address: e.record.get("email") }],
      subject: "Verify Your Email - STC Logistics Admin Registration",
      html: `
        <h2>Welcome to STC Logistics Admin Portal</h2>
        <p>Hello ${e.record.get("fullName")},</p>
        <p>Thank you for registering as an admin. Your registration is pending approval from our Super Admin.</p>
        <p><strong>Registration Details:</strong></p>
        <ul>
          <li>Name: ${e.record.get("fullName")}</li>
          <li>Email: ${e.record.get("email")}</li>
          <li>Department: ${e.record.get("department")}</li>
          <li>Phone: ${e.record.get("phone")}</li>
        </ul>
        <p>You will receive another email once your account has been approved. Please keep an eye on your inbox.</p>
        <p>If you have any questions, please contact our support team.</p>
        <p>Best regards,<br>STC Logistics Team</p>
      `
    });
    $app.newMailClient().send(message);
  }
  e.next();
}, "admins");