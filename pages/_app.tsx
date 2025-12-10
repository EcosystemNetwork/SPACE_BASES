import type { AppProps } from 'next/app';
import { PrivyProvider } from '@privy-io/react-auth';
import '../styles/globals.css';
import { useEffect, useState } from 'react';

export default function App({ Component, pageProps }: AppProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Don't render Privy provider during SSR
  if (!mounted) {
    return <Component {...pageProps} />;
  }

  return (
    <PrivyProvider
      appId={process.env.NEXT_PUBLIC_PRIVY_API_KEY || ''}
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
