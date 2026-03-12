import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { groundMat } from './materials.js';
import { createFoundation } from './foundation.js';
import { createFrame } from './frame.js';
import { createWalls } from './walls.js';
import { createWindows } from './windows.js';
import { createRoof } from './roof.js';
import { createTerrace } from './terrace.js';

// Renderer
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.0;
document.body.appendChild(renderer.domElement);

// Scene
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xd0e8f0);

// Camera
const camera = new THREE.PerspectiveCamera(
  50, window.innerWidth / window.innerHeight, 0.1, 200
);
camera.position.set(-10, 6, 12);

// Controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, 1.5, 0);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.maxPolarAngle = Math.PI / 2.05;
controls.update();

// Lighting
const ambient = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambient);

const sun = new THREE.DirectionalLight(0xffffff, 1.2);
sun.position.set(6, 12, 8);
sun.castShadow = true;
sun.shadow.mapSize.set(2048, 2048);
sun.shadow.camera.left = -12;
sun.shadow.camera.right = 12;
sun.shadow.camera.top = 10;
sun.shadow.camera.bottom = -10;
sun.shadow.camera.near = 0.5;
sun.shadow.camera.far = 30;
sun.shadow.bias = -0.001;
scene.add(sun);

const fill = new THREE.DirectionalLight(0xffffff, 0.3);
fill.position.set(-6, 4, -6);
scene.add(fill);

// Ground plane
const groundGeo = new THREE.PlaneGeometry(40, 40);
const ground = new THREE.Mesh(groundGeo, groundMat);
ground.rotation.x = -Math.PI / 2;
ground.receiveShadow = true;
scene.add(ground);

// Build pavilion
const pavilion = new THREE.Group();
pavilion.add(createFoundation());
pavilion.add(createFrame());
pavilion.add(createWalls());
pavilion.add(createWindows());
pavilion.add(createRoof());
pavilion.add(createTerrace());
scene.add(pavilion);

// Enable shadows on all meshes in pavilion
pavilion.traverse((child) => {
  if (child.isMesh) {
    child.castShadow = true;
    child.receiveShadow = true;
  }
});

// Animation loop
function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}
animate();

// Resize
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
