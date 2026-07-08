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

async function getMaerskToken() {
  const tokenUrl = "https://api.maersk.com/oauth2/access_token";

  const params = new URLSearchParams({
    grant_type: "client_credentials",
    client_id: env.MAERSK_CONSUMER_KEY ?? "",
    client_secret: env.MAERSK_CONSUMER_SECRET ?? "",
  });

  const res = await fetch(tokenUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "Consumer-Key": env.MAERSK_CONSUMER_KEY ?? "",
    },
    body: params.toString(),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Maersk token request failed: ${res.status} — ${text}`);
  }

  const data = await res.json();
  return data.access_token;
}

async function testFetch(ref, type) {
  try {
    const token = await getMaerskToken();
    const baseUrl = "https://api.maersk.com/track-and-trace-private";

    const qs = new URLSearchParams();
    if (type === 'equipment') {
      qs.set("equipmentReference", ref.toUpperCase());
    }

    const requestUrl = `${baseUrl}/events?${qs.toString()}`;
    console.log(`Sending GET without eventType to: ${requestUrl}`);
    const res = await fetch(requestUrl, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Consumer-Key": env.MAERSK_CONSUMER_KEY ?? "",
        Accept: "application/json",
      }
    });

    console.log(`Response Status: ${res.status} ${res.statusText}`);
    const text = await res.text();
    console.log(`Response Body:`, text);
  } catch (err) {
    console.error(`Fetch failed:`, err.message);
  }
}

async function run() {
  await testFetch('MRSU4690575', 'equipment');
}

run();
