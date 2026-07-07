import express from 'express';
import logger from '../utils/logger.js';
import maerskRouter from './maersk.js';
import cmaRouter from './cma.js';
import mscRouter from './msc.js';
import evergreenRouter from './evergreen.js';
import ooclRouter from './oocl.js';
import coscoRouter from './cosco.js';
import hapagRouter from './hapag.js';
import zimRouter from './zim.js';
import oneRouter from './one.js';

const router = express.Router();

const VALID_REFERENCE_TYPES = [
  'equipmentReference',
  'transportDocumentReference',
  'carrierBookingReference',
];

/**
 * Detect carrier from reference (container prefix)
 * Checks 4-character prefix first, then 3-character prefix
 * Returns carrier code: 'maersk', 'cma', 'msc', 'evergreen', 'oocl', 'cosco', 'hapag', 'zim', 'one', or null
 */
function detectCarrier(reference) {
  if (!reference || typeof reference !== 'string') {
    return null;
  }

  const upperRef = reference.toUpperCase().trim();

  // Check 4-character prefixes first (more specific)
  const prefix4 = upperRef.substring(0, 4);

  if (prefix4 === 'MAEU') return 'maersk';
  if (prefix4 === 'CMAU') return 'cma';
  if (prefix4 === 'MSCU') return 'msc';
  if (prefix4 === 'GECO') return 'evergreen';
  if (prefix4 === 'OOCL' || prefix4 === 'OOLU') return 'oocl';
  if (prefix4 === 'COSU') return 'cosco';
  if (prefix4 === 'HAPA') return 'hapag';
  if (prefix4 === 'ZIMU') return 'zim';
  if (prefix4 === 'ONEU') return 'one';

  // Check 3-character prefixes (less specific)
  const prefix3 = upperRef.substring(0, 3);

  if (prefix3 === 'MAE') return 'maersk';
  if (prefix3 === 'CMA') return 'cma';
  if (prefix3 === 'MSC') return 'msc';
  if (prefix3 === 'GGZ') return 'evergreen';
  if (prefix3 === 'COS') return 'cosco';
  if (prefix3 === 'HAP') return 'hapag';
  if (prefix3 === 'ZIM') return 'zim';
  if (prefix3 === 'ONE') return 'one';

  // Check 5-character prefix for COSCO (special case)
  if (upperRef.substring(0, 5) === 'COSCO') return 'cosco';

  // Unable to detect carrier
  return null;
}

/**
 * Map carrier code to router handler
 */
const carrierRouters = {
  'maersk': maerskRouter,
  'cma': cmaRouter,
  'msc': mscRouter,
  'evergreen': evergreenRouter,
  'oocl': ooclRouter,
  'cosco': coscoRouter,
  'hapag': hapagRouter,
  'zim': zimRouter,
  'one': oneRouter,
};

/**
 * POST /auto
 * Auto-detect carrier from reference prefix and route to appropriate carrier endpoint
 * Request body: { reference: string, referenceType?: string }
 * Response (Success 503): { carrier: string, reference: string, trackingUrl: string, status: 503, message: string, instructions: string }
 * Response (Error 400): { error: string }
 */
router.post('/', async (req, res) => {
  const { reference, referenceType } = req.body;

  // Input validation
  if (!reference || typeof reference !== 'string' || reference.trim() === '') {
    return res.status(400).json({
      error: 'Carrier not recognized. Please select your carrier manually from the tracking options.',
    });
  }

  if (referenceType && !VALID_REFERENCE_TYPES.includes(referenceType)) {
    return res.status(400).json({
      error: `Invalid referenceType. Must be one of: ${VALID_REFERENCE_TYPES.join(', ')}`,
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

  logger.info(`Auto-detected carrier: ${detectedCarrier} for reference: ${reference}`);

  // Get the carrier router handler
  const carrierHandler = carrierRouters[detectedCarrier];

  if (!carrierHandler) {
    logger.error(`No handler mapping for carrier: ${detectedCarrier}`);
    throw new Error(`Internal error: No handler mapping for carrier ${detectedCarrier}`);
  }

  // Call the carrier router's POST handler directly
  // The carrier router expects (req, res) and will handle the response
  return carrierHandler.stack[0].handle(req, res);
});

export default router;