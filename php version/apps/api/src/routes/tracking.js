import express from 'express';
import logger from '../utils/logger.js';

const router = express.Router();

const VALID_REFERENCE_TYPES = [
  'equipmentReference',
  'transportDocumentReference',
  'carrierBookingReference',
];

/**
 * Detect carrier from reference (container prefix or format)
 * Extracts first 3-4 characters and matches against known carrier prefixes
 * Returns carrier object: { name: string, code: string } or null
 */
function detectCarrier(reference) {
  if (!reference || typeof reference !== 'string') {
    return null;
  }

  const upperRef = reference.toUpperCase().trim();

  // Check 4-character prefixes first (more specific)
  const prefix4 = upperRef.substring(0, 4);

  // Maersk: MAEU
  if (prefix4 === 'MAEU') {
    return { name: 'MAERSK', code: 'maersk' };
  }
  // CMA CGM: CMAU
  if (prefix4 === 'CMAU') {
    return { name: 'CMA CGM', code: 'cma' };
  }
  // MSC: MSCU
  if (prefix4 === 'MSCU') {
    return { name: 'MSC', code: 'msc' };
  }
  // Evergreen: GECO
  if (prefix4 === 'GECO') {
    return { name: 'EVERGREEN', code: 'evergreen' };
  }
  // OOCL: OOCL, OOLU
  if (prefix4 === 'OOCL' || prefix4 === 'OOLU') {
    return { name: 'OOCL', code: 'oocl' };
  }
  // COSCO: COSU
  if (prefix4 === 'COSU') {
    return { name: 'COSCO', code: 'cosco' };
  }
  // Hapag-Lloyd: HAPA
  if (prefix4 === 'HAPA') {
    return { name: 'HAPAG-LLOYD', code: 'hapag' };
  }
  // ZIM: ZIMU
  if (prefix4 === 'ZIMU') {
    return { name: 'ZIM', code: 'zim' };
  }
  // ONE: ONEU
  if (prefix4 === 'ONEU') {
    return { name: 'ONE', code: 'one' };
  }

  // Check 3-character prefixes (less specific)
  const prefix3 = upperRef.substring(0, 3);

  // Maersk: MAE
  if (prefix3 === 'MAE') {
    return { name: 'MAERSK', code: 'maersk' };
  }
  // CMA CGM: CMA
  if (prefix3 === 'CMA') {
    return { name: 'CMA CGM', code: 'cma' };
  }
  // MSC: MSC
  if (prefix3 === 'MSC') {
    return { name: 'MSC', code: 'msc' };
  }
  // Evergreen: GGZ
  if (prefix3 === 'GGZ') {
    return { name: 'EVERGREEN', code: 'evergreen' };
  }
  // COSCO: Check 5 chars first
  if (upperRef.substring(0, 5) === 'COSCO') {
    return { name: 'COSCO', code: 'cosco' };
  }
  // COSCO: COS (3 chars)
  if (prefix3 === 'COS') {
    return { name: 'COSCO', code: 'cosco' };
  }
  // Hapag-Lloyd: HAP
  if (prefix3 === 'HAP') {
    return { name: 'HAPAG-LLOYD', code: 'hapag' };
  }
  // ZIM: ZIM
  if (prefix3 === 'ZIM') {
    return { name: 'ZIM', code: 'zim' };
  }
  // ONE: ONE
  if (prefix3 === 'ONE') {
    return { name: 'ONE', code: 'one' };
  }

  // Unable to detect carrier
  return null;
}

/**
 * Carrier portal URLs mapping
 */
const carrierPortals = {
  'maersk': 'https://www.maersk.com/tracking',
  'cma': 'https://www.cma-cgm.com/ebusiness/tracking',
  'msc': 'https://www.msc.com/track-a-shipment',
  'evergreen': 'https://www.evergreen-shipping.com/tracking',
  'oocl': 'https://www.oocl.com/eng/Pages/tracking.aspx',
  'cosco': 'https://www.cosco-shipping.com/en/tracking',
  'hapag': 'https://www.hapag-lloyd.com/en/online-services/track-a-shipment.html',
  'zim': 'https://www.zim.com/track-shipment',
  'one': 'https://www.one-line.com/en/online-services/track-a-shipment',
};

/**
 * POST /track/cma
 * Track shipment using CMA CGM tracking API
 * Request body: { reference: string, referenceType?: string }
 * Response (Fallback 503): { carrier: 'CMA CGM', reference: string, trackingUrl: string, status: 503, message: string, instructions: string }
 */
router.post('/cma', async (req, res) => {
  const { reference, referenceType } = req.body;

  // Input validation
  if (!reference || typeof reference !== 'string' || reference.trim() === '') {
    return res.status(400).json({
      error: 'Tracking number is required',
    });
  }

  logger.info(`CMA CGM tracking requested for reference: ${reference}`);

  // Return fallback response
  res.status(503).json({
    carrier: 'CMA CGM',
    reference,
    trackingUrl: 'https://www.cma-cgm.com/ebusiness/tracking',
    status: 503,
    message: 'Tracking information temporarily unavailable. Please visit the carrier portal below.',
    instructions: 'Copy and paste your container number in the tracking portal',
  });
});

/**
 * POST /track/msc
 * Track shipment using MSC tracking API
 * Request body: { reference: string, referenceType?: string }
 * Response (Fallback 503): { carrier: 'MSC', reference: string, trackingUrl: string, status: 503, message: string, instructions: string }
 */
router.post('/msc', async (req, res) => {
  const { reference, referenceType } = req.body;

  // Input validation
  if (!reference || typeof reference !== 'string' || reference.trim() === '') {
    return res.status(400).json({
      error: 'Tracking number is required',
    });
  }

  logger.info(`MSC tracking requested for reference: ${reference}`);

  // Return fallback response
  res.status(503).json({
    carrier: 'MSC',
    reference,
    trackingUrl: 'https://www.msc.com/track-a-shipment',
    status: 503,
    message: 'Tracking information temporarily unavailable. Please visit the carrier portal below.',
    instructions: 'Copy and paste your container number in the tracking portal',
  });
});

/**
 * POST /track/evergreen
 * Track shipment using Evergreen tracking API
 * Request body: { reference: string, referenceType?: string }
 * Response (Fallback 503): { carrier: 'EVERGREEN', reference: string, trackingUrl: string, status: 503, message: string, instructions: string }
 */
router.post('/evergreen', async (req, res) => {
  const { reference, referenceType } = req.body;

  // Input validation
  if (!reference || typeof reference !== 'string' || reference.trim() === '') {
    return res.status(400).json({
      error: 'Tracking number is required',
    });
  }

  logger.info(`Evergreen tracking requested for reference: ${reference}`);

  // Return fallback response
  res.status(503).json({
    carrier: 'EVERGREEN',
    reference,
    trackingUrl: 'https://www.evergreen-shipping.com/tracking',
    status: 503,
    message: 'Tracking information temporarily unavailable. Please visit the carrier portal below.',
    instructions: 'Copy and paste your container number in the tracking portal',
  });
});

/**
 * POST /track/oocl
 * Track shipment using OOCL tracking API
 * Request body: { reference: string, referenceType?: string }
 * Response (Fallback 503): { carrier: 'OOCL', reference: string, trackingUrl: string, status: 503, message: string, instructions: string }
 */
router.post('/oocl', async (req, res) => {
  const { reference, referenceType } = req.body;

  // Input validation
  if (!reference || typeof reference !== 'string' || reference.trim() === '') {
    return res.status(400).json({
      error: 'Tracking number is required',
    });
  }

  logger.info(`OOCL tracking requested for reference: ${reference}`);

  // Return fallback response
  res.status(503).json({
    carrier: 'OOCL',
    reference,
    trackingUrl: 'https://www.oocl.com/eng/Pages/tracking.aspx',
    status: 503,
    message: 'Tracking information temporarily unavailable. Please visit the carrier portal below.',
    instructions: 'Copy and paste your container number in the tracking portal',
  });
});

/**
 * POST /track/cosco
 * Track shipment using COSCO tracking API
 * Request body: { reference: string, referenceType?: string }
 * Response (Fallback 503): { carrier: 'COSCO', reference: string, trackingUrl: string, status: 503, message: string, instructions: string }
 */
router.post('/cosco', async (req, res) => {
  const { reference, referenceType } = req.body;

  // Input validation
  if (!reference || typeof reference !== 'string' || reference.trim() === '') {
    return res.status(400).json({
      error: 'Tracking number is required',
    });
  }

  logger.info(`COSCO tracking requested for reference: ${reference}`);

  // Return fallback response
  res.status(503).json({
    carrier: 'COSCO',
    reference,
    trackingUrl: 'https://www.cosco-shipping.com/en/tracking',
    status: 503,
    message: 'Tracking information temporarily unavailable. Please visit the carrier portal below.',
    instructions: 'Copy and paste your container number in the tracking portal',
  });
});

/**
 * POST /track/hapag
 * Track shipment using Hapag-Lloyd tracking API
 * Request body: { reference: string, referenceType?: string }
 * Response (Fallback 503): { carrier: 'HAPAG-LLOYD', reference: string, trackingUrl: string, status: 503, message: string, instructions: string }
 */
router.post('/hapag', async (req, res) => {
  const { reference, referenceType } = req.body;

  // Input validation
  if (!reference || typeof reference !== 'string' || reference.trim() === '') {
    return res.status(400).json({
      error: 'Tracking number is required',
    });
  }

  logger.info(`Hapag-Lloyd tracking requested for reference: ${reference}`);

  // Return fallback response
  res.status(503).json({
    carrier: 'HAPAG-LLOYD',
    reference,
    trackingUrl: 'https://www.hapag-lloyd.com/en/online-services/track-a-shipment.html',
    status: 503,
    message: 'Tracking information temporarily unavailable. Please visit the carrier portal below.',
    instructions: 'Copy and paste your container number in the tracking portal',
  });
});

/**
 * POST /track/zim
 * Track shipment using ZIM tracking API
 * Request body: { reference: string, referenceType?: string }
 * Response (Fallback 503): { carrier: 'ZIM', reference: string, trackingUrl: string, status: 503, message: string, instructions: string }
 */
router.post('/zim', async (req, res) => {
  const { reference, referenceType } = req.body;

  // Input validation
  if (!reference || typeof reference !== 'string' || reference.trim() === '') {
    return res.status(400).json({
      error: 'Tracking number is required',
    });
  }

  logger.info(`ZIM tracking requested for reference: ${reference}`);

  // Return fallback response
  res.status(503).json({
    carrier: 'ZIM',
    reference,
    trackingUrl: 'https://www.zim.com/track-shipment',
    status: 503,
    message: 'Tracking information temporarily unavailable. Please visit the carrier portal below.',
    instructions: 'Copy and paste your container number in the tracking portal',
  });
});

/**
 * POST /track/one
 * Track shipment using ONE (Ocean Network Express) tracking API
 * Request body: { reference: string, referenceType?: string }
 * Response (Fallback 503): { carrier: 'ONE', reference: string, trackingUrl: string, status: 503, message: string, instructions: string }
 */
router.post('/one', async (req, res) => {
  const { reference, referenceType } = req.body;

  // Input validation
  if (!reference || typeof reference !== 'string' || reference.trim() === '') {
    return res.status(400).json({
      error: 'Tracking number is required',
    });
  }

  logger.info(`ONE tracking requested for reference: ${reference}`);

  // Return fallback response
  res.status(503).json({
    carrier: 'ONE',
    reference,
    trackingUrl: 'https://www.one-line.com/en/online-services/track-a-shipment',
    status: 503,
    message: 'Tracking information temporarily unavailable. Please visit the carrier portal below.',
    instructions: 'Copy and paste your container number in the tracking portal',
  });
});

/**
 * POST /track/maersk
 * Track shipment using Maersk tracking API
 * Request body: { reference: string, referenceType?: string }
 * Response (Fallback 503): { carrier: 'MAERSK', reference: string, trackingUrl: string, status: 503, message: string, instructions: string }
 */
router.post('/maersk', async (req, res) => {
  const { reference, referenceType } = req.body;

  // Input validation
  if (!reference || typeof reference !== 'string' || reference.trim() === '') {
    return res.status(400).json({
      error: 'Tracking number is required',
    });
  }

  logger.info(`Maersk tracking requested for reference: ${reference}`);

  // Return fallback response
  res.status(503).json({
    carrier: 'MAERSK',
    reference,
    trackingUrl: 'https://www.maersk.com/tracking',
    status: 503,
    message: 'Tracking information temporarily unavailable. Please visit the carrier portal below.',
    instructions: 'Copy and paste your container number in the tracking portal',
  });
});

/**
 * POST /track/auto
 * Auto-detect carrier from reference prefix and return fallback response
 * Request body: { reference: string, referenceType?: string }
 * Response (Success 503): { carrier: string, reference: string, trackingUrl: string, status: 503, message: string, instructions: string }
 * Response (Error 400): { error: string }
 */
router.post('/auto', async (req, res) => {
  const { reference, referenceType } = req.body;

  // Input validation
  if (!reference || typeof reference !== 'string' || reference.trim() === '') {
    return res.status(400).json({
      error: 'Tracking number is required',
    });
  }

  // Detect carrier from reference prefix
  const detectedCarrier = detectCarrier(reference);

  if (!detectedCarrier) {
    logger.warn(`Unable to auto-detect carrier for reference: ${reference}`);
    return res.status(400).json({
      error: 'Carrier not recognized. Please select your carrier manually from the tracking options.',
    });
  }

  logger.info(`Auto-detected carrier: ${detectedCarrier.name} for reference: ${reference}`);

  const trackingUrl = carrierPortals[detectedCarrier.code];

  if (!trackingUrl) {
    logger.error(`No portal URL mapping for carrier: ${detectedCarrier.code}`);
    throw new Error(`Internal error: No portal URL mapping for carrier ${detectedCarrier.code}`);
  }

  // Return fallback response with detected carrier
  res.status(503).json({
    carrier: detectedCarrier.name,
    reference,
    trackingUrl,
    status: 503,
    message: 'Tracking information temporarily unavailable. Please visit the carrier portal below.',
    instructions: 'Copy and paste your container number in the tracking portal',
  });
});

export default router;