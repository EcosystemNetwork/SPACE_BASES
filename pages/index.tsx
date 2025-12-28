import { useEffect, useMemo, useState } from 'react';
import { useMockAuth, MockUser } from '../lib/mock-auth';

type ResourceKey = 'energy' | 'alloys' | 'credits' | 'research' | 'crew';
type ResourceState = Record<ResourceKey, number>;

interface ModuleBlueprint {
  id: string;
  name: string;
  category: string;
  description: string;
  cost: Partial<ResourceState>;
  buildTime: number;
  effects: {
    rates?: Partial<ResourceState>;
    capacity?: Partial<ResourceState>;
    integrity?: number;
  };
  tags: string[];
}

interface ActiveModule {
  instanceId: string;
  blueprintId: string;
  name: string;
  category: string;
  status: 'online' | 'damaged';
  effects: ModuleBlueprint['effects'];
  flavor: string;
  integrity: number;
  rarity: 'core' | 'advanced' | 'prototype';
}

interface Project {
  id: string;
  blueprint: ModuleBlueprint;
  remaining: number;
  startedAt: number;
}

interface MissionLogEntry {
  id: string;
  message: string;
  tone: 'success' | 'warning' | 'info';
}

const BASE_CAPACITY: ResourceState = {
  energy: 1200,
  alloys: 900,
  credits: 1100,
  research: 500,
  crew: 48,
};

const BASE_RATES: Partial<ResourceState> = {
  energy: 3,
  alloys: 1,
  credits: 1,
  research: 0.4,
  crew: 0,
};

const BLUEPRINTS: ModuleBlueprint[] = [
  {
    id: 'solar-array',
    name: 'Solar Array',
    category: 'Power',
    description: 'Extends the outer panels to keep fusion reserves topped up.',
    cost: { alloys: 120, credits: 80 },
    buildTime: 8,
    effects: { rates: { energy: 6 }, capacity: { energy: 240 }, integrity: 6 },
    tags: ['production', 'power'],
  },
  {
    id: 'fabricator',
    name: 'Alloy Fabricator',
    category: 'Industry',
    description: 'Breaks down scrap to feed the docking bay assembly lines.',
    cost: { energy: 80, credits: 120 },
    buildTime: 10,
    effects: { rates: { alloys: 2.6 }, capacity: { alloys: 160 }, integrity: 4 },
    tags: ['production', 'crafting'],
  },
  {
    id: 'research-lab',
    name: 'Quantum Lab',
    category: 'Research',
    description: 'Hosts zero-g research pods pushing mantle tech forward.',
    cost: { alloys: 80, credits: 180, energy: 120 },
    buildTime: 12,
    effects: { rates: { research: 1.4 }, capacity: { research: 120 }, integrity: 5 },
    tags: ['science', 'prototype'],
  },
  {
    id: 'hab-ring',
    name: 'Habitat Ring',
    category: 'Habitation',
    description: 'Adds living quarters, boosting crew morale and headcount.',
    cost: { alloys: 140, energy: 90, credits: 60 },
    buildTime: 9,
    effects: { capacity: { crew: 12 }, integrity: 6 },
    tags: ['support', 'crew'],
  },
  {
    id: 'docking-bay',
    name: 'Docking Bay',
    category: 'Logistics',
    description: 'Unlocks shuttle trade routes for rapid credit generation.',
    cost: { alloys: 200, energy: 140, credits: 140 },
    buildTime: 14,
    effects: { rates: { credits: 3.5 }, capacity: { credits: 220 }, integrity: 7 },
    tags: ['trade', 'production'],
  },
  {
    id: 'shield-web',
    name: 'Atmospheric Shield Web',
    category: 'Defense',
    description: 'Laces the hull with adaptive shielding, preventing outages.',
    cost: { alloys: 160, energy: 180, research: 120 },
    buildTime: 16,
    effects: { integrity: 12 },
    tags: ['defense', 'experimental'],
  },
];

const STARTING_MODULES: ActiveModule[] = [
  {
    instanceId: 'core-1',
    blueprintId: 'command-core',
    name: 'Command Core',
    category: 'Core',
    status: 'online',
    effects: {
      rates: { energy: 2.5, credits: 1, research: 0.5 },
      capacity: { energy: 260, credits: 120, research: 60 },
      integrity: 16,
    },
    flavor: 'Primary operations block keeping the base afloat.',
    integrity: 98,
    rarity: 'core',
  },
  {
    instanceId: 'reactor-1',
    blueprintId: 'fusion-reactor',
    name: 'Fusion Reactor',
    category: 'Power',
    status: 'online',
    effects: {
      rates: { energy: 8 },
      capacity: { energy: 320 },
      integrity: 8,
    },
    flavor: 'Produces steady energy for the build deck.',
    integrity: 94,
    rarity: 'advanced',
  },
  {
    instanceId: 'fabricator-1',
    blueprintId: 'fabricator',
    name: 'Starter Fabricator',
    category: 'Industry',
    status: 'online',
    effects: {
      rates: { alloys: 1.6 },
      capacity: { alloys: 140 },
      integrity: 6,
    },
    flavor: 'Turning scavenged hulls into fresh alloys.',
    integrity: 92,
    rarity: 'advanced',
  },
];

interface HomeContentProps {
  ready: boolean;
  authenticated: boolean;
  user: MockUser | null;
  login: () => void;
  logout: () => void;
}

// Shared UI component
function HomeContent({ ready, authenticated, user, login, logout }: HomeContentProps) {
  const [resources, setResources] = useState<ResourceState>({
    energy: 520,
    alloys: 260,
    credits: 320,
    research: 90,
    crew: 28,
  });
  const [modules, setModules] = useState<ActiveModule[]>(STARTING_MODULES);
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedBlueprintId, setSelectedBlueprintId] = useState<string>(BLUEPRINTS[0].id);
  const [log, setLog] = useState<MissionLogEntry[]>([
    { id: 'log-0', message: 'Command deck initialized. All systems nominal.', tone: 'info' },
  ]);

  const capacity = useMemo(() => {
    return modules.reduce<ResourceState>(
      (totals, module) => {
        const capacityBoosts = module.effects.capacity ?? {};
        (Object.keys(capacityBoosts) as ResourceKey[]).forEach((key) => {
          totals[key] += capacityBoosts[key] ?? 0;
        });
        return totals;
      },
      { ...BASE_CAPACITY }
    );
  }, [modules]);

  const resourceRates = useMemo(() => {
    return modules.reduce<Record<ResourceKey, number>>(
      (totals, module) => {
        const rateBoosts = module.effects.rates ?? {};
        (Object.keys(rateBoosts) as ResourceKey[]).forEach((key) => {
          totals[key] += rateBoosts[key] ?? 0;
        });
        return totals;
      },
      { energy: BASE_RATES.energy ?? 0, alloys: BASE_RATES.alloys ?? 0, credits: BASE_RATES.credits ?? 0, research: BASE_RATES.research ?? 0, crew: BASE_RATES.crew ?? 0 }
    );
  }, [modules]);

  const baseIntegrity = useMemo(() => {
    const integrityFromModules = modules.reduce((total, module) => total + (module.effects.integrity ?? 0), 0);
    const averageIntegrity = modules.length
      ? modules.reduce((total, module) => total + module.integrity, 0) / modules.length
      : 100;
    return Math.min(100, Math.round((integrityFromModules / 2 + averageIntegrity) / 1.5));
  }, [modules]);

  const selectedBlueprint = BLUEPRINTS.find((bp) => bp.id === selectedBlueprintId) ?? BLUEPRINTS[0];

  useEffect(() => {
    const interval = setInterval(() => {
      setResources((prev) => {
        const next = { ...prev };
        (Object.keys(resourceRates) as ResourceKey[]).forEach((key) => {
          const cap = capacity[key];
          const updatedValue = (prev[key] ?? 0) + (resourceRates[key] ?? 0);
          next[key] = Math.min(cap, Math.round((updatedValue + Number.EPSILON) * 10) / 10);
        });
        return next;
      });

      setProjects((prevProjects) => {
        const updated = prevProjects.map((project) => ({
          ...project,
          remaining: Math.max(0, project.remaining - 1),
        }));

        const completed = updated.filter((project) => project.remaining === 0);
        if (completed.length > 0) {
          setModules((prevModules) => [
            ...prevModules,
            ...completed.map((project, index) => ({
              instanceId: `${project.blueprint.id}-${Date.now()}-${index}`,
              blueprintId: project.blueprint.id,
              name: project.blueprint.name,
              category: project.blueprint.category,
              status: 'online' as const,
              effects: project.blueprint.effects,
              flavor: project.blueprint.description,
              integrity: 90 + Math.floor(Math.random() * 10),
              rarity: (project.blueprint.tags.includes('experimental') ? 'prototype' : 'advanced') as ActiveModule['rarity'],
            })),
          ]);

          setLog((prevLog) => {
            const entries: MissionLogEntry[] = completed.map((project) => ({
              id: `complete-${project.id}`,
              message: `${project.blueprint.name} is now online. Rates and integrity updated.`,
              tone: 'success',
            }));
            const combined = [...prevLog, ...entries];
            return combined.slice(-12);
          });
        }

        return updated.filter((project) => project.remaining > 0);
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [resourceRates, capacity]);

  const spendResources = (cost: Partial<ResourceState>) => {
    setResources((prev) => {
      const next = { ...prev };
      (Object.keys(cost) as ResourceKey[]).forEach((key) => {
        next[key] = Math.max(0, (prev[key] ?? 0) - (cost[key] ?? 0));
      });
      return next;
    });
  };

  const queueBuild = (blueprint: ModuleBlueprint) => {
    const affordable = (Object.keys(blueprint.cost) as ResourceKey[]).every((key) => {
      return resources[key] >= (blueprint.cost[key] ?? 0);
    });

    if (!affordable) {
      setLog((prevLog) => [
        ...prevLog.slice(-11),
        { id: `warn-${Date.now()}`, message: `Insufficient resources to build ${blueprint.name}.`, tone: 'warning' },
      ]);
      return;
    }

    spendResources(blueprint.cost);
    const project: Project = {
      id: `project-${Date.now()}`,
      blueprint,
      remaining: blueprint.buildTime,
      startedAt: Date.now(),
    };

    setProjects((prev) => [...prev, project]);
    setLog((prevLog) => [
      ...prevLog.slice(-11),
      { id: project.id, message: `${blueprint.name} added to construction queue.`, tone: 'info' },
    ]);
  };

  const boostProject = (projectId: string) => {
    const energyCost = 60;
    if (resources.energy < energyCost) {
      setLog((prevLog) => [
        ...prevLog.slice(-11),
        { id: `boost-fail-${projectId}`, message: 'Not enough energy to overclock build drones.', tone: 'warning' },
      ]);
      return;
    }

    spendResources({ energy: energyCost });
    setProjects((prev) =>
      prev.map((project) =>
        project.id === projectId
          ? { ...project, remaining: Math.max(0, project.remaining - 3) }
          : project
      )
    );
    setLog((prevLog) => [
      ...prevLog.slice(-11),
      { id: `boost-${projectId}`, message: 'Drones overclocked: build time reduced by 3s.', tone: 'success' },
    ]);
  };

  const triggerAction = (type: 'supply' | 'scan') => {
    if (type === 'supply') {
      const reward: Partial<ResourceState> = { alloys: 90, credits: 120 };
      setResources((prev) => {
        const next = { ...prev };
        (Object.keys(reward) as ResourceKey[]).forEach((key) => {
          next[key] = Math.min(capacity[key], prev[key] + (reward[key] ?? 0));
        });
        return next;
      });
      setLog((prevLog) => [
        ...prevLog.slice(-11),
        { id: `supply-${Date.now()}`, message: 'Supply shuttle docked: alloys and credits delivered.', tone: 'success' },
      ]);
    } else {
      const bonus = Math.random() > 0.4 ? 1 : 0;
      setLog((prevLog) => [
        ...prevLog.slice(-11),
        bonus
          ? { id: `scan-${Date.now()}`, message: 'Deep scan found salvage pockets. Alloy yield improved temporarily.', tone: 'success' }
          : { id: `scan-${Date.now()}`, message: 'Scan returned nominal. No immediate threats detected.', tone: 'info' },
      ]);
      if (bonus) {
        setModules((prevModules) =>
          prevModules.map((module, index) =>
            index === 0
              ? {
                  ...module,
                  effects: {
                    ...module.effects,
                    rates: {
                      ...module.effects.rates,
                      alloys: (module.effects.rates?.alloys ?? 0) + 0.6,
                    },
                  },
                }
              : module
          )
        );
      }
    }
  };

  const resourceStats = (Object.keys(resources) as ResourceKey[]).map((key) => {
    const value = resources[key];
    const rate = resourceRates[key] ?? 0;
    const fill = Math.min(100, Math.round((value / capacity[key]) * 100));
    const icons: Record<ResourceKey, string> = {
      energy: '⚡',
      alloys: '🪨',
      credits: '💳',
      research: '🔬',
      crew: '👩‍🚀',
    };

    return {
      label: key.charAt(0).toUpperCase() + key.slice(1),
      value: value.toLocaleString(),
      change: `${rate >= 0 ? '+' : ''}${rate.toFixed(1)}/s`,
      icon: icons[key],
      fill: `${fill}%`,
    };
  });

  const connectionButtonText = 'Connect Wallet (Mock)';
  const connectionButtonIcon = '🧪';

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
                  <span>{connectionButtonIcon}</span>
                  {connectionButtonText}
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
                    <span className="chip">Base Simulation Active</span>
                    <span className="status-pill online">{projects.length ? 'Projects Queued' : 'Standing By'}</span>
                  </div>
                  <h2 className="section-title small">Build Your Space Base</h2>
                  <p className="section-description">
                    Queue construction, boost output, and watch your resource engines spin up in real time.
                    Each module you bring online changes how the base behaves.
                  </p>
                  <div className="brief-grid">
                    <div className="mini-map">
                      <div className="mini-map-grid">
                        <span className="map-node active">Core</span>
                        <span className="map-node">Hab</span>
                        <span className="map-node">Dock</span>
                        <span className="map-node">Ring</span>
                      </div>
                      <p className="map-caption">Integrity check: {baseIntegrity}% / Modules: {modules.length}</p>
                      <div className="stat-bar">
                        <span style={{ width: `${baseIntegrity}%` }}></span>
                      </div>
                      <div className="action-grid">
                        <button className="btn btn-secondary" onClick={() => triggerAction('supply')}>
                          🚚 Supply Drop
                        </button>
                        <button className="btn btn-secondary" onClick={() => triggerAction('scan')}>
                          🛰️ Deep Scan
                        </button>
                      </div>
                    </div>
                    <div className="brief-stats">
                      <div className="brief-stat">
                        <div className="stat-label">Construction</div>
                        <div className="stat-value">{projects.length ? `${projects.length} in queue` : 'Idle'}</div>
                        <div className="stat-detail">Boost build speed with Energy</div>
                      </div>
                      <div className="brief-stat">
                        <div className="stat-label">Production</div>
                        <div className="stat-value">
                          +{(resourceRates.energy ?? 0).toFixed(1)}⚡ / +{(resourceRates.alloys ?? 0).toFixed(1)}🪨 /s
                        </div>
                        <div className="stat-detail">Driven by online modules</div>
                      </div>
                      <div className="brief-stat">
                        <div className="stat-label">Crew</div>
                        <div className="stat-value">
                          {resources.crew} / {capacity.crew}
                        </div>
                        <div className="stat-detail">Hab capacity grows with rings</div>
                      </div>
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
                      <p className="panel-label">Base Layout</p>
                      <h3 className="panel-title">Live Modules</h3>
                    </div>
                    <div className="hud-chip">
                      <span className="hud-label">Integrity</span>
                      <span className="hud-value">{baseIntegrity}%</span>
                    </div>
                  </div>
                  <div className="base-status">
                    <div>
                      <p className="stat-label">Integrity</p>
                      <p className="stat-value">{baseIntegrity}%</p>
                      <div className="stat-bar"><span style={{ width: `${baseIntegrity}%` }}></span></div>
                    </div>
                    <div>
                      <p className="stat-label">Power Flow</p>
                      <p className="stat-value">+{(resourceRates.energy ?? 0).toFixed(1)}/s</p>
                      <div className="stat-bar alt"><span style={{ width: '64%' }}></span></div>
                    </div>
                    <div>
                      <p className="stat-label">Research</p>
                      <p className="stat-value">+{(resourceRates.research ?? 0).toFixed(1)}/s</p>
                      <div className="stat-bar"><span style={{ width: '72%' }}></span></div>
                    </div>
                  </div>
                  <div className="module-grid">
                    {modules.map((module) => (
                      <div key={module.instanceId} className={`module-card ${module.rarity}`}>
                        <p className="module-label">{module.category}</p>
                        <p className="module-title">{module.name}</p>
                        <p className="module-detail">{module.flavor}</p>
                        <div className="module-effects">
                          {module.effects.rates && (
                            <div className="effect-line">
                              <span>Output</span>
                              <div className="tag-row">
                                {(Object.entries(module.effects.rates) as [ResourceKey, number][]).map(([key, value]) => (
                                  <span key={key} className="chip tiny">{`+${value}/s ${key}`}</span>
                                ))}
                              </div>
                            </div>
                          )}
                          {module.effects.capacity && (
                            <div className="effect-line">
                              <span>Cap</span>
                              <div className="tag-row">
                                {(Object.entries(module.effects.capacity) as [ResourceKey, number][]).map(([key, value]) => (
                                  <span key={key} className="chip tiny alt">{`+${value} ${key}`}</span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                        <div className="stat-bar">
                          <span style={{ width: `${module.integrity}%` }}></span>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

                <section className="panel build-menu holo-card">
                  <div className="panel-header">
                    <div>
                      <p className="panel-label">Construction</p>
                      <h3 className="panel-title">Build Deck</h3>
                    </div>
                    <button className="btn btn-primary" onClick={() => queueBuild(selectedBlueprint)}>
                      Queue {selectedBlueprint.name}
                    </button>
                  </div>
                  <div className="build-columns">
                    <div>
                      <p className="panel-subtitle">Blueprints</p>
                      <div className="build-deck">
                        {BLUEPRINTS.map((blueprint) => {
                          const affordable = (Object.keys(blueprint.cost) as ResourceKey[]).every(
                            (key) => resources[key] >= (blueprint.cost[key] ?? 0)
                          );
                          return (
                            <button
                              key={blueprint.id}
                              className={`build-card ${selectedBlueprintId === blueprint.id ? 'active' : ''}`}
                              onClick={() => setSelectedBlueprintId(blueprint.id)}
                            >
                              <div className="build-card-header">
                                <div>
                                  <p className="module-label">{blueprint.category}</p>
                                  <p className="module-title">{blueprint.name}</p>
                                </div>
                                <span className="queue-chip">{blueprint.buildTime}s</span>
                              </div>
                              <p className="queue-detail">{blueprint.description}</p>
                              <div className="build-card-footer">
                                <div className="cost-line">
                                  {Object.entries(blueprint.cost).map(([key, value]) => (
                                    <span key={key} className="cost-chip">
                                      {key}: {value}
                                    </span>
                                  ))}
                                </div>
                                <span className={`afford-status ${affordable ? 'online' : 'warning'}`}>
                                  {affordable ? 'Ready to queue' : 'Need resources'}
                                </span>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                    <div>
                      <p className="panel-subtitle">Selected Module</p>
                      <div className="queue-list">
                        <div className="queue-card alt">
                          <div>
                            <p className="queue-title">{selectedBlueprint.name}</p>
                            <p className="queue-detail">{selectedBlueprint.description}</p>
                            <div className="tag-row">
                              {selectedBlueprint.tags.map((tag) => (
                                <span key={tag} className="chip tiny">{tag}</span>
                              ))}
                            </div>
                          </div>
                          <div className="queue-meta">
                            <span className="queue-chip">ETA {selectedBlueprint.buildTime}s</span>
                            <span className="queue-cost">
                              {Object.entries(selectedBlueprint.cost)
                                .map(([key, value]) => `${key}: ${value}`)
                                .join(' • ')}
                            </span>
                            <button className="btn btn-primary" onClick={() => queueBuild(selectedBlueprint)}>
                              Start Build
                            </button>
                          </div>
                        </div>
                      </div>
                      <p className="panel-subtitle" style={{ marginTop: 12 }}>Construction Queue</p>
                      <div className="queue-list">
                        {projects.length === 0 && <p className="queue-detail">No active projects. Spin up a module.</p>}
                        {projects.map((project) => {
                          const percentage = Math.max(
                            0,
                            Math.round(((project.blueprint.buildTime - project.remaining) / project.blueprint.buildTime) * 100)
                          );
                          return (
                            <div key={project.id} className="queue-card">
                              <div>
                                <p className="queue-title">{project.blueprint.name}</p>
                                <p className="queue-detail">{project.blueprint.description}</p>
                                <div className="stat-bar">
                                  <span style={{ width: `${percentage}%` }}></span>
                                </div>
                              </div>
                              <div className="queue-meta">
                                <span className="queue-chip">{project.remaining}s left</span>
                                <button className="btn btn-secondary" onClick={() => boostProject(project.id)}>
                                  ⚡ Overclock
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </section>

                <section className="panel crew-ops holo-card">
                  <div className="panel-header">
                    <div>
                      <p className="panel-label">Mission Feed</p>
                      <h3 className="panel-title">Log &amp; Events</h3>
                    </div>
                    <button className="btn btn-secondary" onClick={() => setLog([])}>Clear Log</button>
                  </div>
                  <div className="log-feed">
                    {log.map((entry) => (
                      <div key={entry.id} className={`log-entry ${entry.tone}`}>
                        <span className="log-dot">•</span>
                        <p>{entry.message}</p>
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
                    Base Builder Arcade
                  </div>
                  <h1 className="hero-title">
                    Construct your <span className="gradient-text">Orbital Space Base</span>
                  </h1>
                  <p className="hero-description">
                    Connect and instantly start building. Queue modules, overclock drones, and watch resources tick up in real time
                    with our mock wallet flow—no blockchain friction while you iterate.
                  </p>
                  <div className="menu-actions">
                    <button className="btn btn-large btn-primary" onClick={login} disabled={!ready}>
                      <span>▶</span>
                      Enter Command Deck
                    </button>
                    <a href="#features" className="btn btn-large btn-outline">
                      Preview Systems
                    </a>
                  </div>
                  <div className="hero-metrics">
                    <div className="metric">
                      <span className="metric-label">Loop</span>
                      <span className="metric-value">Build &amp; Boost</span>
                    </div>
                    <div className="metric">
                      <span className="metric-label">Mode</span>
                      <span className="metric-value">Instant Mock Wallet</span>
                    </div>
                    <div className="metric">
                      <span className="metric-label">Goal</span>
                      <span className="metric-value">Orbit-Ready Base</span>
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
