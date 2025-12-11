import { usePrivy, User } from '@privy-io/react-auth';
import { isPrivyConfigured } from '../lib/privy-config';

interface HomeContentProps {
  ready: boolean;
  authenticated: boolean;
  user: User | null;
  login: () => void;
  logout: () => void;
}

// Configuration instructions constant
const CONFIG_INSTRUCTIONS = `⚠️ Authentication not configured!

Please set up your Privy API key:
1. Copy .env.example to .env
2. Add your NEXT_PUBLIC_PRIVY_API_KEY
3. Restart the development server

Get your API key at: https://dashboard.privy.io`;

// Component that uses Privy hooks when configured
function HomeWithPrivy() {
  const { ready, authenticated, user, login, logout } = usePrivy();
  return <HomeContent ready={ready} authenticated={authenticated} user={user} login={login} logout={logout} />;
}

// Component for when Privy is not configured
function HomeWithoutPrivy() {
  const login = () => {
    alert(CONFIG_INSTRUCTIONS);
  };
  return <HomeContent ready={true} authenticated={false} user={null} login={login} logout={() => {}} />;
}

// Shared UI component
function HomeContent({ ready, authenticated, user, login, logout }: HomeContentProps) {
  const privyConfigured = isPrivyConfigured();

  return (
    <div className="page-wrapper">
      {/* Animated background */}
      <div className="stars"></div>
      <div className="stars2"></div>
      <div className="stars3"></div>

      <header className="header">
        <div className="container">
          <div className="header-content">
            <div className="logo">
              <div className="logo-icon">🚀</div>
              <div>
                <div className="logo-name">SPACE_BASES</div>
                <div className="logo-tagline">QUANT Economy on Mantle</div>
              </div>
            </div>
            <div className="header-actions">
              {authenticated && user ? (
                <>
                  <span className="user-info">
                    👤 {user.email?.address || user.id || 'user'}
                  </span>
                  <button className="btn btn-secondary" onClick={logout}>
                    Logout
                  </button>
                </>
              ) : (
                <button className="btn btn-primary" onClick={login} disabled={!ready}>
                  <span>🔐</span>
                  Connect with Privy
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Configuration Warning Banner */}
      {!privyConfigured && (
        <div className="config-warning-banner">
          ⚠️ <strong>Configuration Required:</strong> Please set up your Privy API key in the .env file. 
          See <a href="https://dashboard.privy.io" target="_blank" rel="noopener noreferrer">Privy Dashboard</a> to get your credentials.
        </div>
      )}

      <main className="main">
        <div className="container">
          {/* Hero Section */}
          <section className="hero">
            <div className="hero-badge">
              <span className="badge-dot"></span>
              Building the Future of DeFi
            </div>
            <h1 className="hero-title">
              Welcome to the
              <span className="gradient-text"> Quantum Economy</span>
            </h1>
            <p className="hero-description">
              Experience next-generation DeFi on Mantle. Secure authentication powered by Privy,
              limitless possibilities powered by blockchain technology.
            </p>
            <div className="hero-actions">
              <button className="btn btn-large btn-primary" onClick={login} disabled={!ready}>
                <span>🚀</span>
                Get Started
              </button>
              <a href="#features" className="btn btn-large btn-outline">
                Learn More
              </a>
            </div>
          </section>

          {/* Features Section */}
          <section id="features" className="features">
            <div className="section-header">
              <h2 className="section-title">Why SPACE_BASES?</h2>
              <p className="section-description">
                Built for the next generation of decentralized finance
              </p>
            </div>
            
            <div className="feature-grid">
              <div className="feature-card">
                <div className="feature-icon">🔒</div>
                <h3 className="feature-title">Secure Authentication</h3>
                <p className="feature-description">
                  Privy-powered login ensures your identity and assets are always protected
                  with enterprise-grade security.
                </p>
              </div>

              <div className="feature-card">
                <div className="feature-icon">⚡</div>
                <h3 className="feature-title">Lightning Fast</h3>
                <p className="feature-description">
                  Built on Mantle for blazing-fast transactions with minimal gas fees.
                  Experience DeFi at the speed of thought.
                </p>
              </div>

              <div className="feature-card">
                <div className="feature-icon">🌐</div>
                <h3 className="feature-title">Decentralized</h3>
                <p className="feature-description">
                  True decentralization with no single point of failure. Your keys,
                  your crypto, your control.
                </p>
              </div>

              <div className="feature-card">
                <div className="feature-icon">💎</div>
                <h3 className="feature-title">NFT Integration</h3>
                <p className="feature-description">
                  Seamlessly interact with NFTs and digital assets. Trade, collect,
                  and showcase in one unified platform.
                </p>
              </div>

              <div className="feature-card">
                <div className="feature-icon">🤝</div>
                <h3 className="feature-title">Community Driven</h3>
                <p className="feature-description">
                  Join a thriving community of innovators building the future of finance
                  together.
                </p>
              </div>

              <div className="feature-card">
                <div className="feature-icon">🛠️</div>
                <h3 className="feature-title">Developer Friendly</h3>
                <p className="feature-description">
                  Comprehensive APIs and SDKs make building on SPACE_BASES intuitive
                  and powerful.
                </p>
              </div>
            </div>
          </section>

          {/* CTA Section */}
          <section className="cta">
            <div className="cta-card">
              <h2 className="cta-title">Ready to Launch?</h2>
              <p className="cta-description">
                Join thousands of users already exploring the quantum economy.
                Get started in seconds with Privy authentication.
              </p>
              <button className="btn btn-large btn-primary" onClick={login} disabled={!ready}>
                <span>🚀</span>
                Connect Your Wallet
              </button>
            </div>
          </section>
        </div>
      </main>

      <footer className="footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-section">
              <div className="logo-name">SPACE_BASES</div>
              <p className="footer-text">
                Building the future of decentralized finance on Mantle.
              </p>
            </div>
            <div className="footer-section">
              <h4 className="footer-heading">Product</h4>
              <ul className="footer-links">
                <li><a href="#features">Features</a></li>
                <li><a href="#security">Security</a></li>
                <li><a href="#docs">Documentation</a></li>
              </ul>
            </div>
            <div className="footer-section">
              <h4 className="footer-heading">Community</h4>
              <ul className="footer-links">
                <li><a href="#discord">Discord</a></li>
                <li><a href="#twitter">Twitter</a></li>
                <li><a href="#github">GitHub</a></li>
              </ul>
            </div>
            <div className="footer-section">
              <h4 className="footer-heading">Resources</h4>
              <ul className="footer-links">
                <li><a href="#blog">Blog</a></li>
                <li><a href="#support">Support</a></li>
                <li><a href="#api">API</a></li>
              </ul>
            </div>
          </div>
          <div className="footer-bottom">
            <p>© 2024 SPACE_BASES. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

// Main component that checks configuration
export default function Home() {
  return isPrivyConfigured() ? <HomeWithPrivy /> : <HomeWithoutPrivy />;
}
