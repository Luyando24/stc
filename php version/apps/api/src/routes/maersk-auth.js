import express from 'express';
import logger from '../utils/logger.js';

const router = express.Router();

// In-memory token cache
let cachedToken = null;
let tokenExpiresAt = null;

/**
 * POST /auth/maersk-token
 * Get OAuth 2.0 Bearer token using client credentials flow
 * Response (Success 200): { token: string, expiresIn: number }
 * Response (Fallback 503): { token: null, status: 503, message: string }
 */
router.post('/maersk-token', async (req, res) => {
  const consumerKey = process.env.MAERSK_CONSUMER_KEY;
  const clientSecret = process.env.MAERSK_CLIENT_SECRET;

  // Validate credentials are configured
  if (!consumerKey || !clientSecret) {
    logger.warn('Maersk credentials not configured, returning fallback');
    return res.status(503).json({
      token: null,
      status: 503,
      message: 'Maersk authentication temporarily unavailable. Please use manual tracking.',
    });
  }

  // Check if cached token is still valid
  const now = Date.now();
  if (cachedToken && tokenExpiresAt && now < tokenExpiresAt) {
    logger.info('Returning cached Maersk token');
    const expiresIn = Math.floor((tokenExpiresAt - now) / 1000);
    return res.json({ token: cachedToken, expiresIn });
  }

  logger.info('Requesting new Maersk OAuth token');

  // Request new token from Maersk OAuth endpoint
  const response = await fetch('https://api.maersk.com/oauth2/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Accept': 'application/json',
    },
    body: new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: consumerKey,
      client_secret: clientSecret,
    }).toString(),
  });

  if (!response.ok) {
    if (response.status === 503) {
      logger.warn(`Maersk OAuth service unavailable (503)`);
      return res.status(503).json({
        token: null,
        status: 503,
        message: 'Maersk authentication temporarily unavailable. Please use manual tracking.',
      });
    }
    throw new Error(
      `Maersk OAuth error: ${response.status} ${response.statusText}`
    );
  }

  const data = await response.json();

  if (!data.access_token || !data.expires_in) {
    throw new Error('Invalid Maersk OAuth response: missing access_token or expires_in');
  }

  // Cache the token with expiration time (subtract 60 seconds buffer)
  cachedToken = data.access_token;
  tokenExpiresAt = now + (data.expires_in * 1000) - 60000;

  logger.info(`Maersk token cached, expires in ${data.expires_in} seconds`);

  res.json({
    token: data.access_token,
    expiresIn: data.expires_in,
  });
});

export default router;