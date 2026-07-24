import { useRef, useEffect, useMemo, useState } from 'react';
import * as THREE from 'three';
import type { AudioData } from '@/hooks/useAudioAnalyzer';

interface HumanoidMeshProps {
  audioData: AudioData;
  isActive: boolean;
  onCanvasReady?: (canvas: HTMLCanvasElement) => void;
}

// Pastelae-style color palette - soft, ethereal, cinematic
const PASTELAE_COLORS = [
0xff6b8a, // Soft coral
0x7b68ee, // Medium slate blue
0x48d1cc, // Medium turquoise
0xffa07a, // Light salmon
0x87ceeb, // Sky blue
0xdda0dd, // Plum
0x98fb98, // Pale green
0xf0e68c, // Khaki
0xffb6c1, // Light pink
0xadd8e6, // Light blue
0xe6e6fa, // Lavender
0xffdab9 // Peach puff
];

interface ThickFilament {
  mesh: THREE.Mesh;
  basePositions: Float32Array;
  color: THREE.Color;
  spawnTime: number;
  lifespan: number;
  thickness: number;
  phase: number;
  speed: number;
  curveStyle: 'spiral' | 'wave' | 'organic';
  // Random movement parameters - unique per filament
  randomSeed: number;
  driftX: number;
  driftY: number;
  driftZ: number;
  rotSpeed: number;
  vibFreq: number;
  wobble: number;
}

// Magical crystal symbols inside filaments
interface MagicCrystal {
  mesh: THREE.Mesh;
  spawnTime: number;
  lifespan: number;
  parentFilament: THREE.Mesh;
  rotSpeed: THREE.Vector3;
  scale: number;
}

// Magic symbol shapes
const MAGIC_SYMBOLS = ['triangle', 'diamond', 'star', 'cross', 'hexagon', 'crescent'] as const;

export function HumanoidMesh({ audioData, isActive, onCanvasReady }: HumanoidMeshProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const animationIdRef = useRef<number>(0);
  const timeRef = useRef(0);
  const filamentsRef = useRef<ThickFilament[]>([]);
  const filamentsGroupRef = useRef<THREE.Group | null>(null);
  const faceGroupRef = useRef<THREE.Group | null>(null);
  const lastSpawnTimeRef = useRef(0);
  const beatIntensityRef = useRef(0);
  const prevMidRef = useRef(0);
  const totalFilamentsSpawnedRef = useRef(0);
  const crystalsRef = useRef<MagicCrystal[]>([]);
  const crystalsGroupRef = useRef<THREE.Group | null>(null);
  const audioActiveRef = useRef(false);
  const [generationKey] = useState(() => Math.random());

  // Initialize scene
  useEffect(() => {
    if (!containerRef.current || !isActive) return;

    const containerWidth = containerRef.current.clientWidth;
    const containerHeight = containerRef.current.clientHeight;

    if (rendererRef.current) {
      rendererRef.current.dispose();
    }

    // Scene with deep black
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(45, containerWidth / containerHeight, 0.1, 1000);
    camera.position.z = 6;
    cameraRef.current = camera;

    // Renderer - Octane-style settings
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      preserveDrawingBuffer: true,
      alpha: false,
      powerPreference: 'high-performance'
    });
    renderer.setSize(containerWidth, containerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    if (onCanvasReady) {
      onCanvasReady(renderer.domElement);
    }

    // === CINEMATIC LIGHTING - Pastelae/Octane style ===
    // Subtle ambient
    const ambientLight = new THREE.AmbientLight(0x101018, 0.3);
    scene.add(ambientLight);

    // Main key light - soft warm
    const keyLight = new THREE.DirectionalLight(0xfff5e6, 0.8);
    keyLight.position.set(3, 4, 5);
    keyLight.castShadow = true;
    scene.add(keyLight);

    // Colored rim lights for Pastelae aesthetic
    const rimLeft = new THREE.SpotLight(0xff6b8a, 1.5, 25, Math.PI / 4, 0.7);
    rimLeft.position.set(-6, 2, -3);
    rimLeft.lookAt(0, 0, 0);
    scene.add(rimLeft);

    const rimRight = new THREE.SpotLight(0x7b68ee, 1.2, 25, Math.PI / 4, 0.7);
    rimRight.position.set(6, -2, -3);
    rimRight.lookAt(0, 0, 0);
    scene.add(rimRight);

    // Bottom fill light - warm
    const bottomLight = new THREE.PointLight(0xffa07a, 0.6, 15);
    bottomLight.position.set(0, -5, 3);
    scene.add(bottomLight);

    // Top accent
    const topLight = new THREE.DirectionalLight(0x87ceeb, 0.4);
    topLight.position.set(0, 8, 2);
    scene.add(topLight);

    // === SINISTER FACE IN BACKGROUND ===
    const faceGroup = new THREE.Group();
    scene.add(faceGroup);
    faceGroupRef.current = faceGroup;

    // Dark, ominous face shape
    const faceGeometry = new THREE.PlaneGeometry(4, 5, 64, 80);
    const facePositions = faceGeometry.attributes.position;

    // Deform into sinister face
    for (let i = 0; i < facePositions.count; i++) {
      const x = facePositions.getX(i);
      const y = facePositions.getY(i);
      let z = 0;

      const nx = x / 2;
      const ny = y / 2.5;
      const dist = Math.sqrt(nx * nx + ny * ny);

      // Face bulge
      z = Math.max(0, (1 - dist * 0.8) * 0.8);

      // Deep eye sockets - more pronounced
      const leftEyeX = -0.35,rightEyeX = 0.35,eyeY = 0.25;
      const leftDist = Math.sqrt(Math.pow(nx - leftEyeX, 2) + Math.pow(ny - eyeY, 2));
      const rightDist = Math.sqrt(Math.pow(nx - rightEyeX, 2) + Math.pow(ny - eyeY, 2));
      if (leftDist < 0.22) z -= (1 - leftDist / 0.22) * 0.25;
      if (rightDist < 0.22) z -= (1 - rightDist / 0.22) * 0.25;

      facePositions.setXYZ(i, x, y, z);
    }
    faceGeometry.computeVertexNormals();

    // Dark matte face material
    const faceMaterial = new THREE.MeshPhysicalMaterial({
      color: 0x050508,
      metalness: 0.2,
      roughness: 0.8,
      transparent: true,
      opacity: 0.6
    });
    const faceMesh = new THREE.Mesh(faceGeometry, faceMaterial);
    faceGroup.add(faceMesh);

    // === SINISTER GLOWING EYES ===
    const eyeGeometry = new THREE.SphereGeometry(0.25, 32, 24);

    // Left eye - bright, unsettling
    const leftEyeMaterial = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.95
    });
    const leftEye = new THREE.Mesh(eyeGeometry, leftEyeMaterial);
    leftEye.position.set(-0.7, 0.6, 0.4);
    leftEye.scale.set(1.2, 0.5, 0.3);
    faceGroup.add(leftEye);

    // Left eye glow
    const leftGlowGeometry = new THREE.SphereGeometry(0.5, 16, 12);
    const leftGlowMaterial = new THREE.MeshBasicMaterial({
      color: 0xff4466,
      transparent: true,
      opacity: 0.3,
      blending: THREE.AdditiveBlending
    });
    const leftGlow = new THREE.Mesh(leftGlowGeometry, leftGlowMaterial);
    leftGlow.position.copy(leftEye.position);
    faceGroup.add(leftGlow);

    // Right eye
    const rightEyeMaterial = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.95
    });
    const rightEye = new THREE.Mesh(eyeGeometry, rightEyeMaterial);
    rightEye.position.set(0.7, 0.6, 0.4);
    rightEye.scale.set(1.2, 0.5, 0.3);
    faceGroup.add(rightEye);

    // Right eye glow
    const rightGlowMaterial = new THREE.MeshBasicMaterial({
      color: 0x6644ff,
      transparent: true,
      opacity: 0.3,
      blending: THREE.AdditiveBlending
    });
    const rightGlow = new THREE.Mesh(leftGlowGeometry.clone(), rightGlowMaterial);
    rightGlow.position.copy(rightEye.position);
    faceGroup.add(rightGlow);

    // Store eye references
    (faceGroup as THREE.Group & {leftEye?: THREE.Mesh;rightEye?: THREE.Mesh;leftGlow?: THREE.Mesh;rightGlow?: THREE.Mesh;}).leftEye = leftEye;
    (faceGroup as THREE.Group & {leftEye?: THREE.Mesh;rightEye?: THREE.Mesh;leftGlow?: THREE.Mesh;rightGlow?: THREE.Mesh;}).rightEye = rightEye;
    (faceGroup as THREE.Group & {leftEye?: THREE.Mesh;rightEye?: THREE.Mesh;leftGlow?: THREE.Mesh;rightGlow?: THREE.Mesh;}).leftGlow = leftGlow;
    (faceGroup as THREE.Group & {leftEye?: THREE.Mesh;rightEye?: THREE.Mesh;leftGlow?: THREE.Mesh;rightGlow?: THREE.Mesh;}).rightGlow = rightGlow;

    // Position face deep in background
    faceGroup.position.z = -4;
    faceGroup.scale.set(1.2, 1.2, 1.2);

    // === FILAMENTS GROUP ===
    const filamentsGroup = new THREE.Group();
    scene.add(filamentsGroup);
    filamentsGroupRef.current = filamentsGroup;

    // === CRYSTALS GROUP (magic symbols) ===
    const crystalsGroup = new THREE.Group();
    scene.add(crystalsGroup);
    crystalsGroupRef.current = crystalsGroup;

    // Cleanup
    const container = containerRef.current;
    return () => {
      cancelAnimationFrame(animationIdRef.current);
      filamentsRef.current.forEach((f) => {
        f.mesh.geometry.dispose();
        (f.mesh.material as THREE.Material).dispose();
      });
      filamentsRef.current = [];
      crystalsRef.current.forEach((c) => {
        c.mesh.geometry.dispose();
        (c.mesh.material as THREE.Material).dispose();
      });
      crystalsRef.current = [];
      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [isActive, onCanvasReady, generationKey]);

  // Animation loop
  useEffect(() => {
    if (!isActive) return;

    // Spawn thick colorful filament
    const spawnFilament = () => {
      if (!filamentsGroupRef.current) return;

      const colorHex = PASTELAE_COLORS[Math.floor(Math.random() * PASTELAE_COLORS.length)];
      const color = new THREE.Color(colorHex);

      // THICK filaments - much bigger than before
      const thickness = 0.08 + Math.random() * 0.15;
      const curveStyles: ('spiral' | 'wave' | 'organic')[] = ['spiral', 'wave', 'organic'];
      const curveStyle = curveStyles[Math.floor(Math.random() * curveStyles.length)];

      // Generate curve points based on style
      const startX = (Math.random() - 0.5) * 6;
      const startY = 5 + Math.random() * 2;
      const endY = -5 - Math.random() * 2;
      const z = 0.5 + Math.random() * 2;

      const points: THREE.Vector3[] = [];
      const numPoints = 15;

      if (curveStyle === 'spiral') {
        const spiralRadius = 0.5 + Math.random() * 0.8;
        const turns = 2 + Math.random() * 4;
        for (let i = 0; i < numPoints; i++) {
          const t = i / (numPoints - 1);
          const y = startY + (endY - startY) * t;
          const angle = t * Math.PI * 2 * turns;
          const r = spiralRadius * (0.3 + Math.sin(t * Math.PI) * 0.7);
          points.push(new THREE.Vector3(
            startX + Math.cos(angle) * r,
            y,
            z + Math.sin(angle) * r * 0.6
          ));
        }
      } else if (curveStyle === 'wave') {
        const waveAmp = 0.4 + Math.random() * 0.6;
        const waveFreq = 3 + Math.random() * 5;
        for (let i = 0; i < numPoints; i++) {
          const t = i / (numPoints - 1);
          const y = startY + (endY - startY) * t;
          points.push(new THREE.Vector3(
            startX + Math.sin(t * Math.PI * waveFreq) * waveAmp,
            y,
            z + Math.cos(t * Math.PI * waveFreq * 0.7) * waveAmp * 0.4
          ));
        }
      } else {
        // Organic S-curves
        for (let i = 0; i < numPoints; i++) {
          const t = i / (numPoints - 1);
          const y = startY + (endY - startY) * t;
          const noise = Math.sin(t * 8 + Math.random() * 5) * 0.3;
          points.push(new THREE.Vector3(
            startX + noise + (Math.random() - 0.5) * 0.4,
            y,
            z + (Math.random() - 0.5) * 0.3
          ));
        }
      }

      const curve = new THREE.CatmullRomCurve3(points, false, 'catmullrom', 0.5);
      const geometry = new THREE.TubeGeometry(curve, 100, thickness, 32, false);

      // Pastelae-style material - soft, glossy, colorful
      const material = new THREE.MeshPhysicalMaterial({
        color: color.clone().multiplyScalar(0.7),
        metalness: 0.15,
        roughness: 0.2,
        clearcoat: 1.0,
        clearcoatRoughness: 0.05,
        sheen: 1.0,
        sheenRoughness: 0.2,
        sheenColor: color,
        emissive: color,
        emissiveIntensity: 0.15,
        transparent: true,
        opacity: 0.95,
        ior: 1.5
      });

      const mesh = new THREE.Mesh(geometry, material);
      filamentsGroupRef.current.add(mesh);

      filamentsRef.current.push({
        mesh,
        basePositions: new Float32Array(geometry.attributes.position.array),
        color,
        spawnTime: timeRef.current,
        lifespan: 6 + Math.random() * 10, // More varied lifespan
        thickness,
        phase: Math.random() * Math.PI * 2,
        speed: 0.2 + Math.random() * 0.8, // More varied speed
        curveStyle,
        // RANDOM unique parameters per filament
        randomSeed: Math.random() * 1000,
        driftX: (Math.random() - 0.5) * 0.02,
        driftY: (Math.random() - 0.5) * 0.015,
        driftZ: (Math.random() - 0.5) * 0.01,
        rotSpeed: (Math.random() - 0.5) * 0.3,
        vibFreq: 5 + Math.random() * 25, // Very varied frequencies
        wobble: Math.random() * 0.3
      });

      totalFilamentsSpawnedRef.current++;
    };

    // Create magic symbol geometry
    const createSymbolGeometry = (type: typeof MAGIC_SYMBOLS[number], size: number): THREE.BufferGeometry => {
      switch (type) {
        case 'triangle': {
          const shape = new THREE.Shape();
          shape.moveTo(0, size);
          shape.lineTo(-size * 0.866, -size * 0.5);
          shape.lineTo(size * 0.866, -size * 0.5);
          shape.lineTo(0, size);
          return new THREE.ShapeGeometry(shape);
        }
        case 'diamond': {
          const shape = new THREE.Shape();
          shape.moveTo(0, size);
          shape.lineTo(-size * 0.6, 0);
          shape.lineTo(0, -size);
          shape.lineTo(size * 0.6, 0);
          shape.lineTo(0, size);
          return new THREE.ShapeGeometry(shape);
        }
        case 'star': {
          const shape = new THREE.Shape();
          for (let i = 0; i < 5; i++) {
            const outerAngle = (i * 72 - 90) * Math.PI / 180;
            const innerAngle = ((i * 72) + 36 - 90) * Math.PI / 180;
            const outerX = Math.cos(outerAngle) * size;
            const outerY = Math.sin(outerAngle) * size;
            const innerX = Math.cos(innerAngle) * size * 0.4;
            const innerY = Math.sin(innerAngle) * size * 0.4;
            if (i === 0) shape.moveTo(outerX, outerY);
            else shape.lineTo(outerX, outerY);
            shape.lineTo(innerX, innerY);
          }
          shape.closePath();
          return new THREE.ShapeGeometry(shape);
        }
        case 'cross': {
          const shape = new THREE.Shape();
          const w = size * 0.25;
          shape.moveTo(-w, size);
          shape.lineTo(w, size);
          shape.lineTo(w, w);
          shape.lineTo(size, w);
          shape.lineTo(size, -w);
          shape.lineTo(w, -w);
          shape.lineTo(w, -size);
          shape.lineTo(-w, -size);
          shape.lineTo(-w, -w);
          shape.lineTo(-size, -w);
          shape.lineTo(-size, w);
          shape.lineTo(-w, w);
          shape.closePath();
          return new THREE.ShapeGeometry(shape);
        }
        case 'hexagon': {
          const shape = new THREE.Shape();
          for (let i = 0; i < 6; i++) {
            const angle = (i * 60 - 30) * Math.PI / 180;
            const x = Math.cos(angle) * size;
            const y = Math.sin(angle) * size;
            if (i === 0) shape.moveTo(x, y);
            else shape.lineTo(x, y);
          }
          shape.closePath();
          return new THREE.ShapeGeometry(shape);
        }
        case 'crescent': {
          const shape = new THREE.Shape();
          shape.absarc(0, 0, size, 0.3, Math.PI * 2 - 0.3, false);
          shape.absarc(size * 0.3, 0, size * 0.7, Math.PI * 2 - 0.5, 0.5, true);
          return new THREE.ShapeGeometry(shape);
        }
        default:
          return new THREE.CircleGeometry(size, 8);
      }
    };

    // Spawn crystal inside a filament
    const spawnCrystal = (parentFilament: THREE.Mesh, color: THREE.Color) => {
      if (!crystalsGroupRef.current) return;

      const symbolType = MAGIC_SYMBOLS[Math.floor(Math.random() * MAGIC_SYMBOLS.length)];
      const size = 0.05 + Math.random() * 0.1;
      const geometry = createSymbolGeometry(symbolType, size);

      // Glowing crystal material
      const material = new THREE.MeshBasicMaterial({
        color: color.clone().multiplyScalar(1.5),
        transparent: true,
        opacity: 0.9,
        side: THREE.DoubleSide,
        blending: THREE.AdditiveBlending
      });

      const mesh = new THREE.Mesh(geometry, material);

      // Position inside/near the filament
      const parentPos = parentFilament.position.clone();
      const randomOffset = new THREE.Vector3(
        (Math.random() - 0.5) * 0.5,
        (Math.random() - 0.5) * 2,
        (Math.random() - 0.5) * 0.5
      );
      mesh.position.copy(parentPos.add(randomOffset));

      crystalsGroupRef.current.add(mesh);

      crystalsRef.current.push({
        mesh,
        spawnTime: timeRef.current,
        lifespan: 0.5 + Math.random() * 1.5,
        parentFilament,
        rotSpeed: new THREE.Vector3(
          (Math.random() - 0.5) * 5,
          (Math.random() - 0.5) * 5,
          (Math.random() - 0.5) * 5
        ),
        scale: size
      });
    };

    // Spawn initial filaments at RANDOM times
    const initialCount = 10 + Math.floor(Math.random() * 10);
    for (let i = 0; i < initialCount; i++) {
      // Stagger spawn times randomly
      setTimeout(() => spawnFilament(), Math.random() * 500);
    }

    const animate = () => {
      timeRef.current += 0.016;
      const time = timeRef.current;

      if (faceGroupRef.current && filamentsGroupRef.current && sceneRef.current && cameraRef.current && rendererRef.current) {
        const { bass, treble, volume, mid } = audioData;

        // Dynamic background illumination
        const bgIntensity = Math.min(0.06, bass * 0.04 + volume * 0.02);
        sceneRef.current.background = new THREE.Color(bgIntensity * 0.3, bgIntensity * 0.2, bgIntensity * 0.5);

        // Beat detection
        const midDelta = mid - prevMidRef.current;
        prevMidRef.current = mid * 0.3 + prevMidRef.current * 0.7;
        beatIntensityRef.current *= 0.9;
        if (midDelta > 0.12) {
          beatIntensityRef.current = Math.min(1, midDelta * 3);
        }
        const beatHit = beatIntensityRef.current;

        // Detect if audio is active (visual stops when audio stops)
        const audioIsActive = volume > 0.01 || bass > 0.01 || mid > 0.01;
        audioActiveRef.current = audioIsActive;

        // === SPAWN CRYSTALS ON BEATS ===
        if (beatHit > 0.3 && filamentsRef.current.length > 0) {
          const numCrystals = Math.floor(beatHit * 8) + Math.floor(Math.random() * 4);
          for (let i = 0; i < numCrystals; i++) {
            const randomFilament = filamentsRef.current[Math.floor(Math.random() * filamentsRef.current.length)];
            spawnCrystal(randomFilament.mesh, randomFilament.color);
          }
        }

        // === SINISTER EYES ANIMATION ===
        const faceTyped = faceGroupRef.current as THREE.Group & {leftEye?: THREE.Mesh;rightEye?: THREE.Mesh;leftGlow?: THREE.Mesh;rightGlow?: THREE.Mesh;};
        if (faceTyped.leftEye && faceTyped.rightEye) {
          // Eyes follow audio with subtle creepy movement
          const eyeX = Math.sin(time * 0.8 + treble * 5) * treble * 0.15;
          const eyeY = Math.cos(time * 0.6 + mid * 4) * mid * 0.1;

          faceTyped.leftEye.rotation.y = eyeX;
          faceTyped.leftEye.rotation.x = eyeY;
          faceTyped.rightEye.rotation.y = -eyeX;
          faceTyped.rightEye.rotation.x = eyeY;

          // Eye glow pulses with beat
          const glowIntensity = 0.2 + beatHit * 0.5 + bass * 0.3;
          if (faceTyped.leftGlow) {
            (faceTyped.leftGlow.material as THREE.MeshBasicMaterial).opacity = glowIntensity;
          }
          if (faceTyped.rightGlow) {
            (faceTyped.rightGlow.material as THREE.MeshBasicMaterial).opacity = glowIntensity;
          }

          // Eyes scale with bass
          const eyeScale = 1 + bass * 0.3 + beatHit * 0.2;
          faceTyped.leftEye.scale.set(1.2 * eyeScale, 0.5 * eyeScale, 0.3);
          faceTyped.rightEye.scale.set(1.2 * eyeScale, 0.5 * eyeScale, 0.3);
        }

        // Face subtle movement
        faceGroupRef.current.rotation.y = Math.sin(time * 0.15) * 0.05;
        faceGroupRef.current.rotation.x = Math.sin(time * 0.1) * 0.03;

        // === SPAWN FILAMENTS RANDOMLY based on audio ===
        const timeSinceSpawn = time - lastSpawnTimeRef.current;
        // Random spawn rate that varies
        const baseSpawnRate = 0.1 + Math.random() * 0.15;
        const spawnRate = baseSpawnRate - volume * 0.06;
        const maxFilaments = 50 + Math.floor(Math.random() * 30);

        // Random chance to spawn even without beat
        const randomSpawnChance = Math.random() < 0.02;
        
        if ((timeSinceSpawn > spawnRate || randomSpawnChance) && filamentsRef.current.length < maxFilaments) {
          spawnFilament();
          // Random extra spawns on beats
          if (beatHit > 0.25 && Math.random() > 0.4) spawnFilament();
          if (beatHit > 0.5 && Math.random() > 0.5) spawnFilament();
          if (beatHit > 0.7 && Math.random() > 0.6) {
            spawnFilament();
            spawnFilament();
          }
          lastSpawnTimeRef.current = time;
        }

        // === ANIMATE FILAMENTS - Reactive to music ===
        const filamentsToRemove: ThickFilament[] = [];

        filamentsRef.current.forEach((filament) => {
          const age = time - filament.spawnTime;
          const lifeProgress = age / filament.lifespan;

          if (lifeProgress >= 1) {
            filamentsToRemove.push(filament);
            return;
          }

          const mat = filament.mesh.material as THREE.MeshPhysicalMaterial;

          // Fade in/out
          if (lifeProgress < 0.1) {
            mat.opacity = lifeProgress / 0.1 * 0.95;
          } else if (lifeProgress > 0.85) {
            mat.opacity = (1 - (lifeProgress - 0.85) / 0.15) * 0.95;
          } else {
            mat.opacity = 0.95;
          }

          // RANDOM movement - each filament moves uniquely, no sequence
          const seed = filament.randomSeed;
          const uniqueTime = time + seed;
          
          // Random drift that accumulates over time
          filament.mesh.position.x += filament.driftX * (1 + beatHit * 2);
          filament.mesh.position.y += filament.driftY;
          filament.mesh.position.z += filament.driftZ;
          
          // Beat-reactive vibration with RANDOM frequency per filament
          const vibIntensity = beatHit * 0.25 + bass * 0.12;
          filament.mesh.position.x += Math.sin(uniqueTime * filament.vibFreq) * vibIntensity * (0.5 + Math.random() * 0.5);
          filament.mesh.position.z += Math.cos(uniqueTime * filament.vibFreq * 0.8) * vibIntensity * 0.4;
          
          // Random wobble
          filament.mesh.position.x += Math.sin(uniqueTime * 3 + seed) * filament.wobble * (1 + beatHit);
          filament.mesh.position.y += Math.cos(uniqueTime * 2.5 + seed * 0.7) * filament.wobble * 0.5;

          // RANDOM rotation - unique per filament
          const rotSeed = filament.randomSeed * 0.001;
          filament.mesh.rotation.z += filament.rotSpeed * (0.5 + beatHit * 2) * 0.016;
          filament.mesh.rotation.x = Math.sin(time * filament.speed + rotSeed) * 0.08 * (1 + beatHit);
          filament.mesh.rotation.y = Math.cos(time * filament.speed * 0.7 + rotSeed) * 0.05;

          // Emissive glow pulses with beat
          mat.emissiveIntensity = 0.1 + beatHit * 0.4 + bass * 0.2;

          // Scale pulse on beats
          const scalePulse = 1 + beatHit * 0.15;
          filament.mesh.scale.set(scalePulse, 1, scalePulse);
        });

        // Remove dead filaments
        filamentsToRemove.forEach((filament) => {
          filamentsGroupRef.current?.remove(filament.mesh);
          filament.mesh.geometry.dispose();
          (filament.mesh.material as THREE.Material).dispose();
          const idx = filamentsRef.current.indexOf(filament);
          if (idx > -1) filamentsRef.current.splice(idx, 1);
        });

        // === ANIMATE MAGIC CRYSTALS ===
        const crystalsToRemove: MagicCrystal[] = [];
        
        crystalsRef.current.forEach((crystal) => {
          const age = time - crystal.spawnTime;
          const lifeProgress = age / crystal.lifespan;

          if (lifeProgress >= 1) {
            crystalsToRemove.push(crystal);
            return;
          }

          // Rotate wildly
          crystal.mesh.rotation.x += crystal.rotSpeed.x * 0.016;
          crystal.mesh.rotation.y += crystal.rotSpeed.y * 0.016;
          crystal.mesh.rotation.z += crystal.rotSpeed.z * 0.016;

          // Float upward and outward
          crystal.mesh.position.y += 0.02 + beatHit * 0.03;
          crystal.mesh.position.x += (Math.random() - 0.5) * 0.02;
          crystal.mesh.position.z += (Math.random() - 0.5) * 0.02;

          // Scale animation: grow in, shrink out
          let scaleMult = 1;
          if (lifeProgress < 0.2) {
            scaleMult = lifeProgress / 0.2;
          } else if (lifeProgress > 0.7) {
            scaleMult = 1 - (lifeProgress - 0.7) / 0.3;
          }
          const scale = crystal.scale * scaleMult * (1 + beatHit * 0.5);
          crystal.mesh.scale.set(scale, scale, scale);

          // Fade out
          const mat = crystal.mesh.material as THREE.MeshBasicMaterial;
          mat.opacity = (1 - lifeProgress) * 0.9;
        });

        // Remove dead crystals
        crystalsToRemove.forEach((crystal) => {
          crystalsGroupRef.current?.remove(crystal.mesh);
          crystal.mesh.geometry.dispose();
          (crystal.mesh.material as THREE.Material).dispose();
          const idx = crystalsRef.current.indexOf(crystal);
          if (idx > -1) crystalsRef.current.splice(idx, 1);
        });

        // === VISUAL STOPS WHEN AUDIO STOPS ===
        // Fade all elements when no audio
        if (!audioIsActive) {
          // Fade filaments
          filamentsRef.current.forEach((filament) => {
            const mat = filament.mesh.material as THREE.MeshPhysicalMaterial;
            mat.opacity = Math.max(0, mat.opacity - 0.02);
          });
          // Fade crystals
          crystalsRef.current.forEach((crystal) => {
            const mat = crystal.mesh.material as THREE.MeshBasicMaterial;
            mat.opacity = Math.max(0, mat.opacity - 0.05);
          });
          // Fade face
          if (faceTyped.leftGlow) {
            (faceTyped.leftGlow.material as THREE.MeshBasicMaterial).opacity *= 0.95;
          }
          if (faceTyped.rightGlow) {
            (faceTyped.rightGlow.material as THREE.MeshBasicMaterial).opacity *= 0.95;
          }
        }

        rendererRef.current.render(sceneRef.current, cameraRef.current);
      }

      animationIdRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationIdRef.current);
    };
  }, [isActive, audioData]);

  return <div data-ev-id="ev_5ea342a21d" ref={containerRef} className="absolute inset-0" />;
}