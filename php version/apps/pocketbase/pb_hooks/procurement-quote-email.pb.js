/// <reference path="../pb_data/types.d.ts" />
onRecordAfterCreateSuccess((e) => {
  const productCategory = e.record.get("productCategory");
  const customerName = e.record.get("customerName");
  const customerEmail = e.record.get("customerEmail");
  const customerPhone = e.record.get("customerPhone");
  const productName = e.record.get("productName");
  const productId = e.record.get("productId");
  const quantity = e.record.get("quantity");
  const quoteAmount = e.record.get("quote_amount");
  const message = e.record.get("message");
  const destinationCountry = e.record.get("destinationCountry");
  const budgetRange = e.record.get("budgetRange");
  const preferredShippingMethod = e.record.get("preferredShippingMethod");
  
  // Determine recipient email based on product category
  let recipientEmail = "";
  if (productCategory === "Agricultural Machinery" || productCategory === "Lighting Equipment") {
    recipientEmail = "frankie@stc-logistics.com";
  } else if (productCategory === "Cars" || productCategory === "Heavy Equipment") {
    recipientEmail = "sackie@stc-logistics.com";
  } else if (productCategory === "Doors" || productCategory === "Windows" || productCategory === "Tiles" || productCategory === "Ice Cream Machines") {
    recipientEmail = "charlaine@stc-logistics.com";
  }
  
  if (recipientEmail) {
    const emailBody = `
      <h2>New Quote Request</h2>
      <hr>
      <h3>Customer Information</h3>
      <p><strong>Name:</strong> ${customerName}</p>
      <p><strong>Email:</strong> ${customerEmail}</p>
      <p><strong>Phone:</strong> ${customerPhone}</p>
      
      <h3>Product Information</h3>
      <p><strong>Product Name:</strong> ${productName}</p>
      <p><strong>Product ID:</strong> ${productId}</p>
      <p><strong>Category:</strong> ${productCategory}</p>
      <p><strong>Quantity:</strong> ${quantity}</p>
      
      <h3>Quote Details</h3>
      <p><strong>Quote Amount:</strong> $${quoteAmount}</p>
      <p><strong>Destination Country:</strong> ${destinationCountry || "Not specified"}</p>
      <p><strong>Budget Range:</strong> ${budgetRange || "Not specified"}</p>
      <p><strong>Preferred Shipping Method:</strong> ${preferredShippingMethod || "Not specified"}</p>
      
      <h3>Additional Message</h3>
      <p>${message || "No additional message provided"}</p>
      
      <hr>
      <p><em>Quote ID: ${e.record.id}</em></p>
    `;
    
    const mailMessage = new MailerMessage({
      from: {
        address: $app.settings().meta.senderAddress,
        name: $app.settings().meta.senderName
      },
      to: [{ address: recipientEmail }],
      subject: `New Quote Request - ${productName} from ${customerName}`,
      html: emailBody
    });
    
    $app.newMailClient().send(mailMessage);
  }
  
  e.next();
}, "quotes");