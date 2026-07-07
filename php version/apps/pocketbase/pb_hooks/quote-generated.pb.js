/// <reference path="../pb_data/types.d.ts" />
onRecordAfterCreateSuccess((e) => {
  const userEmail = e.record.get("created_by");
  const serviceType = e.record.get("service_type");
  const origin = e.record.get("origin");
  const destination = e.record.get("destination");
  const quoteAmount = e.record.get("quote_amount");
  const quoteId = e.record.id;
  
  const message = new MailerMessage({
    from: {
      address: $app.settings().meta.senderAddress,
      name: $app.settings().meta.senderName
    },
    to: [{ address: userEmail }],
    subject: "Quote Generated #" + quoteId,
    html: "<h2>Your Quote Details</h2>" +
          "<p><strong>Quote ID:</strong> " + quoteId + "</p>" +
          "<p><strong>Service Type:</strong> " + serviceType.replace(/_/g, " ").toUpperCase() + "</p>" +
          "<p><strong>Origin:</strong> " + origin + "</p>" +
          "<p><strong>Destination:</strong> " + destination + "</p>" +
          "<p><strong>Quote Amount:</strong> $" + quoteAmount + "</p>" +
          "<p><strong>Status:</strong> Pending Your Response</p>" +
          "<p>" +
          "<a href='https://yourapp.com/quotes/" + quoteId + "/accept' style='background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; display: inline-block; margin-right: 10px;'>Accept Quote</a>" +
          "<a href='https://yourapp.com/quotes/" + quoteId + "/reject' style='background-color: #f44336; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; display: inline-block;'>Reject Quote</a>" +
          "</p>" +
          "<p>Please review and respond to this quote at your earliest convenience.</p>"
  });
  $app.newMailClient().send(message);
  e.next();
}, "quotes");