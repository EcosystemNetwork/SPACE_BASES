import type { AppProps } from 'next/app';
import '../styles/globals.css';
import { MockAuthProvider } from '../lib/mock-auth';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <MockAuthProvider>
      <Component {...pageProps} />
    </MockAuthProvider>
  );
}
