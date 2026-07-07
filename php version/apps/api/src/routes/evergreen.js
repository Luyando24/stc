import express from 'express';
import logger from '../utils/logger.js';

const router = express.Router();

const VALID_REFERENCE_TYPES = [
  'equipmentReference',
  'transportDocumentReference',
  'carrierBookingReference',
];

/**
 * POST /evergreen
 * Track shipment using Evergreen tracking API
 * Request body: { reference: string, referenceType?: string }
 * Response (Fallback 503): { carrier: 'Evergreen', reference: string, trackingUrl: string, status: 503, message: string, instructions: string }
 */
router.post('/', async (req, res) => {
  const { reference, referenceType } = req.body;

  // Input validation
  if (!reference || typeof reference !== 'string' || reference.trim() === '') {
    return res.status(400).json({
      error: 'Tracking number is required',
    });
  }

  if (referenceType && !VALID_REFERENCE_TYPES.includes(referenceType)) {
    return res.status(400).json({
      error: `Invalid referenceType. Must be one of: ${VALID_REFERENCE_TYPES.join(', ')}`,
    });
  }

  logger.info(`Evergreen tracking requested for reference: ${reference}`);

  // Return fallback response
  res.status(503).json({
    carrier: 'Evergreen',
    reference,
    trackingUrl: 'https://www.evergreen-line.com/en/services/tracking',
    status: 503,
    message: 'Tracking information temporarily unavailable. Please visit the carrier portal below.',
    instructions: 'Copy and paste your container number in the tracking portal',
  });
});

export default router;