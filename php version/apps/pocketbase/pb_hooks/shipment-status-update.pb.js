/// <reference path="../pb_data/types.d.ts" />
onRecordAfterUpdateSuccess((e) => {
  const bookingId = e.record.get("booking_id");
  const trackingNumber = e.record.get("tracking_number");
  const currentStatus = e.record.get("current_status");
  const currentLocation = e.record.get("current_location");
  const estimatedDelivery = e.record.get("estimated_delivery");
  
  try {
    const booking = $app.findFirstRecordByData("bookings", "id", bookingId);
    if (!booking) {
      e.next();
      return;
    }
    
    const userEmail = booking.get("created_by");
    const statusDisplay = currentStatus.replace(/_/g, " ").toUpperCase();
    
    const message = new MailerMessage({
      from: {
        address: $app.settings().meta.senderAddress,
        name: $app.settings().meta.senderName
      },
      to: [{ address: userEmail }],
      subject: "Shipment Status Update - " + trackingNumber,
      html: "<h2>Shipment Status Update</h2>" +
            "<p><strong>Tracking Number:</strong> " + trackingNumber + "</p>" +
            "<p><strong>Current Status:</strong> " + statusDisplay + "</p>" +
            (currentLocation ? "<p><strong>Current Location:</strong> " + currentLocation + "</p>" : "") +
            (estimatedDelivery ? "<p><strong>Estimated Delivery:</strong> " + estimatedDelivery + "</p>" : "") +
            "<p><a href='https://yourapp.com/track/" + trackingNumber + "'>View Full Tracking Details</a></p>" +
            "<p>We'll keep you updated on your shipment status.</p>"
    });
    $app.newMailClient().send(message);
  } catch (err) {
    console.log("Error sending shipment update email: " + err.message);
  }
  
  e.next();
}, "shipments");