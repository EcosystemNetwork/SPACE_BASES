import { useEffect, useMemo, useRef, useState } from 'react';
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

let threePromise: Promise<any> | null = null;

const loadThree = () => {
  if (typeof window === 'undefined') return Promise.resolve(null);
  if ((window as any).THREE) return Promise.resolve((window as any).THREE);
  if (threePromise) return threePromise;

  threePromise = new Promise((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>('script[data-threejs]');
    if (existing) {
      existing.addEventListener('load', () => resolve((window as any).THREE));
      existing.addEventListener('error', () => {
        threePromise = null;
        reject(new Error('Three.js failed to load'));
      });
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/three@0.170.0/build/three.min.js';
    script.async = true;
    script.dataset.threejs = 'true';
    script.onload = () => resolve((window as any).THREE);
    script.onerror = () => {
      threePromise = null;
      reject(new Error('Three.js failed to load'));
    };
    document.head.appendChild(script);
  });

  return threePromise;
};

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

interface SpaceBaseDisplayProps {
  baseIntegrity: number;
  modules: ActiveModule[];
  projects: Project[];
  resources: ResourceState;
  capacity: ResourceState;
  resourceRates: Record<ResourceKey, number>;
  onSupply: () => void;
  onScan: () => void;
}

function SpaceBaseDisplay({
  baseIntegrity,
  modules,
  projects,
  resources,
  capacity,
  resourceRates,
  onSupply,
  onScan,
}: SpaceBaseDisplayProps) {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const [loadingThree, setLoadingThree] = useState(true);
  const [threeError, setThreeError] = useState<string | null>(null);

  useEffect(() => {
    let frameId: number | null = null;
    let cleanup: (() => void) | null = null;

    const initScene = async () => {
      const THREE = await loadThree().catch(() => null);
      if (!THREE || !mountRef.current) {
        setThreeError('Three.js could not load. Check your connection and try again.');
        setLoadingThree(false);
        return;
      }

      setThreeError(null);
      setLoadingThree(false);

      const mount = mountRef.current;
      const width = mount.clientWidth;
      const height = mount.clientHeight;
      const scene = new THREE.Scene();
      scene.fog = new THREE.FogExp2(0x050712, 0.035);

      const camera = new THREE.PerspectiveCamera(48, width / height, 0.1, 100);
      camera.position.set(0, 4.5, 11);

      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setSize(width, height);
      renderer.setPixelRatio(window.devicePixelRatio);
      renderer.setClearColor(0x000000, 0);
      mount.appendChild(renderer.domElement);

      const ambient = new THREE.AmbientLight(0x88c9ff, 0.9);
      const hemi = new THREE.HemisphereLight(0x6df0a8, 0x0b0f22, 0.6);
      const point = new THREE.PointLight(0x5ad4ff, 2.4, 24);
      point.position.set(4, 6, 4);
      scene.add(ambient, hemi, point);

      const baseGroup = new THREE.Group();
      scene.add(baseGroup);

      const core = new THREE.Mesh(
        new THREE.DodecahedronGeometry(1.6, 0),
        new THREE.MeshStandardMaterial({
          color: 0x5ad4ff,
          metalness: 0.65,
          roughness: 0.35,
          emissive: 0x0b77c5,
          emissiveIntensity: 0.7,
        })
      );
      baseGroup.add(core);

      const plating = new THREE.Mesh(
        new THREE.IcosahedronGeometry(1.9, 1),
        new THREE.MeshStandardMaterial({
          color: 0x0f172a,
          metalness: 0.3,
          roughness: 0.8,
          wireframe: true,
          transparent: true,
          opacity: 0.25,
        })
      );
      baseGroup.add(plating);

      const habitatRing = new THREE.Mesh(
        new THREE.TorusGeometry(3.2, 0.12, 22, 180),
        new THREE.MeshStandardMaterial({
          color: 0x9ae6ff,
          emissive: 0x0f6f8f,
          emissiveIntensity: 0.6,
          metalness: 0.9,
          roughness: 0.2,
          transparent: true,
          opacity: 0.85,
        })
      );
      baseGroup.add(habitatRing);

      const dockRing = new THREE.Mesh(
        new THREE.TorusGeometry(2.2, 0.08, 16, 160),
        new THREE.MeshStandardMaterial({
          color: 0xff6bcb,
          emissive: 0x7a1f4c,
          emissiveIntensity: 0.45,
          transparent: true,
          opacity: 0.7,
        })
      );
      dockRing.rotation.x = Math.PI / 2.4;
      baseGroup.add(dockRing);

      const arms = new THREE.Group();
      for (let i = 0; i < 6; i++) {
        const angle = (i / 6) * Math.PI * 2;
        const arm = new THREE.Mesh(
          new THREE.BoxGeometry(0.3, 0.3, 2.4),
          new THREE.MeshStandardMaterial({
            color: 0xe9f1ff,
            metalness: 0.7,
            roughness: 0.35,
            emissive: 0x0c1f36,
            emissiveIntensity: 0.5,
          })
        );
        arm.position.set(Math.cos(angle) * 2.6, 0.15 * Math.sin(i), Math.sin(angle) * 2.6);
        arm.lookAt(0, 0, 0);

        const pod = new THREE.Mesh(
          new THREE.SphereGeometry(0.32, 24, 16),
          new THREE.MeshStandardMaterial({
            color: 0x6df0a8,
            emissive: 0x16412f,
            emissiveIntensity: 0.9,
            metalness: 0.4,
            roughness: 0.1,
          })
        );
        pod.position.set(Math.cos(angle) * 3.4, 0.2, Math.sin(angle) * 3.4);
        arms.add(arm);
        arms.add(pod);
      }
      baseGroup.add(arms);

      const drones = new THREE.Group();
      for (let i = 0; i < 26; i++) {
        const phi = Math.random() * Math.PI * 2;
        const theta = Math.random() * Math.PI;
        const radius = 5 + Math.random() * 3;
        const drone = new THREE.Mesh(
          new THREE.SphereGeometry(0.08, 12, 12),
          new THREE.MeshBasicMaterial({ color: 0xffffff })
        );
        drone.position.set(
          Math.cos(phi) * Math.sin(theta) * radius,
          Math.cos(theta) * 0.8,
          Math.sin(phi) * Math.sin(theta) * radius
        );
        drones.add(drone);
      }
      scene.add(drones);

      const starGeom = new THREE.BufferGeometry();
      const starCount = 420;
      const positions = new Float32Array(starCount * 3);
      for (let i = 0; i < starCount; i++) {
        positions[i * 3] = (Math.random() - 0.5) * 42;
        positions[i * 3 + 1] = (Math.random() - 0.5) * 32;
        positions[i * 3 + 2] = (Math.random() - 0.5) * 42;
      }
      starGeom.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
      const stars = new THREE.Points(
        starGeom,
        new THREE.PointsMaterial({ color: 0x5ad4ff, size: 0.06, transparent: true, opacity: 0.8 })
      );
      scene.add(stars);

      const glow = new THREE.Mesh(
        new THREE.RingGeometry(2.2, 3.2, 64),
        new THREE.MeshBasicMaterial({ color: 0x5ad4ff, transparent: true, opacity: 0.2, side: THREE.DoubleSide })
      );
      glow.rotation.x = Math.PI / 2;
      glow.position.y = -0.35;
      baseGroup.add(glow);

      const handleResize = () => {
        if (!mount) return;
        const { clientWidth, clientHeight } = mount;
        camera.aspect = clientWidth / clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(clientWidth, clientHeight);
      };
      window.addEventListener('resize', handleResize);

      const animate = () => {
        baseGroup.rotation.y += 0.003;
        habitatRing.rotation.z += 0.002;
        dockRing.rotation.y += 0.002;
        arms.rotation.y -= 0.002;
        drones.rotation.y += 0.0015;
        stars.rotation.y += 0.0008;
        glow.rotation.z += 0.0015;
        renderer.render(scene, camera);
        frameId = requestAnimationFrame(animate);
      };
      animate();

      cleanup = () => {
        if (frameId) cancelAnimationFrame(frameId);
        window.removeEventListener('resize', handleResize);
        if (mount.contains(renderer.domElement)) {
          mount.removeChild(renderer.domElement);
        }
        renderer.dispose();
        scene.traverse((obj: any) => {
          if (obj.geometry && typeof obj.geometry.dispose === 'function') obj.geometry.dispose();
          if (obj.material) {
            if (Array.isArray(obj.material)) {
              obj.material.forEach((mat) => mat.dispose?.());
            } else if (typeof obj.material.dispose === 'function') {
              obj.material.dispose();
            }
          }
        });
      };
    };

    initScene();

    return () => {
      if (cleanup) cleanup();
    };
  }, []);

  const topMenu = [
    { title: 'Station Integrity', value: `${baseIntegrity}%`, detail: 'Hull & shielding stable' },
    { title: 'Modules Online', value: modules.length.toString(), detail: 'Decks synced' },
    { title: 'Energy Flow', value: `+${(resourceRates.energy ?? 0).toFixed(1)}/s`, detail: 'Grid nominal' },
    { title: 'Research Uplink', value: `+${(resourceRates.research ?? 0).toFixed(1)}/s`, detail: 'Labs calibrated' },
  ];

  const leftMenu = [
    { label: 'Power Core', value: `${resources.energy}/${capacity.energy}`, status: 'online' },
    { label: 'Alloy Foundry', value: `${resources.alloys}/${capacity.alloys}`, status: 'online' },
    { label: 'Credit Exchange', value: `${resources.credits}/${capacity.credits}`, status: 'stable' },
    { label: 'Crew Pods', value: `${resources.crew}/${capacity.crew}`, status: 'nominal' },
  ];

  const rightMenu = projects.slice(0, 3).map((project) => ({
    title: project.blueprint.name,
    eta: `${project.remaining}s`,
    status: project.remaining < project.blueprint.buildTime / 2 ? 'Accelerating' : 'Queued',
  }));

  const bottomMenu = [
    { label: 'Supply Drop', action: onSupply, icon: '🚚', sub: 'Restore alloys & credits' },
    { label: 'Deep Scan', action: onScan, icon: '🛰️', sub: 'Probe nearby sectors' },
  ];

  return (
    <section className="panel space-base-panel holo-card">
      <div className="panel-header">
        <div>
          <p className="panel-label">Orbital View</p>
          <h3 className="panel-title">Space Base Command Center</h3>
        </div>
        <div className="hud-chip">
          <span className="hud-label">Integrity</span>
          <span className="hud-value">{baseIntegrity}%</span>
        </div>
      </div>

      <div className="space-base-layout">
        <div className="command-strip top">
          <div className="strip-grid">
            {topMenu.map((item) => (
              <div key={item.title} className="strip-card">
                <p className="strip-label">{item.title}</p>
                <p className="strip-value">{item.value}</p>
                <p className="strip-detail">{item.detail}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="command-strip left">
          <p className="strip-heading">Systems</p>
          <ul className="strip-list">
            {leftMenu.map((item) => (
              <li key={item.label} className={`strip-item ${item.status}`}>
                <div>
                  <p className="strip-label">{item.label}</p>
                  <p className="strip-detail">{item.value}</p>
                </div>
                <span className="status-dot"></span>
              </li>
            ))}
          </ul>
        </div>

        <div className="space-base-viewport" ref={mountRef}>
          {loadingThree && <div className="viewport-overlay">Initializing Three.js viewport…</div>}
          {threeError && <div className="viewport-overlay error">{threeError}</div>}
          <div className="overlay-chips">
            <span className="chip tiny alt">{modules.length} modules online</span>
            <span className="chip tiny">Integrity {baseIntegrity}%</span>
          </div>
        </div>

        <div className="command-strip right">
          <p className="strip-heading">Build Queue</p>
          <div className="strip-list">
            {rightMenu.length === 0 && <p className="strip-detail">No active projects</p>}
            {rightMenu.map((item) => (
              <div key={item.title} className="strip-item queued">
                <div>
                  <p className="strip-label">{item.title}</p>
                  <p className="strip-detail">{item.status}</p>
                </div>
                <span className="queue-chip">{item.eta}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="command-strip bottom">
          <div className="bottom-actions">
            {bottomMenu.map((item) => (
              <button key={item.label} className="btn btn-secondary ghost" onClick={item.action}>
                <span className="action-icon">{item.icon}</span>
                <div>
                  <p className="strip-label">{item.label}</p>
                  <p className="strip-detail">{item.sub}</p>
                </div>
              </button>
            ))}
            <div className="mini-stat">
              <p className="strip-label">Crew Vitality</p>
              <p className="strip-value">{resources.crew}/{capacity.crew}</p>
              <div className="stat-bar"><span style={{ width: `${Math.min(100, (resources.crew / capacity.crew) * 100)}%` }}></span></div>
            </div>
            <div className="mini-stat">
              <p className="strip-label">Power Output</p>
              <p className="strip-value">+{(resourceRates.energy ?? 0).toFixed(1)}/s</p>
              <div className="stat-bar alt"><span style={{ width: '78%' }}></span></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
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

              <SpaceBaseDisplay
                baseIntegrity={baseIntegrity}
                modules={modules}
                projects={projects}
                resources={resources}
                capacity={capacity}
                resourceRates={resourceRates}
                onSupply={() => triggerAction('supply')}
                onScan={() => triggerAction('scan')}
              />

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
