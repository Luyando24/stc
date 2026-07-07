/// <reference path="../pb_data/types.d.ts" />
onRecordAfterCreateSuccess((e) => {
  const userEmail = e.record.get("created_by");
  const serviceType = e.record.get("service_type");
  const origin = e.record.get("origin");
  const destination = e.record.get("destination");
  const quoteAmount = e.record.get("quote_amount");
  const bookingId = e.record.id;
  
  const message = new MailerMessage({
    from: {
      address: $app.settings().meta.senderAddress,
      name: $app.settings().meta.senderName
    },
    to: [{ address: userEmail }],
    subject: "Booking Confirmation #" + bookingId,
    html: "<h2>Your Booking Confirmation</h2>" +
          "<p><strong>Booking ID:</strong> " + bookingId + "</p>" +
          "<p><strong>Service Type:</strong> " + serviceType.replace(/_/g, " ").toUpperCase() + "</p>" +
          "<p><strong>Origin:</strong> " + origin + "</p>" +
          "<p><strong>Destination:</strong> " + destination + "</p>" +
          (quoteAmount ? "<p><strong>Quote Amount:</strong> $" + quoteAmount + "</p>" : "") +
          "<p><a href='https://yourapp.com/track/" + bookingId + "'>Track Your Shipment</a></p>" +
          "<p>Thank you for your booking!</p>"
  });
  $app.newMailClient().send(message);
  e.next();
}, "bookings");