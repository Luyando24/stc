import express from 'express';
import logger from '../utils/logger.js';
import pb from '../utils/pocketbaseClient.js';

const router = express.Router();

const REQUIRED_FIELDS = [
  'productId',
  'productName',
  'productCategory',
  'customerName',
  'customerEmail',
  'customerPhone',
  'quantity',
];

const CATEGORY_TO_EMAIL = {
  'Agricultural Machinery': 'sales@stc-logistics.com',
  'Lighting Equipment': 'sales@stc-logistics.com',
  'Cars': 'sackie@stc-logistics.com',
  'Heavy Equipment': 'sackie@stc-logistics.com',
  'Doors': 'charlaine@stc-logistics.com',
  'Windows': 'charlaine@stc-logistics.com',
  'Tiles': 'charlaine@stc-logistics.com',
  'Ice Cream Machines': 'charlaine@stc-logistics.com',
};

const CATEGORY_TO_CONTACT_NAME = {
  'Agricultural Machinery': 'Sales Team',
  'Lighting Equipment': 'Sales Team',
  'Cars': 'Sackie',
  'Heavy Equipment': 'Sackie',
  'Doors': 'Charlaine',
  'Windows': 'Charlaine',
  'Tiles': 'Charlaine',
  'Ice Cream Machines': 'Charlaine',
};

/**
 * POST /procurement/quote
 * Create a new quote request and send emails to contact person and customer
 * Request body: { productId, productName, productCategory, customerName, customerEmail, customerPhone, quantity, message? }
 * Response (Success 200): { success: true, message: string, quoteId: string, contactPerson: string }
 * Response (Error 400): { error: string }
 */
router.post('/quote', async (req, res) => {
  const { productId, productName, productCategory, customerName, customerEmail, customerPhone, quantity, message } = req.body;

  // Validate all required fields
  for (const field of REQUIRED_FIELDS) {
    if (!req.body[field] || (typeof req.body[field] === 'string' && req.body[field].trim() === '')) {
      return res.status(400).json({
        error: `Missing required field: ${field}`,
      });
    }
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(customerEmail)) {
    return res.status(400).json({
      error: 'Invalid customer email format',
    });
  }

  // Validate phone format (basic check)
  if (typeof customerPhone !== 'string' || customerPhone.trim().length < 5) {
    return res.status(400).json({
      error: 'Invalid customer phone number',
    });
  }

  // Validate quantity is a positive number
  const qty = Number(quantity);
  if (isNaN(qty) || qty <= 0) {
    return res.status(400).json({
      error: 'Quantity must be a positive number',
    });
  }

  // Get recipient email and contact name based on category
  const recipientEmail = CATEGORY_TO_EMAIL[productCategory];
  const contactName = CATEGORY_TO_CONTACT_NAME[productCategory];

  if (!recipientEmail || !contactName) {
    return res.status(400).json({
      error: `Unknown category: ${productCategory}. Valid categories are: ${Object.keys(CATEGORY_TO_EMAIL).join(', ')}`,
    });
  }

  logger.info(`Creating quote request for product: ${productName}, customer: ${customerName}`);

  // Save quote to PocketBase
  const quote = await pb.collection('quotes').create({
    productId,
    productName,
    productCategory,
    customerName,
    customerEmail,
    customerPhone,
    quantity: qty,
    message: message || '',
    status: 'pending',
    createdAt: new Date().toISOString(),
  });

  logger.info(`Quote created with ID: ${quote.id}`);

  // Send email to contact person
  const contactEmailSubject = `New Quote Request - ${productName}`;
  const contactEmailBody = `
<html>
  <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
    <h2>New Quote Request</h2>
    <p>Hello ${contactName},</p>
    <p>You have received a new quote request:</p>
    
    <h3>Product Details</h3>
    <ul>
      <li><strong>Product Name:</strong> ${productName}</li>
      <li><strong>Product ID:</strong> ${productId}</li>
      <li><strong>Category:</strong> ${productCategory}</li>
      <li><strong>Quantity:</strong> ${qty}</li>
    </ul>
    
    <h3>Customer Details</h3>
    <ul>
      <li><strong>Name:</strong> ${customerName}</li>
      <li><strong>Email:</strong> ${customerEmail}</li>
      <li><strong>Phone:</strong> ${customerPhone}</li>
    </ul>
    
    ${message ? `<h3>Customer Message</h3><p>${message}</p>` : ''}
    
    <p><strong>Quote Reference:</strong> ${quote.id}</p>
    
    <p>Please review this request and follow up with the customer.</p>
    
    <p>Best regards,<br/>STC Logistics Quote System</p>
  </body>
</html>
  `;

  // Send email to customer
  const customerEmailSubject = `Quote Request Received - ${productName}`;
  const customerEmailBody = `
<html>
  <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
    <h2>Quote Request Confirmation</h2>
    <p>Hello ${customerName},</p>
    <p>Thank you for your quote request!</p>
    
    <h3>Request Summary</h3>
    <ul>
      <li><strong>Product:</strong> ${productName}</li>
      <li><strong>Category:</strong> ${productCategory}</li>
      <li><strong>Quantity:</strong> ${qty}</li>
    </ul>
    
    <p>Our team will review your request and get back to you shortly.</p>
    
    <p><strong>Quote Reference:</strong> ${quote.id}</p>
    
    <p>If you have any questions, please don't hesitate to contact us.</p>
    
    <p>Best regards,<br/>STC Logistics Team</p>
  </body>
</html>
  `;

  // Send email to contact person via PocketBase mail system
  await pb.send(recipientEmail, {
    subject: contactEmailSubject,
    html: contactEmailBody,
  });
  logger.info(`Contact email sent to ${recipientEmail}`);

  // Send email to customer via PocketBase mail system
  await pb.send(customerEmail, {
    subject: customerEmailSubject,
    html: customerEmailBody,
  });
  logger.info(`Confirmation email sent to ${customerEmail}`);

  res.json({
    success: true,
    message: 'Quote request submitted successfully',
    quoteId: quote.id,
    contactPerson: contactName,
  });
});

export default router;