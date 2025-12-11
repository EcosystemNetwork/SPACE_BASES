/**
 * Main App Component for SPACE_BASES
 * 
 * This component wraps the entire application with PrivyProvider for authentication.
 * 
 * Privy Setup:
 * - Requires NEXT_PUBLIC_PRIVY_API_KEY environment variable
 * - Optional PRIVY_APP_SECRET for server-side verification
 * - See docs/PRIVY_SETUP.md for detailed setup instructions
 * - Official guide: https://docs.privy.io/basics/react/setup
 * 
 * For Vercel deployment:
 * - Set environment variables in Vercel Dashboard
 * - Configure allowed origins in Privy Dashboard
 * - See docs/PRIVY_SETUP.md for deployment instructions
 */

import type { AppProps } from 'next/app';
import { PrivyProvider } from '@privy-io/react-auth';
import '../styles/globals.css';
import { useEffect, useState } from 'react';
import { isPrivyConfigured } from '../lib/privy-config';

export default function App({ Component, pageProps }: AppProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Don't render Privy provider during SSR
  if (!mounted) {
    return <Component {...pageProps} />;
  }

  // If Privy is not configured, render without provider
  if (!isPrivyConfigured()) {
    return <Component {...pageProps} />;
  }

  // Render app with Privy provider when configured
  const privyAppId = process.env.NEXT_PUBLIC_PRIVY_API_KEY || '';
  
  return (
    <PrivyProvider
      appId={privyAppId}
      config={{
        // Customize Privy appearance and behavior
        appearance: {
          theme: 'dark',
          accentColor: '#6366f1',
        },
        // Enable wallet connection
        loginMethods: ['email', 'wallet'],
      }}
    >
      <Component {...pageProps} />
    </PrivyProvider>
  );
}
