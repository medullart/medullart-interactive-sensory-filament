import * as THREE from 'three';

// Generate procedural normal map using Perlin-like noise
export function generateNormalMap(size: number = 256): THREE.DataTexture {
  const data = new Uint8Array(size * size * 4);
  
  // Simple noise function
  const noise = (x: number, y: number, seed: number = 0): number => {
    const n = Math.sin(x * 12.9898 + y * 78.233 + seed) * 43758.5453;
    return n - Math.floor(n);
  };

  // Fractal noise for more detail
  const fractalNoise = (x: number, y: number, octaves: number = 4): number => {
    let value = 0;
    let amplitude = 1;
    let frequency = 1;
    let maxValue = 0;

    for (let i = 0; i < octaves; i++) {
      value += noise(x * frequency, y * frequency, i * 100) * amplitude;
      maxValue += amplitude;
      amplitude *= 0.5;
      frequency *= 2;
    }

    return value / maxValue;
  };

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const i = (y * size + x) * 4;
      
      // Calculate normal from height differences
      const scale = 0.05;
      const heightL = fractalNoise((x - 1) * scale, y * scale);
      const heightR = fractalNoise((x + 1) * scale, y * scale);
      const heightU = fractalNoise(x * scale, (y - 1) * scale);
      const heightD = fractalNoise(x * scale, (y + 1) * scale);
      
      // Normal calculation
      const nx = (heightL - heightR) * 2;
      const ny = (heightU - heightD) * 2;
      const nz = 1;
      
      // Normalize
      const len = Math.sqrt(nx * nx + ny * ny + nz * nz);
      
      // Convert to 0-255 range (normal map encoding)
      data[i] = Math.floor(((nx / len) * 0.5 + 0.5) * 255);
      data[i + 1] = Math.floor(((ny / len) * 0.5 + 0.5) * 255);
      data[i + 2] = Math.floor(((nz / len) * 0.5 + 0.5) * 255);
      data[i + 3] = 255;
    }
  }

  const texture = new THREE.DataTexture(data, size, size, THREE.RGBAFormat);
  texture.needsUpdate = true;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  
  return texture;
}

// Generate displacement map
export function generateDisplacementMap(size: number = 256): THREE.DataTexture {
  const data = new Uint8Array(size * size * 4);
  
  const noise = (x: number, y: number, seed: number = 0): number => {
    const n = Math.sin(x * 12.9898 + y * 78.233 + seed) * 43758.5453;
    return n - Math.floor(n);
  };

  const fractalNoise = (x: number, y: number, octaves: number = 3): number => {
    let value = 0;
    let amplitude = 1;
    let frequency = 1;
    let maxValue = 0;

    for (let i = 0; i < octaves; i++) {
      value += noise(x * frequency, y * frequency, i * 50) * amplitude;
      maxValue += amplitude;
      amplitude *= 0.6;
      frequency *= 2.2;
    }

    return value / maxValue;
  };

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const i = (y * size + x) * 4;
      const scale = 0.03;
      const value = Math.floor(fractalNoise(x * scale, y * scale) * 255);
      
      data[i] = value;
      data[i + 1] = value;
      data[i + 2] = value;
      data[i + 3] = 255;
    }
  }

  const texture = new THREE.DataTexture(data, size, size, THREE.RGBAFormat);
  texture.needsUpdate = true;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  
  return texture;
}

// Generate roughness map with porosity
export function generateRoughnessMap(size: number = 256): THREE.DataTexture {
  const data = new Uint8Array(size * size * 4);
  
  const noise = (x: number, y: number, seed: number = 0): number => {
    const n = Math.sin(x * 12.9898 + y * 78.233 + seed) * 43758.5453;
    return n - Math.floor(n);
  };

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const i = (y * size + x) * 4;
      
      // Base roughness with porous spots
      const baseRoughness = 0.4;
      const noiseValue = noise(x * 0.1, y * 0.1);
      const pores = noise(x * 0.5, y * 0.5) > 0.8 ? 0.3 : 0;
      
      const roughness = Math.min(1, baseRoughness + noiseValue * 0.3 + pores);
      const value = Math.floor(roughness * 255);
      
      data[i] = value;
      data[i + 1] = value;
      data[i + 2] = value;
      data[i + 3] = 255;
    }
  }

  const texture = new THREE.DataTexture(data, size, size, THREE.RGBAFormat);
  texture.needsUpdate = true;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  
  return texture;
}
