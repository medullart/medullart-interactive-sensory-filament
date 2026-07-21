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
}

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

    // Cleanup
    const container = containerRef.current;
    return () => {
      cancelAnimationFrame(animationIdRef.current);
      filamentsRef.current.forEach((f) => {
        f.mesh.geometry.dispose();
        (f.mesh.material as THREE.Material).dispose();
      });
      filamentsRef.current = [];
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
        lifespan: 8 + Math.random() * 6,
        thickness,
        phase: Math.random() * Math.PI * 2,
        speed: 0.3 + Math.random() * 0.5,
        curveStyle
      });

      totalFilamentsSpawnedRef.current++;
    };

    // Spawn initial filaments
    for (let i = 0; i < 15; i++) {
      spawnFilament();
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

        // === SPAWN MORE FILAMENTS AS AUDIO PROGRESSES ===
        const timeSinceSpawn = time - lastSpawnTimeRef.current;
        const spawnRate = 0.15 - volume * 0.08; // Faster spawn with louder audio
        const maxFilaments = 60 + Math.floor(totalFilamentsSpawnedRef.current * 0.1); // Increases over time

        if (timeSinceSpawn > spawnRate && filamentsRef.current.length < maxFilaments) {
          spawnFilament();
          if (beatHit > 0.3) spawnFilament(); // Extra on beats
          if (beatHit > 0.6) spawnFilament(); // Even more on big beats
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

          // Beat-reactive vibration
          const vibIntensity = beatHit * 0.15 + bass * 0.08;
          filament.mesh.position.x = Math.sin(time * 15 + filament.phase) * vibIntensity;
          filament.mesh.position.z = Math.cos(time * 12 + filament.phase) * vibIntensity * 0.5;

          // Rotation with audio
          filament.mesh.rotation.z = Math.sin(time * filament.speed + filament.phase) * 0.1 * (1 + beatHit);
          filament.mesh.rotation.x = Math.sin(time * 0.3 + filament.phase) * 0.05;

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