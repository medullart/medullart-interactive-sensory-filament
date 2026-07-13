import { useRef, useEffect, useMemo, useState } from 'react';
import * as THREE from 'three';
import type { AudioData } from '@/hooks/useAudioAnalyzer';
import { generateNormalMap, generateRoughnessMap } from '@/utils/proceduralTextures';

interface HumanoidMeshProps {
  audioData: AudioData;
  isActive: boolean;
  onCanvasReady?: (canvas: HTMLCanvasElement) => void;
}

// Generate random aesthetic parameters
function generateAesthetic() {
  // Random color palettes - cinematic/diverse variety
  const palettes = [
    // Monochrome Silver (like reference)
    { primary: 0xcccccc, secondary: 0x888888, accent: 0xffffff, ambient: 0x101015 },
    // Cold Steel
    { primary: 0x99aacc, secondary: 0x667799, accent: 0xddddff, ambient: 0x0a0a12 },
    // Cyberpunk
    { primary: 0x00ffff, secondary: 0xff00ff, accent: 0x00ff88, ambient: 0x0a1020 },
    // Deep Purple
    { primary: 0x8844ff, secondary: 0xff44aa, accent: 0xaa88ff, ambient: 0x0a0815 },
    // Ocean Depths
    { primary: 0x0066cc, secondary: 0x00aaff, accent: 0x003388, ambient: 0x050a15 },
    // Neon Red
    { primary: 0xff0044, secondary: 0xff4466, accent: 0xcc0033, ambient: 0x100508 },
    // Arctic Blue
    { primary: 0x66aaff, secondary: 0xaaddff, accent: 0x4488cc, ambient: 0x080a12 },
    // Volcanic
    { primary: 0xff4400, secondary: 0xff6622, accent: 0xffaa00, ambient: 0x100505 },
    // Emerald
    { primary: 0x00cc66, secondary: 0x22ff88, accent: 0x00aa44, ambient: 0x050a08 },
    // Gold Chrome
    { primary: 0xccaa44, secondary: 0xffcc66, accent: 0xaa8822, ambient: 0x0a0805 },
    // Electric Blue
    { primary: 0x0088ff, secondary: 0x44aaff, accent: 0x0066cc, ambient: 0x050810 },
    // Plasma Pink
    { primary: 0xff44aa, secondary: 0xff66cc, accent: 0xcc2288, ambient: 0x100510 },
    // Ghost White
    { primary: 0xeeeeff, secondary: 0xaabbcc, accent: 0xffffff, ambient: 0x080810 },
    // Infrared
    { primary: 0xff2222, secondary: 0xcc0000, accent: 0xff4444, ambient: 0x100505 },
  ];

  const palette = palettes[Math.floor(Math.random() * palettes.length)];
  
  // Generate filament colors from palette with more variation
  const filamentColors = [
    new THREE.Color(palette.primary),
    new THREE.Color(palette.secondary),
    new THREE.Color(palette.accent),
    new THREE.Color(palette.primary).lerp(new THREE.Color(palette.secondary), 0.3 + Math.random() * 0.4),
    new THREE.Color(palette.secondary).lerp(new THREE.Color(palette.accent), 0.3 + Math.random() * 0.4),
    new THREE.Color(palette.accent).lerp(new THREE.Color(palette.primary), 0.3 + Math.random() * 0.4),
  ];

  // More diverse head shape variations
  const headStyles = [
    'classic',      // Standard human proportions
    'elongated',    // Taller, thinner
    'angular',      // More defined bone structure
    'soft',         // Rounder features
    'dramatic',     // Exaggerated features
    'ethereal',     // Otherworldly
  ];
  
  const headStyle = headStyles[Math.floor(Math.random() * headStyles.length)];

  // Style-specific parameters
  const styleParams: Record<string, { scale: number; elongation: number; cheekbones: number; jawWidth: number; foreheadSize: number; noseLength: number }> = {
    classic: { scale: 1.3, elongation: 1.35, cheekbones: 0.08, jawWidth: 0.65, foreheadSize: 0.12, noseLength: 0.18 },
    elongated: { scale: 1.2, elongation: 1.55, cheekbones: 0.06, jawWidth: 0.55, foreheadSize: 0.15, noseLength: 0.22 },
    angular: { scale: 1.35, elongation: 1.4, cheekbones: 0.12, jawWidth: 0.7, foreheadSize: 0.1, noseLength: 0.16 },
    soft: { scale: 1.4, elongation: 1.25, cheekbones: 0.05, jawWidth: 0.75, foreheadSize: 0.1, noseLength: 0.14 },
    dramatic: { scale: 1.35, elongation: 1.45, cheekbones: 0.15, jawWidth: 0.6, foreheadSize: 0.18, noseLength: 0.2 },
    ethereal: { scale: 1.25, elongation: 1.5, cheekbones: 0.04, jawWidth: 0.5, foreheadSize: 0.14, noseLength: 0.12 },
  };

  const params = styleParams[headStyle];

  return {
    palette,
    filamentColors,
    headStyle,
    headScale: params.scale + (Math.random() - 0.5) * 0.2,
    headElongation: params.elongation + (Math.random() - 0.5) * 0.15,
    cheekboneIntensity: params.cheekbones + (Math.random() - 0.5) * 0.04,
    jawWidth: params.jawWidth + (Math.random() - 0.5) * 0.1,
    foreheadSize: params.foreheadSize + (Math.random() - 0.5) * 0.04,
    noseLength: params.noseLength + (Math.random() - 0.5) * 0.04,
    headMetalness: 0.8 + Math.random() * 0.15,
    headRoughness: 0.05 + Math.random() * 0.1,
    // Movement parameters for live show feel
    moveSpeed: 0.15 + Math.random() * 0.2,
    moveRange: 1.5 + Math.random() * 1.0,
    rotationIntensity: 0.3 + Math.random() * 0.4,
  };
}

interface FilamentData {
  mesh: THREE.Mesh;
  basePositions: Float32Array;
  velocity: THREE.Vector3;
  angularVelocity: THREE.Vector3;
  spawnTime: number;
  lifespan: number;
  floatPhase: number;
  floatSpeed: number;
}

export function HumanoidMesh({ audioData, isActive, onCanvasReady }: HumanoidMeshProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const faceGroupRef = useRef<THREE.Group | null>(null);
  const filamentsGroupRef = useRef<THREE.Group | null>(null);
  const timeRef = useRef(0);
  const animationIdRef = useRef<number>(0);
  const headMeshRef = useRef<THREE.Mesh | null>(null);
  const featureMeshesRef = useRef<THREE.Mesh[]>([]);
  const filamentsRef = useRef<FilamentData[]>([]);
  const particlesRef = useRef<THREE.Points | null>(null);
  const lastSpawnTimeRef = useRef(0);
  const aestheticRef = useRef(generateAesthetic());
  const lightsRef = useRef<THREE.Light[]>([]);
  const envMapRef = useRef<THREE.Texture | null>(null);
  
  // Beat detection refs for snare/accent hits
  const prevMidRef = useRef(0);
  const prevHighRef = useRef(0);
  const beatIntensityRef = useRef(0);
  const lastBeatTimeRef = useRef(0);
  const beatCooldownRef = useRef(0);
  
  // Quantum teleport refs for head movement
  const teleportTargetRef = useRef({ x: 0, y: 0, z: 0 });
  const lastTeleportTimeRef = useRef(0);
  const teleportPhaseRef = useRef(0); // 0 = stable, 1 = glitching, 2 = teleporting
  const glitchIntensityRef = useRef(0);

  // Generate new aesthetic each time component becomes active
  const [generationKey, setGenerationKey] = useState(0);

  useEffect(() => {
    if (isActive) {
      aestheticRef.current = generateAesthetic();
      setGenerationKey(prev => prev + 1);
    }
  }, [isActive]);

  // Generate textures
  const textures = useMemo(() => ({
    normalMap: generateNormalMap(512),
    roughnessMap: generateRoughnessMap(256)
  }), []);

  // Main scene setup - regenerates with new aesthetic
  useEffect(() => {
    if (!containerRef.current) return;

    const aesthetic = aestheticRef.current;
    const containerWidth = containerRef.current.clientWidth;
    const containerHeight = containerRef.current.clientHeight;

    // Clear existing scene if any
    if (rendererRef.current) {
      rendererRef.current.dispose();
    }

    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(40, containerWidth / containerHeight, 0.1, 1000);
    camera.position.z = 5;
    cameraRef.current = camera;

    // Renderer
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      preserveDrawingBuffer: true,
      alpha: false
    });
    renderer.setSize(containerWidth, containerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 0.85;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    if (onCanvasReady) {
      onCanvasReady(renderer.domElement);
    }

    // === CINEMATIC DARK LIGHTING ===
    lightsRef.current = [];

    // Very subtle ambient - almost black
    const ambientLight = new THREE.AmbientLight(0x050508, 0.2);
    scene.add(ambientLight);
    lightsRef.current.push(ambientLight);

    // Main key light - soft white from front-right (cinematic)
    const keyLight = new THREE.DirectionalLight(0xffffff, 0.6);
    keyLight.position.set(3, 2, 4);
    scene.add(keyLight);
    lightsRef.current.push(keyLight);

    // Soft rim light from back-left with palette color tint
    const rimLeft = new THREE.SpotLight(new THREE.Color(aesthetic.palette.primary).multiplyScalar(0.5), 1.5, 20, Math.PI / 3, 0.8);
    rimLeft.position.set(-5, 1, -3);
    rimLeft.lookAt(0, 0, 0);
    scene.add(rimLeft);
    lightsRef.current.push(rimLeft);

    // Soft rim light from back-right with secondary color
    const rimRight = new THREE.SpotLight(new THREE.Color(aesthetic.palette.secondary).multiplyScalar(0.4), 1.2, 20, Math.PI / 3, 0.8);
    rimRight.position.set(5, -1, -3);
    rimRight.lookAt(0, 0, 0);
    scene.add(rimRight);
    lightsRef.current.push(rimRight);

    // Subtle top light for depth
    const topLight = new THREE.DirectionalLight(0xaaaacc, 0.3);
    topLight.position.set(0, 6, 2);
    scene.add(topLight);
    lightsRef.current.push(topLight);

    // === FACE GROUP ===
    const faceGroup = new THREE.Group();
    scene.add(faceGroup);
    faceGroupRef.current = faceGroup;

    // === FILAMENTS GROUP ===
    const filamentsGroup = new THREE.Group();
    scene.add(filamentsGroup);
    filamentsGroupRef.current = filamentsGroup;

    // === ABSTRACT WIREFRAME FACE (no full head) ===
    // Create a flat face mesh with wireframe overlay
    const faceScale = 1.8 + Math.random() * 0.4;
    const faceGeometry = new THREE.PlaneGeometry(faceScale * 1.2, faceScale * 1.5, 48, 60);
    const facePositions = faceGeometry.attributes.position;

    // Deform plane into face-like shape
    for (let i = 0; i < facePositions.count; i++) {
      const x = facePositions.getX(i);
      const y = facePositions.getY(i);
      let z = 0;

      const nx = x / (faceScale * 0.6);
      const ny = y / (faceScale * 0.75);
      
      // Face curvature - push center forward
      const distFromCenter = Math.sqrt(nx * nx + ny * ny);
      z = Math.max(0, (1 - distFromCenter) * 0.6);
      
      // Forehead bulge
      if (ny > 0.3 && ny < 0.8) {
        z += Math.sin((ny - 0.3) * Math.PI / 0.5) * 0.15 * (1 - Math.abs(nx) * 0.5);
      }
      
      // Brow ridge
      if (ny > 0.15 && ny < 0.35 && Math.abs(nx) < 0.6) {
        z += 0.08 * (1 - Math.abs(ny - 0.25) * 5) * (1 - Math.abs(nx));
      }
      
      // Eye sockets - indent
      const leftEyeX = -0.28, rightEyeX = 0.28, eyeY = 0.18;
      const leftEyeDist = Math.sqrt(Math.pow(nx - leftEyeX, 2) + Math.pow(ny - eyeY, 2));
      const rightEyeDist = Math.sqrt(Math.pow(nx - rightEyeX, 2) + Math.pow(ny - eyeY, 2));
      if (leftEyeDist < 0.18) z -= (1 - leftEyeDist / 0.18) * 0.12;
      if (rightEyeDist < 0.18) z -= (1 - rightEyeDist / 0.18) * 0.12;
      
      // Nose bridge
      if (ny > -0.1 && ny < 0.25 && Math.abs(nx) < 0.1) {
        z += 0.2 * (1 - Math.abs(nx) * 10) * (1 - Math.abs(ny - 0.07) * 3);
      }
      
      // Cheekbones
      if (ny > -0.15 && ny < 0.1 && Math.abs(nx) > 0.25 && Math.abs(nx) < 0.55) {
        z += 0.08 * (1 - Math.abs(ny) * 4);
      }
      
      // Mouth indent
      if (ny > -0.45 && ny < -0.25 && Math.abs(nx) < 0.25) {
        z -= 0.05 * (1 - Math.abs(nx) * 4) * (1 - Math.abs(ny + 0.35) * 5);
      }
      
      // Jaw line
      if (ny < -0.3) {
        const jawFade = 1 + ny * 1.5;
        z *= Math.max(0, jawFade);
      }

      facePositions.setXYZ(i, x, y, z);
    }
    faceGeometry.computeVertexNormals();

    // Wireframe material - metallic mesh look
    const wireMaterial = new THREE.MeshPhysicalMaterial({
      color: 0x181820,
      metalness: 0.9,
      roughness: 0.2,
      wireframe: true,
      emissive: new THREE.Color(aesthetic.palette.primary).multiplyScalar(0.1),
      emissiveIntensity: 0.3
    });
    
    const wireframeFace = new THREE.Mesh(faceGeometry.clone(), wireMaterial);
    wireframeFace.position.z = 0.02;
    faceGroup.add(wireframeFace);
    
    // Solid dark base face underneath
    const baseMaterial = new THREE.MeshPhysicalMaterial({
      color: 0x0a0a10,
      metalness: 0.7,
      roughness: 0.3,
      clearcoat: 0.6,
      clearcoatRoughness: 0.2,
      envMapIntensity: 0.5,
      transparent: true,
      opacity: 0.85
    });
    
    const baseFace = new THREE.Mesh(faceGeometry, baseMaterial);
    faceGroup.add(baseFace);
    headMeshRef.current = baseFace;
    featureMeshesRef.current = [wireframeFace];

    // Create simple gradient environment for realistic reflections
    const envScene = new THREE.Scene();
    const envGeo = new THREE.SphereGeometry(50, 32, 32);
    const envMat = new THREE.ShaderMaterial({
      side: THREE.BackSide,
      uniforms: {
        topColor: { value: new THREE.Color(aesthetic.palette.primary).multiplyScalar(0.15) },
        bottomColor: { value: new THREE.Color(aesthetic.palette.secondary).multiplyScalar(0.1) },
        offset: { value: 10 },
        exponent: { value: 0.6 }
      },
      vertexShader: `
        varying vec3 vWorldPosition;
        void main() {
          vec4 worldPosition = modelMatrix * vec4(position, 1.0);
          vWorldPosition = worldPosition.xyz;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 topColor;
        uniform vec3 bottomColor;
        uniform float offset;
        uniform float exponent;
        varying vec3 vWorldPosition;
        void main() {
          float h = normalize(vWorldPosition + offset).y;
          gl_FragColor = vec4(mix(bottomColor, topColor, max(pow(max(h, 0.0), exponent), 0.0)), 1.0);
        }
      `
    });
    const envSphere = new THREE.Mesh(envGeo, envMat);
    envScene.add(envSphere);
    
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    pmremGenerator.compileEquirectangularShader();
    const envMap = pmremGenerator.fromScene(envScene, 0, 0.1, 100).texture;
    scene.environment = envMap;
    envMapRef.current = envMap;

    // === GLOWING EYES - bright white like reference image ===
    const eyeSpacing = 0.5 + Math.random() * 0.15;
    const eyeY = 0.32 + Math.random() * 0.1;
    const eyeSize = 0.18 + Math.random() * 0.08;
    
    const eyeGeometry = new THREE.SphereGeometry(eyeSize, 32, 24);
    const eyeMaterial = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.95
    });
    
    // Add glow effect with larger transparent sphere
    const eyeGlowGeometry = new THREE.SphereGeometry(eyeSize * 1.8, 16, 12);
    const eyeGlowMaterial = new THREE.MeshBasicMaterial({
      color: new THREE.Color(aesthetic.palette.primary),
      transparent: true,
      opacity: 0.25,
      blending: THREE.AdditiveBlending
    });
    
    const leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
    leftEye.position.set(-eyeSpacing, eyeY, 0.55);
    leftEye.scale.set(1.4, 0.65, 0.4);
    faceGroup.add(leftEye);
    
    const leftGlow = new THREE.Mesh(eyeGlowGeometry, eyeGlowMaterial);
    leftGlow.position.copy(leftEye.position);
    leftGlow.scale.set(1.4, 0.65, 0.4);
    faceGroup.add(leftGlow);
    
    const rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial.clone());
    rightEye.position.set(eyeSpacing, eyeY, 0.55);
    rightEye.scale.set(1.4, 0.65, 0.4);
    faceGroup.add(rightEye);
    
    const rightGlowMat = eyeGlowMaterial.clone();
    rightGlowMat.color = new THREE.Color(aesthetic.palette.secondary);
    const rightGlow = new THREE.Mesh(eyeGlowGeometry, rightGlowMat);
    rightGlow.position.copy(rightEye.position);
    rightGlow.scale.set(1.4, 0.65, 0.4);
    faceGroup.add(rightGlow);
    
    featureMeshesRef.current.push(leftEye, rightEye, leftGlow, rightGlow);
    
    // === SUBTLE NOSE LINE ===
    const noseGeometry = new THREE.CylinderGeometry(0.02, 0.04, 0.35, 8);
    const noseMaterial = new THREE.MeshPhysicalMaterial({
      color: 0x151520,
      metalness: 0.8,
      roughness: 0.25,
      emissive: new THREE.Color(aesthetic.palette.accent).multiplyScalar(0.15),
      emissiveIntensity: 0.3
    });
    const nose = new THREE.Mesh(noseGeometry, noseMaterial);
    nose.position.set(0, 0.05, 0.65);
    nose.rotation.x = Math.PI * 0.15;
    faceGroup.add(nose);
    featureMeshesRef.current.push(nose);
    
    // === MOUTH - subtle dark line ===
    const mouthWidth = 0.3 + Math.random() * 0.1;
    const mouthGeometry = new THREE.TorusGeometry(mouthWidth, 0.015, 8, 20, Math.PI);
    const mouthMaterial = new THREE.MeshPhysicalMaterial({
      color: 0x080810,
      metalness: 0.7,
      roughness: 0.3,
      emissive: new THREE.Color(aesthetic.palette.secondary).multiplyScalar(0.1),
      emissiveIntensity: 0.2
    });
    const mouth = new THREE.Mesh(mouthGeometry, mouthMaterial);
    mouth.position.set(0, -0.42 - Math.random() * 0.08, 0.45);
    mouth.rotation.x = Math.PI;
    mouth.rotation.z = Math.PI;
    faceGroup.add(mouth);
    featureMeshesRef.current.push(mouth);

    // Position face in background, slightly smaller
    faceGroup.position.z = -1.5;
    faceGroup.scale.set(0.85, 0.85, 0.85);
    
    // === SUBTLE PARTICLES - dust/atmosphere ===
    const particleCount = 80;
    const particleGeometry = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    const particleColors = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      particlePositions[i * 3] = (Math.random() - 0.5) * 8;
      particlePositions[i * 3 + 1] = (Math.random() - 0.5) * 6;
      particlePositions[i * 3 + 2] = Math.random() * 4 - 2;

      const color = aesthetic.filamentColors[Math.floor(Math.random() * aesthetic.filamentColors.length)];
      particleColors[i * 3] = color.r * 0.5;
      particleColors[i * 3 + 1] = color.g * 0.5;
      particleColors[i * 3 + 2] = color.b * 0.5;
    }

    particleGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    particleGeometry.setAttribute('color', new THREE.BufferAttribute(particleColors, 3));

    const particleMaterial = new THREE.PointsMaterial({
      size: 0.03,
      vertexColors: true,
      transparent: true,
      opacity: 0.4,
      blending: THREE.AdditiveBlending,
      sizeAttenuation: true
    });

    const particles = new THREE.Points(particleGeometry, particleMaterial);
    filamentsGroup.add(particles);
    particlesRef.current = particles;

    // Cleanup
    const container = containerRef.current;
    return () => {
      cancelAnimationFrame(animationIdRef.current);
      filamentsRef.current.forEach((f) => {
        f.mesh.geometry.dispose();
        (f.mesh.material as THREE.Material).dispose();
      });
      filamentsRef.current = [];
      featureMeshesRef.current = [];
      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [textures, onCanvasReady, generationKey]);

  // Animation loop
  useEffect(() => {
    if (!isActive) return;

    const aesthetic = aestheticRef.current;

    const spawnFilament = () => {
      if (!filamentsGroupRef.current) return;

      const colorIndex = Math.floor(Math.random() * aesthetic.filamentColors.length);
      const color = aesthetic.filamentColors[colorIndex];

      // VERTICAL solid rubber filament - extends beyond screen
      const x = (Math.random() - 0.5) * 3.5;
      const startY = 6 + Math.random() * 1; // Extended beyond screen top
      const endY = -6 - Math.random() * 1;  // Extended beyond screen bottom
      const z = 0.2 + Math.random() * 1.5;

      const points = [
        new THREE.Vector3(x + (Math.random() - 0.5) * 0.3, startY, z),
        new THREE.Vector3(x + (Math.random() - 0.5) * 0.4, startY * 0.5, z + 0.2),
        new THREE.Vector3(x + (Math.random() - 0.5) * 0.35, startY * 0.2, z + 0.3),
        new THREE.Vector3(x + (Math.random() - 0.5) * 0.3, 0, z + 0.35),
        new THREE.Vector3(x + (Math.random() - 0.5) * 0.35, endY * 0.2, z + 0.3),
        new THREE.Vector3(x + (Math.random() - 0.5) * 0.4, endY * 0.5, z + 0.2),
        new THREE.Vector3(x + (Math.random() - 0.5) * 0.3, endY, z),
      ];

      const curve = new THREE.CatmullRomCurve3(points, false, 'catmullrom', 0.5);
      const thickness = 0.022 + Math.random() * 0.018;
      const geometry = new THREE.TubeGeometry(curve, 80, thickness, 20, false);

      // LATEX/PLASTIC material - glossy, reflective, cinematic
      const materialTypes = ['latex', 'plastic', 'rubber'];
      const matType = materialTypes[Math.floor(Math.random() * materialTypes.length)];
      
      let material: THREE.MeshPhysicalMaterial;
      
      if (matType === 'latex') {
        // Shiny latex look
        material = new THREE.MeshPhysicalMaterial({
          color: color.clone().multiplyScalar(0.4),
          metalness: 0.1,
          roughness: 0.08,
          clearcoat: 1.0,
          clearcoatRoughness: 0.02,
          reflectivity: 1.0,
          sheen: 1.0,
          sheenRoughness: 0.1,
          sheenColor: color,
          emissive: color,
          emissiveIntensity: 0.08,
          transparent: true,
          opacity: 0.92,
          envMap: envMapRef.current,
          envMapIntensity: 1.2,
          ior: 1.6
        });
      } else if (matType === 'plastic') {
        // Hard plastic look
        material = new THREE.MeshPhysicalMaterial({
          color: color.clone().multiplyScalar(0.6),
          metalness: 0.0,
          roughness: 0.15,
          clearcoat: 0.9,
          clearcoatRoughness: 0.1,
          reflectivity: 0.8,
          emissive: color,
          emissiveIntensity: 0.05,
          transparent: true,
          opacity: 0.95,
          envMap: envMapRef.current,
          envMapIntensity: 0.8,
          ior: 1.5
        });
      } else {
        // Matte rubber look
        material = new THREE.MeshPhysicalMaterial({
          color: color.clone().multiplyScalar(0.5),
          metalness: 0.05,
          roughness: 0.35,
          clearcoat: 0.4,
          clearcoatRoughness: 0.3,
          reflectivity: 0.4,
          sheen: 0.3,
          sheenRoughness: 0.5,
          sheenColor: color.clone().multiplyScalar(0.3),
          emissive: color,
          emissiveIntensity: 0.03,
          transparent: true,
          opacity: 0.98,
          envMap: envMapRef.current,
          envMapIntensity: 0.4
        });
      }

      const mesh = new THREE.Mesh(geometry, material);
      filamentsGroupRef.current.add(mesh);

      const basePositions = new Float32Array(geometry.attributes.position.array);

      filamentsRef.current.push({
        mesh,
        basePositions,
        velocity: new THREE.Vector3(0, 0, 0), // No drift velocity - stay anchored
        angularVelocity: new THREE.Vector3(
          (Math.random() - 0.5) * 0.003,
          (Math.random() - 0.5) * 0.003,
          (Math.random() - 0.5) * 0.002
        ),
        spawnTime: timeRef.current,
        lifespan: 12 + Math.random() * 10,
        floatPhase: Math.random() * Math.PI * 2,
        floatSpeed: 0.3 + Math.random() * 0.3
      });
    };
    
    // Spawn many initial filaments immediately
    for (let i = 0; i < 30; i++) {
      setTimeout(() => spawnFilament(), i * 30);
    }

    const animate = () => {
      timeRef.current += 0.016;
      const time = timeRef.current;

      if (faceGroupRef.current && filamentsGroupRef.current && sceneRef.current && cameraRef.current && rendererRef.current) {
        const { bass, treble, volume, mid } = audioData;

        // === SNARE/ACCENT DETECTION ===
        // Snare hits have strong mid-high frequencies with sudden transients
        const high = treble;
        const snareRange = mid * 0.6 + high * 0.4; // Snare frequency range
        
        // Detect transient (sudden increase)
        const midDelta = snareRange - prevMidRef.current;
        const highDelta = high - prevHighRef.current;
        prevMidRef.current = snareRange * 0.3 + prevMidRef.current * 0.7; // Smooth
        prevHighRef.current = high * 0.3 + prevHighRef.current * 0.7;
        
        // Beat detection - only trigger on sharp transients
        const transientThreshold = 0.15;
        const minBeatInterval = 0.12; // Minimum time between beats (prevents double triggers)
        const timeSinceLastBeat = time - lastBeatTimeRef.current;
        
        // Decay beat intensity
        beatIntensityRef.current *= 0.88;
        beatCooldownRef.current = Math.max(0, beatCooldownRef.current - 0.016);
        
        // Detect snare/accent hit
        if (midDelta > transientThreshold && timeSinceLastBeat > minBeatInterval && beatCooldownRef.current <= 0) {
          beatIntensityRef.current = Math.min(1.0, midDelta * 3); // Intensity based on transient strength
          lastBeatTimeRef.current = time;
          beatCooldownRef.current = 0.08; // Brief cooldown
        }
        
        const beatHit = beatIntensityRef.current;

        // === SPAWN FILAMENTS (very frequent) ===
        const timeSinceLastSpawn = time - lastSpawnTimeRef.current;
        const minSpawnInterval = 0.04; // Very fast spawn rate
        const maxFilaments = 80;

        // Spawn constantly + extra on beats
        const shouldSpawnOnBeat = beatHit > 0.1 && timeSinceLastSpawn > minSpawnInterval;
        const shouldSpawnPeriodic = timeSinceLastSpawn > 0.12;
        
        if ((shouldSpawnOnBeat || shouldSpawnPeriodic) && filamentsRef.current.length < maxFilaments) {
          const spawnCount = shouldSpawnOnBeat ? Math.floor(4 + beatHit * 5) : 3;
          for (let i = 0; i < spawnCount; i++) {
            spawnFilament();
          }
          lastSpawnTimeRef.current = time;
        }

        // === RHYTHM-BASED FACE MOVEMENT (teleport to various positions) ===
        const timeSinceTeleport = time - lastTeleportTimeRef.current;
        
        // Teleport on strong beats - quantum/glitch style
        if (beatHit > 0.45 && timeSinceTeleport > 0.5) {
          // Pick a new random position - face stays in background area
          teleportTargetRef.current = {
            x: (Math.random() - 0.5) * 2.8,
            y: (Math.random() - 0.5) * 1.8,
            z: -1.5 + Math.random() * 0.4 // Stay in background
          };
          lastTeleportTimeRef.current = time;
          glitchIntensityRef.current = beatHit * 1.2;
          
          // Instant partial jump (glitch effect)
          const jumpFactor = 0.7;
          faceGroupRef.current.position.x = faceGroupRef.current.position.x * (1 - jumpFactor) + teleportTargetRef.current.x * jumpFactor;
          faceGroupRef.current.position.y = faceGroupRef.current.position.y * (1 - jumpFactor) + teleportTargetRef.current.y * jumpFactor;
        }
        
        // Smooth movement toward target with momentum
        const moveSpeed = 0.06 + beatHit * 0.1;
        const currentX = faceGroupRef.current.position.x;
        const currentY = faceGroupRef.current.position.y;
        const currentZ = faceGroupRef.current.position.z;
        
        faceGroupRef.current.position.x += (teleportTargetRef.current.x - currentX) * moveSpeed;
        faceGroupRef.current.position.y += (teleportTargetRef.current.y - currentY) * moveSpeed;
        faceGroupRef.current.position.z += (teleportTargetRef.current.z - currentZ) * moveSpeed * 0.3;
        
        // Subtle organic sway
        const swayX = Math.sin(time * 0.6) * 0.04;
        const swayY = Math.cos(time * 0.5) * 0.025;
        faceGroupRef.current.position.x += swayX;
        faceGroupRef.current.position.y += swayY;
        
        // Decay glitch
        glitchIntensityRef.current *= 0.92;
        
        // Scale with beat reaction - subtle breathing
        const breathBase = 0.85 + Math.sin(time * 1.2) * 0.015;
        const breathScale = breathBase + beatHit * 0.08 + bass * 0.03;
        faceGroupRef.current.scale.set(breathScale, breathScale * 1.02, breathScale);
        
        // Keep face frontal - very minimal rotation
        faceGroupRef.current.rotation.y = Math.sin(time * 0.25) * 0.02;
        faceGroupRef.current.rotation.x = Math.sin(time * 0.2) * 0.015 + beatHit * 0.015;
        faceGroupRef.current.rotation.z = Math.sin(time * 0.15) * 0.01;

        // === FILAMENT PHYSICS ===
        const filamentsToRemove: FilamentData[] = [];

        filamentsRef.current.forEach((filament) => {
          const age = time - filament.spawnTime;
          const lifeProgress = age / filament.lifespan;

          const mat = filament.mesh.material as THREE.MeshPhysicalMaterial;
          
          // Liquid forming effect - scale animation instead of fade
          const formDuration = 0.15;
          const dissolveDuration = 0.15;
          
          if (lifeProgress < formDuration) {
            // Liquid forming: start thin, expand to full size
            const formProgress = lifeProgress / formDuration;
            const easeOut = 1 - Math.pow(1 - formProgress, 3); // Cubic ease out
            filament.mesh.scale.x = 0.1 + easeOut * 0.9;
            filament.mesh.scale.z = 0.1 + easeOut * 0.9;
            mat.opacity = 0.7 + formProgress * 0.3; // Start semi-visible
          } else if (lifeProgress > (1 - dissolveDuration)) {
            // Dissolve: shrink and fade
            const dissolveProgress = (lifeProgress - (1 - dissolveDuration)) / dissolveDuration;
            const shrink = 1 - dissolveProgress * 0.8;
            filament.mesh.scale.x = shrink;
            filament.mesh.scale.z = shrink;
            mat.opacity = (1 - dissolveProgress) * 1.0;
          } else {
            // Full form - solid rubber texture
            filament.mesh.scale.x = 1;
            filament.mesh.scale.z = 1;
            mat.opacity = 1.0;
          }

          if (lifeProgress >= 1) {
            filamentsToRemove.push(filament);
            return;
          }

          // More dynamic swaying - reacts to audio
          const baseSwayX = Math.sin(time * filament.floatSpeed * 0.6 + filament.floatPhase) * 0.06;
          const baseSwayZ = Math.cos(time * filament.floatSpeed * 0.5 + filament.floatPhase) * 0.05;
          
          // Add beat-reactive displacement
          const beatSwayX = beatHit * Math.sin(time * 15 + filament.floatPhase) * 0.12;
          const beatSwayZ = beatHit * Math.cos(time * 12 + filament.floatPhase) * 0.08;

          // Position with beat influence
          filament.mesh.position.x = baseSwayX + beatSwayX;
          filament.mesh.position.y = beatHit * Math.sin(time * 20) * 0.05;
          filament.mesh.position.z = baseSwayZ + beatSwayZ;

          // More dramatic rotation on beats
          const rotMultiplier = 1 + beatHit * 3;
          filament.mesh.rotation.x = Math.sin(time * 0.4 + filament.floatPhase) * 0.06 * rotMultiplier;
          filament.mesh.rotation.y = Math.sin(time * 0.3 + filament.floatPhase) * 0.05 * rotMultiplier;
          filament.mesh.rotation.z = Math.sin(time * 0.35 + filament.floatPhase) * 0.04 * rotMultiplier;

          // BEAT = Strong reaction on snare/accents
          const beatReaction = beatHit;
          const vibFreq = 30; // Fast vibration frequency

          // More dramatic scale pulsing
          filament.mesh.scale.y = 1 + beatReaction * 0.25 + bass * 0.08;
          filament.mesh.scale.x = 1 + beatReaction * 0.15 + treble * 0.05;

          // Geometry deformation - calm normally, intense on beats
          const positions = filament.mesh.geometry.attributes.position.array as Float32Array;
          const basePositions = filament.basePositions;

          for (let i = 0; i < positions.length; i += 3) {
            const baseX = basePositions[i];
            const baseY = basePositions[i + 1];
            const baseZ = basePositions[i + 2];

            // Gentle wave (always present, subtle)
            const gentleWaveX = Math.sin(time * 0.8 + baseY * 0.5 + filament.floatPhase) * 0.015;
            const gentleWaveZ = Math.cos(time * 0.6 + baseY * 0.4 + filament.floatPhase) * 0.012;

            // Beat-triggered vibration (intense but brief)
            const beatVibX = Math.sin(time * vibFreq + i * 0.1) * beatReaction * 0.3;
            const beatVibZ = Math.cos(time * vibFreq * 1.1 + i * 0.08) * beatReaction * 0.25;

            // Apply deformations while keeping ends anchored
            const anchorFactor = 1 - Math.pow(Math.abs(baseY) / 7, 2);
            
            positions[i] = baseX + (gentleWaveX + beatVibX) * anchorFactor;
            positions[i + 1] = baseY; // Keep Y stable
            positions[i + 2] = baseZ + (gentleWaveZ + beatVibZ) * anchorFactor;
          }

          filament.mesh.geometry.attributes.position.needsUpdate = true;
          // Emissive reacts to beats
          mat.emissiveIntensity = 0.08 + beatReaction * 0.4;
        });

        // Remove expired filaments
        filamentsToRemove.forEach((filament) => {
          filamentsGroupRef.current?.remove(filament.mesh);
          filament.mesh.geometry.dispose();
          (filament.mesh.material as THREE.Material).dispose();
          const idx = filamentsRef.current.indexOf(filament);
          if (idx > -1) filamentsRef.current.splice(idx, 1);
        });

        // Limit max filaments
        while (filamentsRef.current.length > 60) {
          const oldest = filamentsRef.current.shift();
          if (oldest) {
            filamentsGroupRef.current?.remove(oldest.mesh);
            oldest.mesh.geometry.dispose();
            (oldest.mesh.material as THREE.Material).dispose();
          }
        }

        // Particles - subtle, react on beats
        if (particlesRef.current) {
          const pMat = particlesRef.current.material as THREE.PointsMaterial;
          pMat.opacity = 0.1 + beatHit * 0.5; // Only visible on beats

          const positions = particlesRef.current.geometry.attributes.position.array as Float32Array;
          for (let i = 0; i < positions.length; i += 3) {
            // Slow drift normally, burst on beats
            positions[i] += (Math.random() - 0.5) * (0.01 + beatHit * 0.08);
            positions[i + 1] += (Math.random() - 0.5) * (0.01 + beatHit * 0.1);
            positions[i + 2] += (Math.random() - 0.5) * 0.005;

            // Boundary reset
            if (Math.abs(positions[i]) > 3.5) positions[i] = (Math.random() - 0.5) * 5;
            if (Math.abs(positions[i + 1]) > 3) positions[i + 1] = (Math.random() - 0.5) * 4;
            if (positions[i + 2] > 3.5 || positions[i + 2] < 0) positions[i + 2] = Math.random() * 2 + 0.5;
          }
          particlesRef.current.geometry.attributes.position.needsUpdate = true;
        }

        rendererRef.current.render(sceneRef.current, cameraRef.current);
      }

      animationIdRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationIdRef.current);
    };
  }, [isActive, audioData, textures]);

  return <div data-ev-id="ev_ea2efb6984" ref={containerRef} className="w-full h-full bg-black" />;
}
