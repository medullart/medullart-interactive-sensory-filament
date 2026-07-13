import { useRef, useEffect } from 'react';
import * as THREE from 'three';
import type { KeyEvent } from '@/hooks/useKeyboardInput';

interface ChromaticParticlesProps {
  lastKeyEvent: KeyEvent | null;
  scene: THREE.Scene | null;
}

interface Particle {
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  color: THREE.Color;
  life: number;
  maxLife: number;
}

const CHROMATIC_COLORS = [
  0x00ffff, // Cyan
  0xff00ff, // Magenta
  0x00ff88, // Digital green
  0x88ffff, // Light cyan
  0xff88ff, // Light magenta
];

function useChromaParticles(
  scene: THREE.Scene | null,
  lastKeyEvent: KeyEvent | null
) {
  const particlesRef = useRef<Particle[]>([]);
  const pointsRef = useRef<THREE.Points | null>(null);
  const geometryRef = useRef<THREE.BufferGeometry | null>(null);

  useEffect(() => {
    if (!scene) return;

    const geometry = new THREE.BufferGeometry();
    const maxParticles = 100;
    
    const positions = new Float32Array(maxParticles * 3);
    const colors = new Float32Array(maxParticles * 3);
    const sizes = new Float32Array(maxParticles);

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

    const material = new THREE.PointsMaterial({
      size: 0.08,
      vertexColors: true,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending,
      sizeAttenuation: true,
    });

    const points = new THREE.Points(geometry, material);
    scene.add(points);
    pointsRef.current = points;
    geometryRef.current = geometry;

    return () => {
      scene.remove(points);
      geometry.dispose();
      material.dispose();
    };
  }, [scene]);

  // Spawn particles on key press
  useEffect(() => {
    if (!lastKeyEvent || !geometryRef.current) return;

    const color = new THREE.Color(CHROMATIC_COLORS[Math.floor(Math.random() * CHROMATIC_COLORS.length)]);
    
    // Spawn 3-5 particles per keystroke
    const count = 3 + Math.floor(Math.random() * 3);
    for (let i = 0; i < count; i++) {
      particlesRef.current.push({
        position: new THREE.Vector3(
          (Math.random() - 0.5) * 0.3,
          (Math.random() - 0.5) * 0.5,
          0.1
        ),
        velocity: new THREE.Vector3(
          (Math.random() - 0.5) * 0.1,
          (Math.random() - 0.5) * 0.1 + 0.05,
          (Math.random() - 0.5) * 0.05
        ),
        color,
        life: 1.0,
        maxLife: 0.3 + Math.random() * 0.2,
      });
    }

    // Limit particle count
    if (particlesRef.current.length > 100) {
      particlesRef.current = particlesRef.current.slice(-100);
    }
  }, [lastKeyEvent]);

  // Update particles
  useEffect(() => {
    if (!geometryRef.current) return;

    const updateParticles = () => {
      const positions = geometryRef.current!.attributes.position.array as Float32Array;
      const colors = geometryRef.current!.attributes.color.array as Float32Array;
      const sizes = geometryRef.current!.attributes.size.array as Float32Array;

      // Update existing particles
      particlesRef.current = particlesRef.current.filter(p => p.life > 0);
      
      particlesRef.current.forEach((p, i) => {
        if (i >= 100) return;

        p.position.add(p.velocity);
        p.velocity.y -= 0.002; // Gravity
        p.life -= 0.016 / p.maxLife;

        positions[i * 3] = p.position.x;
        positions[i * 3 + 1] = p.position.y;
        positions[i * 3 + 2] = p.position.z;

        colors[i * 3] = p.color.r * p.life;
        colors[i * 3 + 1] = p.color.g * p.life;
        colors[i * 3 + 2] = p.color.b * p.life;

        sizes[i] = 0.1 * p.life;
      });

      // Zero out unused slots
      for (let i = particlesRef.current.length; i < 100; i++) {
        positions[i * 3] = 0;
        positions[i * 3 + 1] = -1000;
        positions[i * 3 + 2] = 0;
        sizes[i] = 0;
      }

      geometryRef.current!.attributes.position.needsUpdate = true;
      geometryRef.current!.attributes.color.needsUpdate = true;
      geometryRef.current!.attributes.size.needsUpdate = true;
    };

    const interval = setInterval(updateParticles, 16);
    return () => clearInterval(interval);
  }, []);
}

export function ChromaticParticles({ lastKeyEvent, scene }: ChromaticParticlesProps) {
  useChromaParticles(scene, lastKeyEvent);
  return null;
}
