import type { NextApiRequest, NextApiResponse } from 'next';

/**
 * Server-side scaffold to verify a Privy session token / webhook.
 *
 * IMPORTANT:
 * - Do NOT commit your PRIVY_APP_SECRET. Put it in an environment variable (PRIVY_APP_SECRET).
 * - Replace the example endpoint and verification logic below with Privy's official verification API or SDK.
 * - Example flow:
 *   1. Client completes Privy hosted widget flow and receives a session token (or Privy sends a webhook to your server).
 *   2. Client posts the token to this endpoint.
 *   3. Server calls Privy's verification API with your PRIVY_APP_SECRET to validate the token and fetch user info.
 *
 * See: https://docs.privy.io/welcome (use the official SDK or REST API)
 */

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { token } = req.body;
  if (!token) {
    return res.status(400).json({ error: 'Missing token in request body' });
  }

  const PRIVY_APP_SECRET = process.env.PRIVY_APP_SECRET;
  if (!PRIVY_APP_SECRET) {
    console.error('Missing PRIVY_APP_SECRET environment variable.');
    return res.status(500).json({ error: 'Server not configured' });
  }

  try {
    // Example: call Privy verification endpoint (pseudocode).
    // Replace the URL and payload with the correct Privy REST endpoint or use their server SDK.
    const verifyResp = await fetch('https://api.privy.io/v1/verify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // If Privy expects an Authorization header with app secret, adapt as required:
        'Authorization': `Bearer ${PRIVY_APP_SECRET}`
      },
      body: JSON.stringify({ token })
    });

    if (!verifyResp.ok) {
      const text = await verifyResp.text();
      console.error('Privy verification failed:', verifyResp.status, text);
      return res.status(401).json({ error: 'Invalid token' });
    }

    const user = await verifyResp.json();
    // At this point, you can create a local session (set cookie, JWT), or return user info to client.
    // Example: return user info (DO NOT leak secrets).
    return res.status(200).json({ ok: true, user });
  } catch (err) {
    console.error('Error verifying Privy token:', err);
    return res.status(500).json({ error: 'Verification failed' });
  }
}
