import * as THREE from 'three';

export const concreteMat = new THREE.MeshStandardMaterial({
  color: 0xa0a0a0, roughness: 0.9
});

export const timberMat = new THREE.MeshStandardMaterial({
  color: 0xc4956a, roughness: 0.7
});

export const claddingMat = new THREE.MeshStandardMaterial({
  color: 0x8b6d4a, roughness: 0.65
});

export const glassMat = new THREE.MeshStandardMaterial({
  color: 0x88ccee, transparent: true, opacity: 0.3,
  roughness: 0.05, metalness: 0.1, side: THREE.DoubleSide
});

export const glassFrameMat = new THREE.MeshStandardMaterial({
  color: 0x2a2a2a, roughness: 0.4
});

export const roofMat = new THREE.MeshStandardMaterial({
  color: 0x3a3a3a, roughness: 0.8, side: THREE.DoubleSide
});

export const terraceMat = new THREE.MeshStandardMaterial({
  color: 0xa07850, roughness: 0.75
});

export const windBraceMat = new THREE.MeshStandardMaterial({
  color: 0xe06020, roughness: 0.5
});

export const groundMat = new THREE.MeshStandardMaterial({
  color: 0x4a7a3a, roughness: 1.0
});

export const floorMat = new THREE.MeshStandardMaterial({
  color: 0xd4b896, roughness: 0.6
});
