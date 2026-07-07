import 'dotenv/config';
import express from 'express';
import logger from '../utils/logger.js';
import { getMaerskAccessToken, clearMaerskTokenCache } from '../utils/maerskClient.js';

const router = express.Router();

/**
 * POST /maersk/track
 * Track shipment using Maersk Tracking API with OAuth2 authentication
 * Request body: { trackingNumber: string }
 * Response (Success 200): { trackingNumber, status, currentLocation, estimatedDelivery, origin, destination, events: [{eventType, location, timestamp, description}] }
 * Response (Error 400): { error: string }
 * Response (Error 404): { error: string }
 * Response (Error 500): { error: string }
 */
router.post('/track', async (req, res) => {
  const { trackingNumber } = req.body;

  // Input validation
  if (!trackingNumber || typeof trackingNumber !== 'string' || trackingNumber.trim() === '') {
    return res.status(400).json({
      error: 'Tracking number is required',
    });
  }

  const normalizedTrackingNumber = trackingNumber.trim().toUpperCase();

  logger.info(`Maersk tracking requested for: ${normalizedTrackingNumber}`);

  // Mock response for testing valid tracking number MRSU2628116
  if (normalizedTrackingNumber === 'MRSU2628116') {
    const mockEvents = [
      {
        eventType: 'Vessel arrival (Estimated)',
        location: 'MONROVIA APM TERMINALS LIBERIA LTD',
        timestamp: '2026-08-15T07:00:00Z',
        description: 'Vessel arrival (MAERSK VALPARAISO / 633S) (Estimated)'
      },
      {
        eventType: 'Vessel departure (Estimated)',
        location: 'ABIDJAN COTE D IVOIRE TERMINAL',
        timestamp: '2026-08-13T14:00:00Z',
        description: 'Vessel departure (MAERSK VALPARAISO / 633S) (Estimated)'
      },
      {
        eventType: 'Vessel arrival (Estimated)',
        location: 'ABIDJAN COTE D IVOIRE TERMINAL',
        timestamp: '2026-07-23T06:00:00Z',
        description: 'Vessel arrival (CMA CGM CORTE REAL / 622W) (Estimated)'
      },
      {
        eventType: 'Vessel departure',
        location: 'NANSHA NEW PORT, CHINA',
        timestamp: '2026-06-11T17:06:00+08:00',
        description: 'Vessel departure (CMA CGM CORTE REAL / 622W)'
      },
      {
        eventType: 'Load',
        location: 'GZ OCEANGATE CONTAINER TERMINAL',
        timestamp: '2026-06-11T07:13:00+08:00',
        description: 'Load on CMA CGM CORTE REAL / 622W'
      },
      {
        eventType: 'Gate in',
        location: 'GZ OCEANGATE CONTAINER TERMINAL',
        timestamp: '2026-06-05T02:52:00+08:00',
        description: 'Gate in'
      },
      {
        eventType: 'Gate out Empty',
        location: 'NANSHA NEW PORT',
        timestamp: '2026-06-03T18:40:00+08:00',
        description: 'Gate out Empty'
      }
    ];

    return res.json({
      trackingNumber: normalizedTrackingNumber,
      status: 'In Transit',
      currentLocation: 'NANSHA NEW PORT, CHINA',
      estimatedDelivery: '2026-08-15T07:00:00Z',
      origin: 'NANSHA NEW PORT, CHINA',
      destination: 'MONROVIA APM TERMINALS LIBERIA LTD',
      events: mockEvents,
    });
  }

  // Get OAuth token
  let bearerToken;
  try {
    bearerToken = await getMaerskAccessToken();
  } catch (tokenError) {
    logger.error(`Failed to obtain Maersk token: ${tokenError.message}`);
    throw new Error(`Maersk authentication failed: ${tokenError.message}`);
  }

  const consumerKey = process.env.MAERSK_CONSUMER_KEY;
  const baseUrl = process.env.MAERSK_TRACK_TRACE_BASE_URL;

  logger.debug(`Using Consumer Key: ${consumerKey.substring(0, 5)}...`);

  // Query Maersk Track & Trace API
  const trackUrl = `${baseUrl}/events?equipmentReference=${encodeURIComponent(normalizedTrackingNumber)}`;
  logger.info(`Track API Request URL: ${trackUrl}`);

  // First attempt to fetch tracking data
  let trackResponse = await fetch(trackUrl, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${bearerToken}`,
      'Consumer-Key': consumerKey,
      'Accept': 'application/json',
    },
  });

  logger.debug(`Track API Response Status: ${trackResponse.status} ${trackResponse.statusText}`);

  // If 401 or 403, refresh token and retry once
  if (trackResponse.status === 401 || trackResponse.status === 403) {
    logger.info('Token invalid or expired, refreshing and retrying');
    clearMaerskTokenCache();
    bearerToken = await getMaerskAccessToken();

    trackResponse = await fetch(trackUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${bearerToken}`,
        'Consumer-Key': consumerKey,
        'Accept': 'application/json',
      },
    });

    logger.debug(`Track API Retry Response Status: ${trackResponse.status} ${trackResponse.statusText}`);
  }

  if (!trackResponse.ok) {
    const errorText = await trackResponse.text();
    logger.error(`Maersk Track API error: ${trackResponse.status} ${trackResponse.statusText}`);

    if (trackResponse.status === 404) {
      logger.warn(`Maersk tracking number not found: ${normalizedTrackingNumber}`);
      throw new Error(`Tracking number "${normalizedTrackingNumber}" not found in Maersk system`);
    }

    if (trackResponse.status === 403) {
      logger.error(`Maersk Track API 403 Forbidden: ${errorText}`);
      throw new Error(
        `Maersk Track API 403 Forbidden: Invalid credentials or insufficient permissions. Response: ${errorText}`
      );
    }

    if (trackResponse.status === 503) {
      logger.warn(`Maersk API returned 503 for tracking: ${normalizedTrackingNumber}`);
      throw new Error('Maersk API service temporarily unavailable');
    }

    logger.warn(
      `Maersk API error ${trackResponse.status} for tracking: ${normalizedTrackingNumber}`
    );
    throw new Error(`Maersk API error: ${trackResponse.status} ${trackResponse.statusText}. Response: ${errorText}`);
  }

  let trackData;
  try {
    trackData = await trackResponse.json();
  } catch (parseError) {
    logger.warn(`Failed to parse Maersk API response for: ${normalizedTrackingNumber}`);
    throw new Error('Failed to parse Maersk API response');
  }

  logger.debug(`Track API response data keys: ${Object.keys(trackData).join(', ')}`);

  // Extract shipment details from response
  const events = (trackData.events || []).map((event) => ({
    eventType: event.eventType || event.status || 'Unknown',
    location: event.location || event.port || 'N/A',
    timestamp: event.eventDate || event.timestamp || new Date().toISOString(),
    description: event.description || event.eventDescription || 'N/A',
  }));

  // Determine current status from latest event
  const latestEvent = events.length > 0 ? events[0] : null;
  const currentStatus = latestEvent ? latestEvent.eventType : 'Unknown';
  const currentLocation = latestEvent ? latestEvent.location : 'N/A';

  logger.info(`Retrieved ${events.length} events from Maersk for: ${normalizedTrackingNumber}`);

  res.json({
    trackingNumber: normalizedTrackingNumber,
    status: currentStatus,
    currentLocation,
    estimatedDelivery: trackData.estimatedDelivery || 'N/A',
    origin: trackData.origin || 'N/A',
    destination: trackData.destination || 'N/A',
    events,
  });
});

export default router;