/// <reference path="../pb_data/types.d.ts" />
onRecordAfterCreateSuccess((e) => {
  if (e.record.get("status") === "pending") {
    const adminName = e.record.get("fullName");
    const adminEmail = e.record.get("email");
    const adminId = e.record.id;
    const message = new MailerMessage({
      from: {
        address: $app.settings().meta.senderAddress,
        name: "STC Logistics Admin System"
      },
      to: [{ address: "sales@stc-logistics.com" }],
      subject: "New Admin Registration Request - " + adminName,
      html: `
        <h2>New Admin Registration Request</h2>
        <p>A new admin has registered and is pending approval.</p>
        <p><strong>Admin Details:</strong></p>
        <ul>
          <li>Name: ${adminName}</li>
          <li>Email: ${adminEmail}</li>
          <li>Phone: ${e.record.get("phone")}</li>
          <li>Department: ${e.record.get("department")}</li>
          <li>Registration Date/Time: ${new Date().toLocaleString()}</li>
        </ul>
        <p><strong>Action Required:</strong></p>
        <p>Please log in to the admin dashboard to approve or deny this registration request.</p>
        <p>Admin ID: ${adminId}</p>
        <p>Best regards,<br>STC Logistics Admin System</p>
      `
    });
    $app.newMailClient().send(message);
  }
  e.next();
}, "admins");