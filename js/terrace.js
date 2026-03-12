import * as THREE from 'three';
import {
  FLOOR_Y, HALF_FACADE, HALF_GABLE, GABLE_WIDTH,
  TERRACE_DEPTH, TERRACE_HEIGHT
} from './constants.js';
import { terraceMat, concreteMat } from './materials.js';

export function createTerrace() {
  const group = new THREE.Group();

  const deckY = TERRACE_HEIGHT;
  const deckThickness = 0.04;
  const westEdge = -HALF_FACADE;

  // Deck surface
  const deckGeo = new THREE.BoxGeometry(TERRACE_DEPTH, deckThickness, GABLE_WIDTH + 0.4);
  const deck = new THREE.Mesh(deckGeo, terraceMat);
  deck.position.set(westEdge - TERRACE_DEPTH / 2, deckY - deckThickness / 2, 0);
  group.add(deck);

  // Deck boards visual (horizontal lines on top surface)
  const boardW = 0.12;
  const boardGap = 0.008;
  const boardStep = boardW + boardGap;
  for (let i = 0; i < Math.floor(TERRACE_DEPTH / boardStep); i++) {
    const bx = westEdge - 0.06 - i * boardStep;
    const boardGeo = new THREE.BoxGeometry(boardW, 0.002, GABLE_WIDTH + 0.4);
    const board = new THREE.Mesh(boardGeo, terraceMat);
    board.position.set(bx, deckY + 0.001, 0);
    group.add(board);
  }

  // Support posts (4 posts at corners of terrace)
  const postW = 0.09;
  const postH = deckY - deckThickness;
  const postGeo = new THREE.BoxGeometry(postW, postH, postW);

  const positions = [
    [westEdge - 0.1, postH / 2, -HALF_GABLE],
    [westEdge - 0.1, postH / 2, HALF_GABLE],
    [westEdge - TERRACE_DEPTH + 0.1, postH / 2, -HALF_GABLE],
    [westEdge - TERRACE_DEPTH + 0.1, postH / 2, HALF_GABLE],
    // Middle supports
    [westEdge - TERRACE_DEPTH / 2, postH / 2, -HALF_GABLE],
    [westEdge - TERRACE_DEPTH / 2, postH / 2, HALF_GABLE],
  ];

  for (const [x, y, z] of positions) {
    const p = new THREE.Mesh(postGeo, concreteMat);
    p.position.set(x, y, z);
    group.add(p);
  }

  // Support beam under deck (east-west)
  const supportBeamGeo = new THREE.BoxGeometry(TERRACE_DEPTH, 0.06, 0.06);
  const sb1 = new THREE.Mesh(supportBeamGeo, terraceMat);
  sb1.position.set(westEdge - TERRACE_DEPTH / 2, deckY - deckThickness - 0.03, -HALF_GABLE + 0.1);
  group.add(sb1);
  const sb2 = new THREE.Mesh(supportBeamGeo, terraceMat);
  sb2.position.set(westEdge - TERRACE_DEPTH / 2, deckY - deckThickness - 0.03, HALF_GABLE - 0.1);
  group.add(sb2);

  return group;
}
