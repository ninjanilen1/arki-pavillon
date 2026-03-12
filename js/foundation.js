import * as THREE from 'three';
import { SOKKEL_LENGTH, SOKKEL_WIDTH, SOKKEL_HEIGHT, FLOOR_Y, FACADE_LENGTH, GABLE_WIDTH } from './constants.js';
import { concreteMat, floorMat } from './materials.js';

export function createFoundation() {
  const group = new THREE.Group();

  // Concrete sokkel
  const sokkelGeo = new THREE.BoxGeometry(SOKKEL_LENGTH, SOKKEL_HEIGHT, SOKKEL_WIDTH);
  const sokkel = new THREE.Mesh(sokkelGeo, concreteMat);
  sokkel.position.set(0, SOKKEL_HEIGHT / 2, 0);
  group.add(sokkel);

  // Interior floor surface
  const floorGeo = new THREE.PlaneGeometry(FACADE_LENGTH, GABLE_WIDTH);
  const floor = new THREE.Mesh(floorGeo, floorMat);
  floor.rotation.x = -Math.PI / 2;
  floor.position.set(0, FLOOR_Y + 0.001, 0);
  group.add(floor);

  return group;
}
