import { useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { PresentationControls } from '@react-three/drei';
import { Pause, Play } from 'lucide-react';
import * as THREE from 'three';
import { useDarkMode } from '../../store/useDarkMode';
import { useHeroMotionPreference } from '../../store/useHeroMotionPreference';
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion';
import { useWebglSupported } from '../../hooks/useWebglSupported';
import { HeroSceneFallback } from './HeroSceneFallback';
import { HeroSceneErrorBoundary } from './HeroSceneErrorBoundary';

// Colors pulled verbatim from tailwind.config.ts / index.css -- do not
// re-sample from the logo, these are the tokens the rest of the site uses.
const COLORS = {
  primaryLight: '#1E4A7A', // primary.light
  primaryDark: '#081D33', // primary.dark
  primary200: '#9DB9D3', // primary.200
  accent: '#846033', // accent.DEFAULT
  accentLight: '#D8B573', // accent.light
} as const;

const STALKS = 7; // echoes the 7 wheat paths of Phase A's placeholder SVG
const NODES_PER_STALK = 5;

interface NodeDatum {
  position: [number, number, number];
  radius: number;
  color: THREE.Color;
}

interface WheatNetwork {
  nodes: NodeDatum[];
  linePositions: Float32Array;
}

// Deterministic (no Math.random) so the composition is stable across
// remounts -- a low-poly wheat stalk cluster doubling as a small node graph.
function buildWheatNetwork(): WheatNetwork {
  const colorBase = new THREE.Color(COLORS.accent);
  const colorTip = new THREE.Color(COLORS.accentLight);
  const nodes: NodeDatum[] = [];

  for (let s = 0; s < STALKS; s++) {
    const xBase = (s - (STALKS - 1) / 2) * 0.85;
    const sway = Math.sin(s * 1.3) * 0.3;
    for (let n = 0; n < NODES_PER_STALK; n++) {
      const t = n / (NODES_PER_STALK - 1);
      const x = xBase + sway * t * t;
      const y = -1.6 + t * 3.2;
      const z = Math.cos(s * 0.9) * 0.4 * t;
      const radius = 0.055 + t * 0.07;
      nodes.push({ position: [x, y, z], radius, color: colorBase.clone().lerp(colorTip, t) });
    }
  }

  const at = (s: number, n: number) => nodes[s * NODES_PER_STALK + n].position;
  const pts: number[] = [];

  // Spine lines: connect each node to the next one up its own stalk.
  for (let s = 0; s < STALKS; s++) {
    for (let n = 0; n < NODES_PER_STALK - 1; n++) {
      pts.push(...at(s, n), ...at(s, n + 1));
    }
  }
  // Cross-links between neighboring stalks -- the "neural network" layer.
  for (let s = 0; s < STALKS - 1; s++) {
    for (let n = 0; n < NODES_PER_STALK; n += 2) {
      pts.push(...at(s, n), ...at(s + 1, n));
    }
  }

  return { nodes, linePositions: new Float32Array(pts) };
}

function WheatNetworkGroup({ isDark }: { isDark: boolean }) {
  const { nodes, linePositions } = useMemo(buildWheatNetwork, []);
  const groupRef = useRef<THREE.Group>(null);
  const lineColor = isDark ? COLORS.primary200 : COLORS.accentLight;

  // Gentle continuous auto-rotation -- separate from the drag-driven
  // rotation PresentationControls applies to the parent spring group, so
  // the two combine instead of fighting each other.
  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.12;
    }
  });

  return (
    <group ref={groupRef}>
      <lineSegments>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={linePositions.length / 3}
            array={linePositions}
            itemSize={3}
          />
        </bufferGeometry>
        <lineBasicMaterial color={lineColor} transparent opacity={0.45} />
      </lineSegments>

      {nodes.map((node, i) => (
        <mesh key={i} position={node.position}>
          <icosahedronGeometry args={[node.radius, 0]} />
          <meshStandardMaterial
            color={node.color}
            emissive={node.color}
            emissiveIntensity={isDark ? 0.35 : 0.15}
            roughness={0.45}
            metalness={0.3}
          />
        </mesh>
      ))}
    </group>
  );
}

function SceneContents({ isDark }: { isDark: boolean }) {
  const ambientColor = isDark ? COLORS.primaryLight : COLORS.accentLight;
  const ambientIntensity = isDark ? 0.35 : 0.55;
  const fogColor = isDark ? COLORS.primaryDark : COLORS.primaryLight;

  return (
    <>
      <fog attach="fog" args={[fogColor, 4, 11]} />
      <ambientLight color={ambientColor} intensity={ambientIntensity} />
      <pointLight position={[3, 4, 5]} color={COLORS.accentLight} intensity={0.9} />
      <pointLight position={[-4, -2, -3]} color={COLORS.primaryLight} intensity={0.4} />
      <PresentationControls
        global={false}
        cursor
        speed={1.1}
        polar={[-0.3, 0.3]}
        azimuth={[-0.5, 0.5]}
      >
        <WheatNetworkGroup isDark={isDark} />
      </PresentationControls>
    </>
  );
}

/**
 * Decorative R3F hero scene: a low-poly wheat-stalk cluster (gold/bronze
 * gradient nodes, deterministic layout) whose stalks double as a small node
 * graph -- a nod to both the logo's wheat motif and a neural network. Gentle
 * auto-rotation plus a constrained drag-to-orbit via drei's
 * PresentationControls. Never more than ~700 triangles.
 *
 * Everything here is optional decoration: it self-selects between the live
 * canvas and the static HeroSceneFallback based on reduced-motion (OS +
 * on-page toggle) and WebGL support, and is wrapped by an error boundary so
 * a render failure can never break the page.
 */
export default function HeroScene() {
  const isDark = useDarkMode((s) => s.isDark);
  const manualReduceMotion = useHeroMotionPreference((s) => s.manualReduceMotion);
  const toggleManualReduceMotion = useHeroMotionPreference((s) => s.toggle);
  const prefersReducedMotionOS = usePrefersReducedMotion();
  const webglSupported = useWebglSupported();

  const reduceMotion = prefersReducedMotionOS || manualReduceMotion;
  const showCanvas = webglSupported && !reduceMotion;

  return (
    <>
      <div className="absolute inset-0" aria-hidden="true">
        {showCanvas ? (
          <HeroSceneErrorBoundary fallback={<HeroSceneFallback />}>
            <Canvas
              dpr={[1, 1.5]}
              camera={{ position: [0, 0.2, 6.5], fov: 42 }}
              gl={{ alpha: true, antialias: true }}
            >
              <SceneContents isDark={isDark} />
            </Canvas>
          </HeroSceneErrorBoundary>
        ) : (
          <HeroSceneFallback />
        )}
      </div>

      {/* Real, focusable control -- intentionally a sibling of the
          aria-hidden canvas layer above, not inside it, so it stays reachable
          by keyboard and screen readers regardless of canvas state. */}
      {!prefersReducedMotionOS && (
        <button
          type="button"
          onClick={toggleManualReduceMotion}
          aria-pressed={manualReduceMotion}
          className="absolute bottom-4 right-4 z-10 inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-xs font-medium text-white/80 ring-1 ring-inset ring-white/20 backdrop-blur-sm transition-colors hover:bg-white/20 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent-light"
        >
          {manualReduceMotion ? (
            <Play className="h-3.5 w-3.5" aria-hidden="true" />
          ) : (
            <Pause className="h-3.5 w-3.5" aria-hidden="true" />
          )}
          {manualReduceMotion ? 'Enable motion' : 'Reduce motion'}
        </button>
      )}
    </>
  );
}
