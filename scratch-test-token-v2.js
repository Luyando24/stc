const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith('#')) return;
  const index = trimmed.indexOf('=');
  if (index === -1) return;
  env[trimmed.substring(0, index).trim()] = trimmed.substring(index + 1).trim();
});

async function getMaerskTokenV2() {
  const tokenUrl = "https://api.maersk.com/customer-identity/oauth/v2/access_token";

  const params = new URLSearchParams({
    grant_type: "client_credentials",
    client_id: env.MAERSK_CONSUMER_KEY ?? "",
    client_secret: env.MAERSK_CONSUMER_SECRET ?? "",
  });

  console.log(`Sending token V2 POST to: ${tokenUrl}`);
  const res = await fetch(tokenUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "Consumer-Key": env.MAERSK_CONSUMER_KEY ?? "",
    },
    body: params.toString(),
  });

  console.log(`Token V2 Response Status: ${res.status} ${res.statusText}`);
  const text = await res.text();
  console.log(`Token V2 Response Body:`, text);
}

getMaerskTokenV2();
