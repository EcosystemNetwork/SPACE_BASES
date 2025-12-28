import { useMockAuth, MockUser } from '../lib/mock-auth';

interface HomeContentProps {
  ready: boolean;
  authenticated: boolean;
  user: MockUser | null;
  login: () => void;
  logout: () => void;
}

// Shared UI component
function HomeContent({ ready, authenticated, user, login, logout }: HomeContentProps) {
  const resourceStats = [
    { label: 'Energy', value: '4,200', change: '+120/hr', icon: '⚡', fill: '76%' },
    { label: 'Alloys', value: '1,860', change: '+45/hr', icon: '🪨', fill: '52%' },
    { label: 'Credits', value: '9,450', change: '+310/hr', icon: '💳', fill: '68%' },
    { label: 'Research', value: '620', change: '+18/hr', icon: '🔬', fill: '44%' },
    { label: 'Crew', value: '42', change: 'Stable', icon: '👩‍🚀', fill: '84%' },
  ];

  const buildingQueue = [
    { name: 'Solar Array Extension', eta: '6m', cost: '320 Energy', benefit: '+12% energy cap' },
    { name: 'Habitat Ring', eta: '12m', cost: '540 Alloys', benefit: '+10 crew capacity' },
    { name: 'Docking Bay Mk.I', eta: '18m', cost: '680 Alloys', benefit: 'Unlocks shuttle trade' },
  ];

  const techQueue = [
    { name: 'Quantum Routing', eta: '9m', cost: '240 Research', benefit: 'Reduces build times by 5%' },
    { name: 'Atmospheric Shields', eta: '14m', cost: '320 Research', benefit: '+15% base integrity' },
  ];

  const crewOrders = [
    { name: 'Lt. Mira Kade', role: 'Operations', task: 'Monitoring fusion core', status: 'Nominal', next: 'Schedule calibration' },
    { name: 'Chief Rho Tan', role: 'Engineering', task: 'Supervising Solar Array extension', status: 'In progress', next: 'Deploy maintenance drones' },
    { name: 'Dr. Nyla Orin', role: 'Science', task: 'Sequencing atmospheric shield lattice', status: 'Ready to deploy', next: 'Initiate field test' },
    { name: 'Cmdr. Jex Hale', role: 'Security', task: 'Patrolling outer ring', status: 'Clear', next: 'Assign to docking bay' },
  ];

  const missionDirectives = [
    { label: 'Stability', value: '93%', detail: 'Core vitals steady' },
    { label: 'Readiness', value: 'Level 1', detail: 'Upgrade path unlocked' },
    { label: 'Output', value: '+14% boost', detail: 'Efficiencies active' },
  ];

  // Determine the connection button text
  const getConnectionButtonText = () => {
    return 'Connect Wallet (Mock)';
  };

  // Determine the connection button icon
  const getConnectionButtonIcon = () => {
    return '🧪';
  };

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
                <div className="logo-tagline">Command Deck Online</div>
              </div>
            </div>
            <div className="header-actions">
              <div className="status-pill online">Status: Stable Orbit</div>
              {authenticated && user ? (
                <div className="hud-chip">
                  <span className="hud-label">Pilot</span>
                  <span className="hud-value">{user.email?.address || user.id || 'user'}</span>
                  <button className="btn btn-secondary" onClick={logout}>
                    Logout
                  </button>
                </div>
              ) : (
                <button className="btn btn-primary" onClick={login} disabled={!ready}>
                  <span>{getConnectionButtonIcon()}</span>
                  {getConnectionButtonText()}
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="main">
        <div className="container">
          {authenticated ? (
            <>
              <section className="command-brief">
                <div className="command-card holo-card">
                  <div className="brief-top">
                    <span className="chip">Spacebase Level 1</span>
                    <span className="status-pill online">Docked &amp; Secure</span>
                  </div>
                  <h2 className="section-title small">Command Overview</h2>
                  <p className="section-description">Welcome back, commander. Crew is awaiting your build directives.</p>
                  <div className="brief-grid">
                    <div className="mini-map">
                      <div className="mini-map-grid">
                        <span className="map-node active">Core</span>
                        <span className="map-node">Ring</span>
                        <span className="map-node">Dock</span>
                        <span className="map-node">Hab</span>
                      </div>
                      <p className="map-caption">Orbiting D-42 / Stable vector</p>
                    </div>
                    <div className="brief-stats">
                      {missionDirectives.map((directive) => (
                        <div key={directive.label} className="brief-stat">
                          <div className="stat-label">{directive.label}</div>
                          <div className="stat-value">{directive.value}</div>
                          <div className="stat-detail">{directive.detail}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </section>

              <section className="resource-bar">
                {resourceStats.map((resource) => (
                  <div key={resource.label} className="resource-chip">
                    <div className="resource-header">
                      <span className="resource-icon">{resource.icon}</span>
                      <div className="resource-meta">
                        <span className="resource-label">{resource.label}</span>
                        <span className="resource-change">{resource.change}</span>
                      </div>
                      <span className="resource-value">{resource.value}</span>
                    </div>
                    <div className="resource-progress">
                      <span style={{ width: resource.fill }}></span>
                    </div>
                  </div>
                ))}
              </section>

              <div className="command-grid">
                <section className="panel base-overview holo-card">
                  <div className="panel-header">
                    <div>
                      <p className="panel-label">Spacebase Level 1</p>
                      <h3 className="panel-title">Habitat &amp; Control Ring</h3>
                    </div>
                    <button className="btn btn-secondary">Open Star Chart</button>
                  </div>
                  <div className="base-status">
                    <div>
                      <p className="stat-label">Integrity</p>
                      <p className="stat-value">87%</p>
                      <div className="stat-bar"><span style={{ width: '87%' }}></span></div>
                    </div>
                    <div>
                      <p className="stat-label">Power Flow</p>
                      <p className="stat-value">+14%</p>
                      <div className="stat-bar alt"><span style={{ width: '64%' }}></span></div>
                    </div>
                    <div>
                      <p className="stat-label">Crew Morale</p>
                      <p className="stat-value">Steady</p>
                      <div className="stat-bar"><span style={{ width: '72%' }}></span></div>
                    </div>
                  </div>
                  <div className="module-grid">
                    <div className="module-card">
                      <p className="module-label">Core</p>
                      <p className="module-title">Fusion Reactor</p>
                      <p className="module-detail">Producing 420 Energy / hr</p>
                    </div>
                    <div className="module-card">
                      <p className="module-label">Logistics</p>
                      <p className="module-title">Cargo Spines</p>
                      <p className="module-detail">Dock throughput stable</p>
                    </div>
                    <div className="module-card">
                      <p className="module-label">Habitation</p>
                      <p className="module-title">Crew Pods</p>
                      <p className="module-detail">42 / 50 berths occupied</p>
                    </div>
                  </div>
                </section>

                <section className="panel build-menu holo-card">
                  <div className="panel-header">
                    <div>
                      <p className="panel-label">Construction</p>
                      <h3 className="panel-title">Build Menu</h3>
                    </div>
                    <button className="btn btn-primary">Queue Build</button>
                  </div>
                  <div className="build-columns">
                    <div>
                      <p className="panel-subtitle">Buildings</p>
                      <div className="queue-list">
                        {buildingQueue.map((item) => (
                          <div key={item.name} className="queue-card">
                            <div>
                              <p className="queue-title">{item.name}</p>
                              <p className="queue-detail">{item.benefit}</p>
                            </div>
                            <div className="queue-meta">
                              <span className="queue-chip">ETA {item.eta}</span>
                              <span className="queue-cost">{item.cost}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="panel-subtitle">Technology</p>
                      <div className="queue-list">
                        {techQueue.map((item) => (
                          <div key={item.name} className="queue-card alt">
                            <div>
                              <p className="queue-title">{item.name}</p>
                              <p className="queue-detail">{item.benefit}</p>
                            </div>
                            <div className="queue-meta">
                              <span className="queue-chip">ETA {item.eta}</span>
                              <span className="queue-cost">{item.cost}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </section>

                <section className="panel crew-ops holo-card">
                  <div className="panel-header">
                    <div>
                      <p className="panel-label">Inhabitants</p>
                      <h3 className="panel-title">Tasks &amp; Delegation</h3>
                    </div>
                    <button className="btn btn-secondary">Delegate Task</button>
                  </div>
                  <div className="crew-grid">
                    {crewOrders.map((crew) => (
                      <div key={crew.name} className="crew-card">
                        <div className="crew-header">
                          <div>
                            <p className="crew-name">{crew.name}</p>
                            <p className="crew-role">{crew.role}</p>
                          </div>
                          <span className="crew-status">{crew.status}</span>
                        </div>
                        <p className="crew-task">{crew.task}</p>
                        <p className="crew-next">Next: {crew.next}</p>
                      </div>
                    ))}
                  </div>
                </section>
              </div>
            </>
          ) : (
            <>
              {/* Hero Section */}
              <section className="hero game-hero">
                <div className="hero-grid-overlay"></div>
                <div className="hero-left">
                  <div className="hero-badge">
                    <span className="badge-dot"></span>
                    Galactic Command Console
                  </div>
                  <h1 className="hero-title">
                    Engage the <span className="gradient-text">Quantum Economy</span>
                  </h1>
                  <p className="hero-description">
                    Boot into an arcade-inspired control room where SPACE_BASES feels like a AAA launch menu.
                    Mock wallet access keeps your squad moving fast while we wire up production systems.
                  </p>
                  <div className="menu-actions">
                    <button className="btn btn-large btn-primary" onClick={login} disabled={!ready}>
                      <span>▶</span>
                      Launch Mission
                    </button>
                    <a href="#features" className="btn btn-large btn-outline">
                      View Loadout
                    </a>
                  </div>
                  <div className="hero-metrics">
                    <div className="metric">
                      <span className="metric-label">Server</span>
                      <span className="metric-value">Mantle / Online</span>
                    </div>
                    <div className="metric">
                      <span className="metric-label">Mode</span>
                      <span className="metric-value">Prototype Access</span>
                    </div>
                    <div className="metric">
                      <span className="metric-label">Party</span>
                      <span className="metric-value">Wallet Mocked</span>
                    </div>
                  </div>
                </div>
                <div className="hero-right">
                  <div className="holo-card">
                    <div className="holo-header">Main Menu</div>
                    <ul className="menu-list">
                      <li className="menu-item active">Start Mission</li>
                      <li className="menu-item">Loadout &amp; Wallet</li>
                      <li className="menu-item">Co-op Deployment</li>
                      <li className="menu-item">Archives &amp; Intel</li>
                      <li className="menu-item">Settings</li>
                    </ul>
                    <div className="menu-footer">
                      <div className="footer-label">Tip</div>
                      <div className="footer-value">Connect to simulate player onboarding in seconds.</div>
                    </div>
                  </div>
                  <div className="mini-stats">
                    <div className="stat-card">
                      <span className="stat-label">Power Level</span>
                      <span className="stat-value">93%</span>
                      <div className="stat-bar"><span style={{ width: '93%' }}></span></div>
                    </div>
                    <div className="stat-card">
                      <span className="stat-label">Ping</span>
                      <span className="stat-value">12 ms</span>
                      <div className="stat-bar alt"><span style={{ width: '78%' }}></span></div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Features Section */}
              <section id="features" className="features menu-section">
                <div className="section-header">
                  <h2 className="section-title">Select Your Module</h2>
                  <p className="section-description">
                    Each option feels like a game tab but powers real DeFi flows.
                  </p>
                </div>
                
                <div className="feature-grid">
                  <div className="feature-card menu-card">
                    <div className="card-top">
                      <div className="feature-icon">🔒</div>
                      <span className="chip">Core</span>
                    </div>
                    <h3 className="feature-title">Secure Authentication</h3>
                    <p className="feature-description">
                      Mock wallet login keeps flows moving during prototyping while production-grade integrations spool up.
                    </p>
                  </div>

                  <div className="feature-card menu-card">
                    <div className="card-top">
                      <div className="feature-icon">⚡</div>
                      <span className="chip">Speedrun</span>
                    </div>
                    <h3 className="feature-title">Lightning Fast</h3>
                    <p className="feature-description">
                      Built on Mantle for blazing-fast transactions with minimal gas fees—think low latency multiplayer.
                    </p>
                  </div>

                  <div className="feature-card menu-card">
                    <div className="card-top">
                      <div className="feature-icon">🌐</div>
                      <span className="chip">Network</span>
                    </div>
                    <h3 className="feature-title">Decentralized</h3>
                    <p className="feature-description">
                      True decentralization with no single point of failure. Your keys, your crypto, your control.
                    </p>
                  </div>

                  <div className="feature-card menu-card">
                    <div className="card-top">
                      <div className="feature-icon">💎</div>
                      <span className="chip">Collections</span>
                    </div>
                    <h3 className="feature-title">NFT Hangar</h3>
                    <p className="feature-description">
                      Seamlessly interact with NFTs and digital assets. Trade, collect, and showcase in one unified platform.
                    </p>
                  </div>

                  <div className="feature-card menu-card">
                    <div className="card-top">
                      <div className="feature-icon">🤝</div>
                      <span className="chip">Squad</span>
                    </div>
                    <h3 className="feature-title">Community Driven</h3>
                    <p className="feature-description">
                      Join a thriving community of innovators building the future of finance together.
                    </p>
                  </div>

                  <div className="feature-card menu-card">
                    <div className="card-top">
                      <div className="feature-icon">🛠️</div>
                      <span className="chip">Dev</span>
                    </div>
                    <h3 className="feature-title">Developer Friendly</h3>
                    <p className="feature-description">
                      Comprehensive APIs and SDKs make building on SPACE_BASES intuitive and powerful.
                    </p>
                  </div>
                </div>
              </section>

              {/* CTA Section */}
              <section className="cta">
                <div className="cta-card">
                  <h2 className="cta-title">Press Start to Join</h2>
                  <p className="cta-description">
                    Jump into the command deck. Mocked wallet connections mean your prototype squad can playtest instantly.
                  </p>
                  <button className="btn btn-large btn-primary" onClick={login} disabled={!ready}>
                    <span>▶</span>
                    Connect &amp; Play
                  </button>
                </div>
              </section>
            </>
          )}
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

export default function Home() {
  const { ready, authenticated, user, login, logout } = useMockAuth();

  return (
    <HomeContent
      ready={ready}
      authenticated={authenticated}
      user={user}
      login={login}
      logout={logout}
    />
  );
}
