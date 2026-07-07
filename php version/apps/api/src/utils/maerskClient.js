import 'dotenv/config';
import logger from './logger.js';

// In-memory token cache
let cachedToken = null;
let tokenExpiresAt = null;

/**
 * Get Maersk OAuth 2.0 access token using client credentials flow
 * Implements token caching with automatic refresh 5 minutes before expiry
 * @returns {Promise<string>} Access token
 * @throws {Error} If authentication fails
 */
export async function getMaerskAccessToken() {
  const consumerKey = process.env.MAERSK_CONSUMER_KEY;
  const consumerSecret = process.env.MAERSK_CONSUMER_SECRET;
  const tokenUrl = process.env.MAERSK_TOKEN_URL;

  // Validate credentials are configured
  if (!consumerKey || !consumerSecret || !tokenUrl) {
    logger.error('Maersk OAuth credentials missing');
    logger.error(`  MAERSK_CONSUMER_KEY: ${consumerKey ? 'configured' : 'MISSING'}`);
    logger.error(`  MAERSK_CONSUMER_SECRET: ${consumerSecret ? 'configured' : 'MISSING'}`);
    logger.error(`  MAERSK_TOKEN_URL: ${tokenUrl ? 'configured' : 'MISSING'}`);
    throw new Error('Maersk authentication failed. Missing required environment variables: MAERSK_CONSUMER_KEY, MAERSK_CONSUMER_SECRET, MAERSK_TOKEN_URL');
  }

  // Check if cached token is still valid (refresh 5 minutes before expiry)
  const now = Date.now();
  const refreshBuffer = 5 * 60 * 1000; // 5 minutes in milliseconds

  if (cachedToken && tokenExpiresAt && now < (tokenExpiresAt - refreshBuffer)) {
    logger.info('Using cached Maersk OAuth token');
    const remainingSeconds = Math.floor((tokenExpiresAt - now) / 1000);
    logger.debug(`  Token expires in ${remainingSeconds} seconds`);
    return cachedToken;
  }

  logger.info('Requesting new Maersk OAuth token');
  logger.debug(`  OAuth Endpoint: ${tokenUrl}`);
  logger.debug(`  Consumer Key (prefix): ${consumerKey.substring(0, 5)}...`);

  // Build request body per OAuth 2.0 client credentials spec
  const requestBody = new URLSearchParams({
    grant_type: 'client_credentials',
    client_id: consumerKey,
    client_secret: consumerSecret,
  }).toString();

  logger.debug(`  Request Body Format: application/x-www-form-urlencoded`);
  logger.debug(`  Request Body Keys: grant_type, client_id, client_secret`);
  logger.debug(`  Request Headers: Content-Type: application/x-www-form-urlencoded, Accept: application/json`);

  // Request new token from Maersk OAuth endpoint
  const response = await fetch(tokenUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Accept': 'application/json',
    },
    body: requestBody,
  });

  logger.debug(`Maersk OAuth Response Status: ${response.status} ${response.statusText}`);

  // Read response body for logging
  const responseText = await response.text();
  logger.debug(`Maersk OAuth Response Body: ${responseText.substring(0, 200)}${responseText.length > 200 ? '...' : ''}`);

  if (!response.ok) {
    logger.error(`Maersk OAuth Error: ${response.status} ${response.statusText}`);
    logger.error(`  Response Body: ${responseText}`);

    if (response.status === 400) {
      throw new Error(`Maersk OAuth 400 Bad Request: Invalid credentials or request format. Response: ${responseText}`);
    }
    if (response.status === 401) {
      throw new Error(`Maersk OAuth 401 Unauthorized: Invalid Consumer Key or Secret. Response: ${responseText}`);
    }
    if (response.status === 403) {
      throw new Error(`Maersk OAuth 403 Forbidden: Insufficient permissions. Response: ${responseText}`);
    }
    if (response.status === 503) {
      throw new Error(`Maersk OAuth 503 Service Unavailable: Maersk service temporarily down. Response: ${responseText}`);
    }
    throw new Error(`Maersk OAuth ${response.status} Error: ${response.statusText}. Response: ${responseText}`);
  }

  let data;
  try {
    data = JSON.parse(responseText);
  } catch (parseError) {
    logger.error(`Failed to parse Maersk OAuth response as JSON`);
    logger.error(`  Response Text: ${responseText}`);
    throw new Error(`Maersk OAuth response is not valid JSON: ${responseText}`);
  }

  logger.debug(`Maersk OAuth Response Keys: ${Object.keys(data).join(', ')}`);

  if (!data.access_token || !data.expires_in) {
    logger.error(`Invalid Maersk OAuth response: missing required fields`);
    logger.error(`  access_token: ${data.access_token ? 'present' : 'MISSING'}`);
    logger.error(`  expires_in: ${data.expires_in ? 'present' : 'MISSING'}`);
    logger.error(`  Full Response: ${JSON.stringify(data)}`);
    throw new Error(`Maersk OAuth response missing access_token or expires_in: ${JSON.stringify(data)}`);
  }

  // Cache the token with expiration time
  cachedToken = data.access_token;
  tokenExpiresAt = now + (data.expires_in * 1000);

  logger.info(`Maersk OAuth token obtained successfully`);
  logger.debug(`  Token (prefix): ${data.access_token.substring(0, 10)}...`);
  logger.debug(`  Expires in: ${data.expires_in} seconds`);
  logger.debug(`  Token will be cached and reused until ${new Date(tokenExpiresAt).toISOString()}`);

  return cachedToken;
}

/**
 * Force refresh the cached token (used for retry logic)
 */
export function clearMaerskTokenCache() {
  cachedToken = null;
  tokenExpiresAt = null;
  logger.info('Maersk token cache cleared - next request will fetch a new token');
}