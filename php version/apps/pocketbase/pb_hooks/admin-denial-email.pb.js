/// <reference path="../pb_data/types.d.ts" />
onRecordUpdate((e) => {
  const original = e.record.original();
  const currentStatus = e.record.get("status");
  const previousStatus = original.get("status");
  
  if (previousStatus !== "denied" && currentStatus === "denied") {
    const denialReason = e.record.get("denialReason");
    const reasonText = denialReason ? `<p><strong>Reason:</strong> ${denialReason}</p>` : "";
    
    const message = new MailerMessage({
      from: {
        address: $app.settings().meta.senderAddress,
        name: "STC Logistics Admin"
      },
      to: [{ address: e.record.get("email") }],
      subject: "Admin Registration Request - Not Approved",
      html: `
        <h2>Registration Status Update</h2>
        <p>Hello ${e.record.get("fullName")},</p>
        <p>Thank you for your interest in becoming an admin at STC Logistics. Unfortunately, your admin registration request was not approved at this time.</p>
        ${reasonText}
        <p>If you believe this is an error or would like to reapply, please contact our support team.</p>
        <p>Best regards,<br>STC Logistics Team</p>
      `
    });
    $app.newMailClient().send(message);
  }
  e.next();
}, "admins");