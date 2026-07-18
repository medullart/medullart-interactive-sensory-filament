import { useRef, useEffect, useMemo } from 'react';
import * as THREE from 'three';
import type { KeyEvent, SentimentScore, CharOffset } from '@/hooks/useKeyboardInput';
import type { AudioData } from '@/hooks/useAudioAnalyzer';

interface FilamentCanvasProps {
  nodeCount: number;
  curvature: number;
  lastKeyEvent: KeyEvent | null;
  sentiment: SentimentScore;
  audioData: AudioData;
  mousePosition: {x: number;y: number;};
  charOffsets: CharOffset[];
  isClicking: boolean;
  clickIntensity: number;
  enterVibration: number;
  textLength: number;
  enterPressed: boolean;
  onFilamentDrag?: () => void;
}

// Chromatic colors for light emission
const CHROMATIC_COLORS = [
  0x00ffff, // Cyan
  0xff00ff, // Magenta
  0x00ff88  // Digital green
];

interface Spark {
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  color: THREE.Color;
  life: number;
}

export function FilamentCanvas({
  nodeCount,
  curvature,
  lastKeyEvent,
  sentiment,
  audioData,
  mousePosition,
  charOffsets,
  isClicking,
  clickIntensity,
  enterVibration,
  textLength,
  enterPressed,
  onFilamentDrag
}: FilamentCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const filamentLineRef = useRef<THREE.Line | null>(null);
  const filamentTubeRef = useRef<THREE.Mesh | null>(null);
  const tubeMaterialRef = useRef<THREE.MeshPhysicalMaterial | null>(null);
  const rotationRef = useRef(0);
  const targetRotationRef = useRef(0);
  const timeRef = useRef(0);
  const animationIdRef = useRef<number>(0);
  const vibrationRef = useRef(0);
  const enterVibrationRef = useRef(0);
  const mouseInfluenceRef = useRef({ x: 0, y: 0 });
  const is3DModeRef = useRef(false);
  const mode3DIntensityRef = useRef(0);
  const typingWaveRef = useRef(0);
  const lastTextLengthRef = useRef(0);

  // Particle system refs
  const sparksRef = useRef<Spark[]>([]);
  const sparkPointsRef = useRef<THREE.Points | null>(null);
  const lastKeyTimestampRef = useRef(0);

  // Drag detection refs
  const isDraggingRef = useRef(false);
  const dragStartRef = useRef({ x: 0, y: 0 });
  const dragDistanceRef = useRef(0);

  // Drag detection for opening world view
  useEffect(() => {
    const handleMouseDown = (e: MouseEvent) => {
      isDraggingRef.current = true;
      dragStartRef.current = { x: e.clientX, y: e.clientY };
      dragDistanceRef.current = 0;
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (isDraggingRef.current) {
        const dx = e.clientX - dragStartRef.current.x;
        const dy = e.clientY - dragStartRef.current.y;
        dragDistanceRef.current = Math.sqrt(dx * dx + dy * dy);
      }
    };

    const handleMouseUp = () => {
      if (isDraggingRef.current && dragDistanceRef.current > 100) {
        // Dragged far enough - trigger world view
        onFilamentDrag?.();
      }
      isDraggingRef.current = false;
      dragDistanceRef.current = 0;
    };

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        isDraggingRef.current = true;
        dragStartRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
        dragDistanceRef.current = 0;
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (isDraggingRef.current && e.touches.length > 0) {
        const dx = e.touches[0].clientX - dragStartRef.current.x;
        const dy = e.touches[0].clientY - dragStartRef.current.y;
        dragDistanceRef.current = Math.sqrt(dx * dx + dy * dy);
      }
    };

    const handleTouchEnd = () => {
      if (isDraggingRef.current && dragDistanceRef.current > 100) {
        onFilamentDrag?.();
      }
      isDraggingRef.current = false;
      dragDistanceRef.current = 0;
    };

    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('touchstart', handleTouchStart);
    window.addEventListener('touchmove', handleTouchMove);
    window.addEventListener('touchend', handleTouchEnd);

    return () => {
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [onFilamentDrag]);

  // Memoize color based on sentiment or enterPressed (pink)
  const filamentColor = useMemo(() => {
    if (enterPressed) {
      return new THREE.Color(0xff1493);
    }
    
    if (sentiment.type === 'chaos') {
      return new THREE.Color().lerpColors(
        new THREE.Color(0xffffff),
        new THREE.Color(0xff3333),
        sentiment.intensity
      );
    } else if (sentiment.type === 'calm') {
      return new THREE.Color().lerpColors(
        new THREE.Color(0xffffff),
        new THREE.Color(0x33ffcc),
        sentiment.intensity
      );
    } else if (sentiment.type === 'love') {
      return new THREE.Color().lerpColors(
        new THREE.Color(0xffffff),
        new THREE.Color(0xff66b2),
        sentiment.intensity
      );
    } else if (sentiment.type === 'hate') {
      return new THREE.Color().lerpColors(
        new THREE.Color(0xffffff),
        new THREE.Color(0xff6633),
        sentiment.intensity
      );
    }
    return new THREE.Color(0xffffff);
  }, [sentiment, enterPressed]);

  // Initialize Three.js scene
  useEffect(() => {
    if (!containerRef.current) return;

    const width = window.innerWidth;
    const height = window.innerHeight;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);
    camera.position.z = 5;
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 0.9;
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // === LIGHTING for 3D mode - subtle and realistic ===
    const ambientLight = new THREE.AmbientLight(0x151520, 0.4);
    scene.add(ambientLight);

    const frontLight = new THREE.DirectionalLight(0xeeeeff, 0.5);
    frontLight.position.set(0, 0, 5);
    scene.add(frontLight);

    const blueRimLight = new THREE.PointLight(0x00aacc, 0.8, 12);
    blueRimLight.position.set(-3, 1, 2);
    scene.add(blueRimLight);

    const magentaRimLight = new THREE.PointLight(0xcc0088, 0.6, 12);
    magentaRimLight.position.set(3, -1, 2);
    scene.add(magentaRimLight);

    const topLight = new THREE.DirectionalLight(0x3366aa, 0.4);
    topLight.position.set(0, 5, 3);
    scene.add(topLight);

    // Subtle back rim for depth
    const backRimLight = new THREE.PointLight(0x222244, 0.5, 8);
    backRimLight.position.set(0, 0, -3);
    scene.add(backRimLight);

    // === LINE FILAMENT (2D mode) ===
    const lineGeometry = new THREE.BufferGeometry();
    const linePoints = new Float32Array(300);
    lineGeometry.setAttribute('position', new THREE.BufferAttribute(linePoints, 3));

    const lineMaterial = new THREE.LineBasicMaterial({
      color: 0xffffff,
      linewidth: 2
    });

    const filamentLine = new THREE.Line(lineGeometry, lineMaterial);
    scene.add(filamentLine);
    filamentLineRef.current = filamentLine;

    // === TUBE MATERIAL (3D mode - subtle rubber/latex look) ===
    const tubeMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xccccdd,
      metalness: 0.15,
      roughness: 0.35,
      clearcoat: 0.7,
      clearcoatRoughness: 0.2,
      reflectivity: 0.4,
      sheen: 0.5,
      sheenRoughness: 0.3,
      sheenColor: new THREE.Color(0x444466),
      emissive: 0x111122,
      emissiveIntensity: 0.15,
      transparent: true,
      opacity: 1
    });
    tubeMaterialRef.current = tubeMaterial;

    // Create initial tube (will be updated in animation) - extends beyond screen
    const initialCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, -6, 0),
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(0, 6, 0)
    ]);
    const tubeGeometry = new THREE.TubeGeometry(initialCurve, 100, 0.10, 20, false);
    const filamentTube = new THREE.Mesh(tubeGeometry, tubeMaterial);
    filamentTube.visible = false;
    scene.add(filamentTube);
    filamentTubeRef.current = filamentTube;

    // === SPARK PARTICLES ===
    const sparkGeometry = new THREE.BufferGeometry();
    const maxSparks = 50;
    const sparkPositions = new Float32Array(maxSparks * 3);
    const sparkColors = new Float32Array(maxSparks * 3);
    const sparkSizes = new Float32Array(maxSparks);

    sparkGeometry.setAttribute('position', new THREE.BufferAttribute(sparkPositions, 3));
    sparkGeometry.setAttribute('color', new THREE.BufferAttribute(sparkColors, 3));
    sparkGeometry.setAttribute('size', new THREE.BufferAttribute(sparkSizes, 1));

    const sparkMaterial = new THREE.PointsMaterial({
      size: 0.1,
      vertexColors: true,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending,
      sizeAttenuation: true
    });

    const sparkPoints = new THREE.Points(sparkGeometry, sparkMaterial);
    scene.add(sparkPoints);
    sparkPointsRef.current = sparkPoints;

    const handleResize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    const container = containerRef.current;
    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationIdRef.current);
      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
      lineGeometry.dispose();
      lineMaterial.dispose();
      tubeGeometry.dispose();
      tubeMaterial.dispose();
      sparkGeometry.dispose();
      sparkMaterial.dispose();
    };
  }, []);

  // Handle click vibration and 3D mode
  useEffect(() => {
    if (isClicking) {
      vibrationRef.current = clickIntensity;
      is3DModeRef.current = true;
      mode3DIntensityRef.current = 1;
    }
  }, [isClicking, clickIntensity]);

  // Handle enter vibration
  useEffect(() => {
    if (enterVibration > 0) {
      enterVibrationRef.current = enterVibration;
    }
  }, [enterVibration]);

  // Spawn sparks on key press
  useEffect(() => {
    if (lastKeyEvent && lastKeyEvent.timestamp !== lastKeyTimestampRef.current) {
      lastKeyTimestampRef.current = lastKeyEvent.timestamp;

      const count = 3 + Math.floor(Math.random() * 3);
      for (let i = 0; i < count; i++) {
        const colorHex = CHROMATIC_COLORS[Math.floor(Math.random() * CHROMATIC_COLORS.length)];
        sparksRef.current.push({
          position: new THREE.Vector3(
            (Math.random() - 0.5) * 0.5,
            (Math.random() - 0.5) * 1.0,
            0.1
          ),
          velocity: new THREE.Vector3(
            (Math.random() - 0.5) * 0.15,
            Math.random() * 0.1 + 0.05,
            (Math.random() - 0.5) * 0.05
          ),
          color: new THREE.Color(colorHex),
          life: 1.0
        });
      }

      if (sparksRef.current.length > 50) {
        sparksRef.current = sparksRef.current.slice(-50);
      }
    }
  }, [lastKeyEvent]);

  // Handle key rotation and typing waves
  useEffect(() => {
    if (lastKeyEvent) {
      const rotationAmount = lastKeyEvent.charCode / 2 * (Math.PI / 180);
      targetRotationRef.current += rotationAmount;
      // Trigger typing wave
      typingWaveRef.current = 1.0;
    }
  }, [lastKeyEvent]);

  // Track text length changes for wave effect
  useEffect(() => {
    if (textLength !== lastTextLengthRef.current) {
      typingWaveRef.current = Math.max(typingWaveRef.current, 0.8);
      lastTextLengthRef.current = textLength;
    }
  }, [textLength]);

  // Animation loop
  useEffect(() => {
    const animate = () => {
      timeRef.current += 0.016;

      // Smoothly interpolate mouse influence
      const targetMouseX = (mousePosition.x / window.innerWidth - 0.5) * 0.3;
      const targetMouseY = -(mousePosition.y / window.innerHeight - 0.5) * 0.3;
      mouseInfluenceRef.current.x += (targetMouseX - mouseInfluenceRef.current.x) * 0.05;
      mouseInfluenceRef.current.y += (targetMouseY - mouseInfluenceRef.current.y) * 0.05;

      // Decay vibration and typing wave
      vibrationRef.current *= 0.92;
      enterVibrationRef.current *= 0.97;
      typingWaveRef.current *= 0.94;
      
      // Decay 3D mode intensity
      mode3DIntensityRef.current *= 0.96;
      if (mode3DIntensityRef.current < 0.01) {
        is3DModeRef.current = false;
        mode3DIntensityRef.current = 0;
      }

      const scene = sceneRef.current;
      const camera = cameraRef.current;
      const renderer = rendererRef.current;
      const filamentLine = filamentLineRef.current;
      const filamentTube = filamentTubeRef.current;

      if (filamentLine && filamentTube && scene && camera && renderer) {
        const time = timeRef.current;
        const volume = audioData.volume;
        const bass = audioData.bass;
        const treble = audioData.treble;
        const vibration = vibrationRef.current;
        const enterVib = enterVibrationRef.current;
        const mouseX = mouseInfluenceRef.current.x;
        const mouseY = mouseInfluenceRef.current.y;
        const is3D = is3DModeRef.current;
        const mode3DIntensity = mode3DIntensityRef.current;

        rotationRef.current += (targetRotationRef.current - rotationRef.current) * 0.1;

        const segments = Math.max(20, Math.min(100, nodeCount * 5));
        const baseHorizontalSpan = 1.5;
        const textExtension = Math.min(textLength * 0.15, 3.5);
        const horizontalSpan = baseHorizontalSpan + textExtension;
        const typingWave = typingWaveRef.current;

        const speedFactor =
          sentiment.type === 'love' ? 4.0 :
          sentiment.type === 'hate' ? 0.15 :
          sentiment.type === 'calm' ? 0.3 :
          sentiment.type === 'chaos' ? 2.0 : 1.0;

        const vibrationIntensity =
          sentiment.type === 'love' ? 0.5 :
          sentiment.type === 'hate' ? 0.02 : 0.1;

        // Generate curve points
        const curvePoints: THREE.Vector3[] = [];
        const linePositions = filamentLine.geometry.attributes.position.array as Float32Array;

        // Extended vertical span to fill entire screen and beyond
        const verticalSpan = 12; // Much longer to extend past screen edges
        
        for (let i = 0; i < 100; i++) {
          const t = i / 99 * Math.PI * 2;
          const horizontalPos = (i / 99 - 0.5) * horizontalSpan * 2;
          const verticalPos = (i / 99 - 0.5) * verticalSpan;
          const segmentIndex = Math.floor(i / (100 / segments));
          const localCurvature = curvature * Math.sin(segmentIndex * 0.5);

          let charOffsetX = 0, charOffsetY = 0, charOffsetZ = 0;
          if (charOffsets.length > 0) {
            const charIndex = Math.floor(i / 100 * charOffsets.length);
            const offset = charOffsets[Math.min(charIndex, charOffsets.length - 1)];
            if (offset) {
              charOffsetX = Math.sin(time * offset.speed + offset.phase) * offset.x * vibrationIntensity;
              charOffsetY = Math.cos(time * offset.speed + offset.phase) * offset.y * vibrationIntensity;
              charOffsetZ = Math.sin(time * offset.speed * 0.7 + offset.phase) * offset.z * vibrationIntensity;
            }
          }

          // Mouse Y controls amplitude, Mouse X controls frequency/distortion
          const mouseYNorm = (mousePosition.y / window.innerHeight - 0.5);
          const mouseXNorm = (mousePosition.x / window.innerWidth - 0.5);
          const amplitudeMod = 1 + mouseYNorm * 0.8; // Y affects amplitude (smoother)
          const freqMod = 1 + mouseXNorm * 0.6; // X affects frequency (gentler)
          
          let x = Math.sin(t * freqMod + time * speedFactor * 0.3) * (0.25 + localCurvature * 0.15) * amplitudeMod + charOffsetX + horizontalPos * 0.3;
          let y = verticalPos + Math.sin(t * 2 * freqMod + time * speedFactor * 0.2) * (0.15 + bass * 0.3) * amplitudeMod + charOffsetY;
          let z = Math.cos(t * 3 * freqMod + time * speedFactor * 0.15) * 0.2 * amplitudeMod + charOffsetZ;

          // Smooth mouse influence - responsive but not jittery
          x += mouseX * (1 - Math.abs(verticalPos) / 3) * 0.6;
          y += mouseY * 0.4;
          
          // Subtle wave following mouse position (no trembling)
          const smoothWave = Math.sin(verticalPos * 1.5 + time * 0.3) * mouseXNorm * 0.15;
          x += smoothWave;

          // Click vibration - subtle
          if (vibration > 0.01) {
            const vibFreq = 20;
            x += Math.sin(time * vibFreq + i * 0.3) * vibration * 0.15;
            y += Math.cos(time * vibFreq * 1.2 + i * 0.2) * vibration * 0.1;
            z += Math.sin(time * vibFreq * 0.7 + i * 0.25) * vibration * 0.08;
          }

          // Enter vibration
          if (enterVib > 0.01) {
            const enterFreq = 35;
            const intensity = enterVib * 1.5;
            x += Math.sin(time * enterFreq + i * 0.7) * intensity * 0.5;
            y += Math.cos(time * enterFreq * 1.5 + i * 0.5) * intensity * 0.4;
            z += Math.sin(time * enterFreq * 1.2 + i * 0.6) * intensity * 0.3;
            x += Math.sin(time * 50 + i) * intensity * 0.2;
            y += Math.cos(time * 45 + i * 1.3) * intensity * 0.15;
          }

          // Typing wave effect - propagates along filament
          if (typingWave > 0.01) {
            const waveFreq = 15;
            const wavePropagation = verticalPos * 3 + time * 8;
            x += Math.sin(wavePropagation) * typingWave * 0.25;
            y += Math.cos(wavePropagation * 0.8) * typingWave * 0.15;
            z += Math.sin(wavePropagation * 1.2 + i * 0.1) * typingWave * 0.2;
            // Additional high-frequency ripple
            x += Math.sin(time * waveFreq + i * 0.3) * typingWave * 0.1;
            z += Math.cos(time * waveFreq * 1.1 + i * 0.25) * typingWave * 0.08;
          }

          // Bass waves
          x += Math.sin(verticalPos * 2 + time * 0.5) * bass * 0.5;

          // Treble noise
          const noiseFreq = 20;
          x += Math.sin(t * noiseFreq + time * 10) * treble * 0.1 * vibrationIntensity;
          y += Math.cos(t * noiseFreq + time * 12) * treble * 0.05 * vibrationIntensity;

          // Volume scale
          const scale = 1 + volume * 0.5;
          x *= scale;
          y *= scale;
          z *= scale;

          // Chaos deformation
          if (sentiment.type === 'chaos') {
            x += (Math.random() - 0.5) * sentiment.intensity * 0.2;
            y += (Math.random() - 0.5) * sentiment.intensity * 0.2;
          }

          linePositions[i * 3] = x;
          linePositions[i * 3 + 1] = y;
          linePositions[i * 3 + 2] = z;

          // Store for tube curve (sample every few points for smoother tube)
          if (i % 2 === 0) {
            curvePoints.push(new THREE.Vector3(x, y, z));
          }
        }

        filamentLine.geometry.attributes.position.needsUpdate = true;
        filamentLine.rotation.z = rotationRef.current;
        filamentLine.rotation.x = Math.sin(time * 0.3) * 0.2;

        // Update line material
        const lineMat = filamentLine.material as THREE.LineBasicMaterial;
        lineMat.color = filamentColor;
        lineMat.opacity = sentiment.type === 'chaos' ? 1 - sentiment.intensity * 0.3 : 1;
        lineMat.transparent = true;

        // Update tube for 3D mode
        if (is3D && curvePoints.length >= 3) {
          // Dispose old geometry
          filamentTube.geometry.dispose();
          
          // Create new tube from curve points
          const curve = new THREE.CatmullRomCurve3(curvePoints, false, 'catmullrom', 0.5);
          const tubeRadius = 0.04 + mode3DIntensity * 0.06;
          const newTubeGeometry = new THREE.TubeGeometry(curve, 100, tubeRadius, 16, false);
          filamentTube.geometry = newTubeGeometry;
          
          // Update tube material - subtle 3D look
          const tubeMat = tubeMaterialRef.current;
          if (tubeMat) {
            tubeMat.color = filamentColor.clone().multiplyScalar(0.85);
            tubeMat.emissive = filamentColor.clone().multiplyScalar(0.1);
            tubeMat.emissiveIntensity = 0.1 + mode3DIntensity * 0.15;
            tubeMat.opacity = mode3DIntensity * 0.95;
          }

          filamentTube.rotation.z = rotationRef.current;
          filamentTube.rotation.x = Math.sin(time * 0.3) * 0.2;
        }

        // Toggle visibility based on 3D mode
        filamentLine.visible = !is3D || mode3DIntensity < 0.5;
        filamentTube.visible = is3D && mode3DIntensity > 0.1;

        // Blend both for smooth transition
        if (is3D && mode3DIntensity > 0.1 && mode3DIntensity < 0.5) {
          filamentLine.visible = true;
          lineMat.opacity = 1 - mode3DIntensity;
        }

        // Update sparks
        if (sparkPointsRef.current) {
          const sparkGeometry = sparkPointsRef.current.geometry;
          const sparkPositions = sparkGeometry.attributes.position.array as Float32Array;
          const sparkColors = sparkGeometry.attributes.color.array as Float32Array;
          const sparkSizes = sparkGeometry.attributes.size.array as Float32Array;

          sparksRef.current = sparksRef.current.filter((s) => s.life > 0);

          sparksRef.current.forEach((spark, i) => {
            if (i >= 50) return;

            spark.position.add(spark.velocity);
            spark.velocity.y -= 0.003;
            spark.life -= 0.016 / 0.3;

            sparkPositions[i * 3] = spark.position.x;
            sparkPositions[i * 3 + 1] = spark.position.y;
            sparkPositions[i * 3 + 2] = spark.position.z;

            sparkColors[i * 3] = spark.color.r * spark.life;
            sparkColors[i * 3 + 1] = spark.color.g * spark.life;
            sparkColors[i * 3 + 2] = spark.color.b * spark.life;

            sparkSizes[i] = 0.15 * spark.life;
          });

          for (let i = sparksRef.current.length; i < 50; i++) {
            sparkPositions[i * 3 + 1] = -1000;
            sparkSizes[i] = 0;
          }

          sparkGeometry.attributes.position.needsUpdate = true;
          sparkGeometry.attributes.color.needsUpdate = true;
          sparkGeometry.attributes.size.needsUpdate = true;
        }

        renderer.render(scene, camera);
      }

      animationIdRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationIdRef.current);
    };
  }, [nodeCount, curvature, sentiment, audioData, mousePosition, filamentColor, charOffsets, textLength]);

  return <div data-ev-id="ev_dae79038c8" ref={containerRef} className="fixed inset-0 cursor-none" />;
}
