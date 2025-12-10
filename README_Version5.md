# SPACE_BASES — Landing + Privy Login (scaffold)

This folder contains a minimal Next.js landing page and a server-side scaffold to integrate Privy authentication.

Important: Do NOT commit your Privy API key or secret. Put them in a local .env file (see .env.example) and ensure .env is listed in .gitignore.

Quickstart (local)
1. Install deps
   npm install

2. Create local env file
   cp .env.example .env
   # Edit .env and add your keys:
   # NEXT_PUBLIC_PRIVY_API_KEY=your_public_key_here
   # PRIVY_APP_SECRET=your_privy_app_secret_here

3. Run dev server
   npm run dev
   # Open http://localhost:3000

What is included
- pages/index.tsx — landing page + client-side Privy widget loader and login button
- pages/_app.tsx — minimal app wrapper
- pages/api/auth/privy/verify.ts — server-side scaffold to accept a Privy token and verify it (replace the example verification with the exact Privy API/SDK calls per docs)
- .env.example — example environment variables (do not commit real secrets)
- .gitignore — ignores .env, node_modules, .next
- package.json, tsconfig.json, next.config.mjs — Next.js app config

Notes / next steps
- The client uses Privy's hosted widget script (loaded at runtime). See Privy docs: https://docs.privy.io/welcome for exact widget usage and server verification endpoints.
- You must add your NEXT_PUBLIC_PRIVY_API_KEY to .env (client-side public API key) and PRIVY_APP_SECRET to .env (server secret).
- The server verification endpoint in pages/api/auth/privy/verify.ts is a scaffold showing how to accept a token and call Privy server endpoints to verify; update it per Privy docs / SDK.
- After verification works, you can:
  - Wire a secure session (HTTP-only cookie or JWT) and user storage.
  - Add wallet linking (connect a wallet and associate to Privy identity).
  - Deploy a staging version to Vercel or another host.