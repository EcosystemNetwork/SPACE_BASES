import type { NextApiRequest, NextApiResponse } from 'next';

/**
 * Server-side API route to verify Privy authentication tokens
 *
 * This endpoint handles server-side verification of Privy session tokens using
 * the PRIVY_APP_SECRET environment variable.
 *
 * ENVIRONMENT VARIABLES REQUIRED:
 * - PRIVY_APP_SECRET: Your Privy App Secret (server-side only, never exposed to client)
 * 
 * SETUP INSTRUCTIONS:
 * - For local development: Set PRIVY_APP_SECRET in .env file
 * - For Vercel deployment: Set PRIVY_APP_SECRET in Vercel Dashboard → Environment Variables
 * - See docs/PRIVY_SETUP.md for comprehensive setup instructions
 * - Official Privy docs: https://docs.privy.io/basics/react/setup
 *
 * AUTHENTICATION FLOW:
 * 1. Client completes Privy authentication and receives a session token
 * 2. Client sends token to this endpoint via POST request
 * 3. Server verifies token with Privy API using PRIVY_APP_SECRET
 * 4. Server returns user information or error
 *
 * SECURITY NOTES:
 * ⚠️ Never commit PRIVY_APP_SECRET to version control
 * ⚠️ This secret must remain server-side only
 * ⚠️ Rotate secrets regularly in production
 *
 * @see https://docs.privy.io/reference - Privy API Reference
 * @see docs/PRIVY_SETUP.md - SPACE_BASES Privy setup guide
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
