import { useEffect, useState } from 'react';

export default function Home() {
  const [loaded, setLoaded] = useState(false);
  const [user, setUser] = useState<any>(null);
  const pubKey = process.env.NEXT_PUBLIC_PRIVY_API_KEY;

  useEffect(() => {
    // Dynamically load the Privy widget script at runtime
    const id = 'privy-widget-script';
    if (!document.getElementById(id)) {
      const s = document.createElement('script');
      s.src = 'https://cdn.privy.io/widget.js';
      s.id = id;
      s.async = true;
      s.onload = () => {
        console.log('Privy widget script loaded (if available).');
        setLoaded(true);
      };
      s.onerror = () => {
        console.warn('Could not load Privy widget script — verify CDN URL in docs.');
        setLoaded(true);
      };
      document.body.appendChild(s);
    } else {
      setLoaded(true);
    }
  }, []);

  async function handleLoginWithPrivy() {
    // The right integration depends on the Privy usage mode (hosted widget, popup, or SDK).
    // Below is a safe pattern: attempt to open the widget (if present).
    try {
      // @ts-ignore
      const privy = (window as any).privy;
      if (privy && typeof privy.open === 'function') {
        // Example: open the hosted widget (you may need to pass config including your PUBLIC key)
        // See Privy docs for the exact options to pass.
        // @ts-ignore
        privy.open({ apiKey: pubKey });
        // The widget should call your server callback or return a session token via a redirect or callback.
      } else {
        alert('Privy widget not available. Check that the script URL and Privy docs are up-to-date.');
      }
    } catch (err) {
      console.error('Privy login error:', err);
      alert('Could not open Privy login. See console for details.');
    }
  }

  async function handleLogout() {
    setUser(null);
  }

  return (
    <div>
      <header className="container header">
        <div className="logo">
          <div className="name">SPACE_BASES</div>
          <div className="small">QUANT economy — Mantle</div>
        </div>
        <div>
          {user ? (
            <>
              <span className="small" style={{marginRight:12}}>Signed in: {user.email || user.id || 'user'}</span>
              <button className="btn" onClick={handleLogout}>Logout</button>
            </>
          ) : (
            <button className="btn" onClick={handleLoginWithPrivy}>Login with Privy</button>
          )}
        </div>
      </header>

      <main className="container" style={{marginTop:24}}>
        <section className="card">
          <h1>Welcome to SPACE_BASES</h1>
          <p className="small">
            A sci-fi DeFi/NFT experience on Mantle. Sign in with Privy to get started — this demo loads the Privy widget and shows a server-side verification scaffold.
          </p>

          <div style={{marginTop:18}}>
            <h3>Get started</h3>
            <ol className="small">
              <li>Copy <code>.env.example</code> → <code>.env</code> and add your Privy keys (do not commit).</li>
              <li>Run <code>npm run dev</code> and open <code>http://localhost:3000</code>.</li>
              <li>Click "Login with Privy" — follow Privy's hosted flow. Then implement server verification per Privy docs.</li>
            </ol>
          </div>
        </section>
      </main>
    </div>
  );
}