import express from 'express';
import logger from '../utils/logger.js';
import pb from '../utils/pocketbaseClient.js';

const router = express.Router();

/**
 * POST /admin/registration-confirmation
 * Send registration confirmation email based on admin status
 * Request body: { email: string, status: string }
 * Response (Success 200): { success: true, message: string }
 * Response (Error 400): { error: string }
 */
router.post('/registration-confirmation', async (req, res) => {
  const { email, status } = req.body;

  // Input validation
  if (!email || typeof email !== 'string' || email.trim() === '') {
    return res.status(400).json({
      error: 'Email is required',
    });
  }

  if (!status || typeof status !== 'string' || status.trim() === '') {
    return res.status(400).json({
      error: 'Status is required',
    });
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({
      error: 'Invalid email format',
    });
  }

  // Validate status
  const validStatuses = ['active', 'pending'];
  if (!validStatuses.includes(status.toLowerCase())) {
    return res.status(400).json({
      error: `Invalid status. Must be one of: ${validStatuses.join(', ')}`,
    });
  }

  const normalizedStatus = status.toLowerCase();

  logger.info(`Processing registration confirmation for email: ${email}, status: ${normalizedStatus}`);

  if (normalizedStatus === 'active') {
    // Send activation confirmation email to the super admin
    const subject = 'Your Super Admin Account is Active';
    const html = `
<html>
  <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
    <h2>Super Admin Account Activated</h2>
    <p>Hello,</p>
    <p>Your Super Admin account has been activated. You can now log in at: <a href="/admin">/admin</a></p>
    <p>If you have any questions, please contact our support team.</p>
    <p>Best regards,<br/>STC Logistics Team</p>
  </body>
</html>
    `;

    await pb.send(email, {
      subject,
      html,
    });

    logger.info(`Activation confirmation email sent to ${email}`);

    res.json({
      success: true,
      message: 'Activation confirmation email sent successfully',
    });
  } else if (normalizedStatus === 'pending') {
    // Send approval request email to sales team
    const subject = 'New Admin Registration Pending Approval';
    const html = `
<html>
  <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
    <h2>New Admin Registration Pending Approval</h2>
    <p>Hello,</p>
    <p>A new admin registration is pending your approval:</p>
    <ul>
      <li><strong>Email:</strong> ${email}</li>
    </ul>
    <p>Please review this registration and approve or reject as needed.</p>
    <p>Best regards,<br/>STC Logistics Admin System</p>
  </body>
</html>
    `;

    await pb.send('sales@stc-logistics.com', {
      subject,
      html,
    });

    logger.info(`Approval request email sent to sales@stc-logistics.com for admin: ${email}`);

    res.json({
      success: true,
      message: 'Approval request email sent successfully',
    });
  }
});

export default router;