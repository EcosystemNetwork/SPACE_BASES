import type { AppProps } from 'next/app';
import { PrivyProvider } from '@privy-io/react-auth';
import '../styles/globals.css';
import { useEffect, useState } from 'react';
import { isPrivyConfigured, isMockAuthEnabled } from '../lib/privy-config';
import { MockAuthProvider } from '../lib/mock-auth';

export default function App({ Component, pageProps }: AppProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Don't render during SSR
  if (!mounted) {
    return <Component {...pageProps} />;
  }

  // Use mock authentication if enabled
  if (isMockAuthEnabled()) {
    return (
      <MockAuthProvider>
        <Component {...pageProps} />
      </MockAuthProvider>
    );
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
