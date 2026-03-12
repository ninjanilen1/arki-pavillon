import * as THREE from 'three';
import {
  FLOOR_Y, HALF_FACADE, HALF_GABLE, FACADE_LENGTH, GABLE_WIDTH,
  H_SOUTH, H_NORTH_WEST, H_NORTH_EAST,
  CLAD_MODULE, CLAD_BOARD_W, CLAD_THICKNESS,
  northWallHeight,
  NORTH_PAN1_W, NORTH_PAN1_H, NORTH_PAN2_W, NORTH_PAN_BOTTOM_Y,
  NORTH_VERT_W, NORTH_VERT_H, NORTH_VERT_FROM_LEFT,
  NORTH_SQ_W, NORTH_SQ_H, NORTH_SQ_FROM_RIGHT
} from './constants.js';
import { claddingMat } from './materials.js';

// North wall window openings (x_center, y_bottom, width, height) relative to floor
function getNorthOpenings() {
  const W = -HALF_FACADE;
  return [
    // Panorama window 1 (left portion)
    { xMin: W + 0.2, xMax: W + 0.2 + NORTH_PAN1_W, yMin: NORTH_PAN_BOTTOM_Y, yMax: NORTH_PAN_BOTTOM_Y + NORTH_PAN1_H },
    // Panorama window 2 (right portion)
    { xMin: HALF_FACADE - 0.2 - NORTH_PAN2_W, xMax: HALF_FACADE - 0.2, yMin: NORTH_PAN_BOTTOM_Y, yMax: NORTH_PAN_BOTTOM_Y + NORTH_PAN1_H },
    // Vertical window
    { xMin: W + NORTH_VERT_FROM_LEFT - NORTH_VERT_W / 2, xMax: W + NORTH_VERT_FROM_LEFT + NORTH_VERT_W / 2, yMin: 0.4, yMax: 0.4 + NORTH_VERT_H },
    // Square windows
    { xMin: HALF_FACADE - NORTH_SQ_FROM_RIGHT - NORTH_SQ_W / 2, xMax: HALF_FACADE - NORTH_SQ_FROM_RIGHT + NORTH_SQ_W / 2, yMin: 1.2, yMax: 1.2 + NORTH_SQ_H },
    // Second square window (center area)
    { xMin: W + FACADE_LENGTH / 2 - NORTH_SQ_W / 2, xMax: W + FACADE_LENGTH / 2 + NORTH_SQ_W / 2, yMin: 1.2, yMax: 1.2 + NORTH_SQ_H },
  ];
}

function boardOverlapsOpening(bx, openings) {
  const bHalf = CLAD_BOARD_W / 2;
  const bMin = bx - bHalf;
  const bMax = bx + bHalf;
  const overlapping = [];
  for (const op of openings) {
    if (bMax > op.xMin && bMin < op.xMax) {
      overlapping.push(op);
    }
  }
  return overlapping;
}

export function createWalls() {
  const group = new THREE.Group();

  // --- North wall cladding ---
  const northZ = -HALF_GABLE - CLAD_THICKNESS / 2;
  const northOpenings = getNorthOpenings();

  for (let i = 0; i < Math.floor(FACADE_LENGTH / CLAD_MODULE); i++) {
    const bx = -HALF_FACADE + CLAD_MODULE / 2 + i * CLAD_MODULE;
    const wallH = northWallHeight(bx);
    const overlaps = boardOverlapsOpening(bx, northOpenings);

    if (overlaps.length === 0) {
      // Full-height board
      addBoard(group, bx, northZ, 0, wallH);
    } else {
      // Split board around openings
      let yBottom = 0;
      // Sort overlaps by yMin
      const sorted = overlaps.sort((a, b) => a.yMin - b.yMin);
      for (const op of sorted) {
        if (op.yMin > yBottom + 0.05) {
          addBoard(group, bx, northZ, yBottom, op.yMin);
        }
        yBottom = op.yMax;
      }
      if (wallH > yBottom + 0.05) {
        addBoard(group, bx, northZ, yBottom, wallH);
      }
    }
  }

  // --- West gable cladding ---
  const westX = -HALF_FACADE - CLAD_THICKNESS / 2;
  for (let i = 0; i < Math.floor(GABLE_WIDTH / CLAD_MODULE); i++) {
    const bz = -HALF_GABLE + CLAD_MODULE / 2 + i * CLAD_MODULE;
    const t = (bz + HALF_GABLE) / GABLE_WIDTH; // 0 at north, 1 at south
    const wallH = H_NORTH_WEST + t * (H_SOUTH - H_NORTH_WEST);
    addBoardZ(group, westX, bz, 0, wallH);
  }

  // --- East gable cladding (with trapezoidal window cutout) ---
  const eastX = HALF_FACADE + CLAD_THICKNESS / 2;
  const eastWinZmin = -HALF_GABLE + 0.335;
  const eastWinZmax = HALF_GABLE - 0.335;
  for (let i = 0; i < Math.floor(GABLE_WIDTH / CLAD_MODULE); i++) {
    const bz = -HALF_GABLE + CLAD_MODULE / 2 + i * CLAD_MODULE;
    const t = (bz + HALF_GABLE) / GABLE_WIDTH;
    const wallH = H_NORTH_EAST + t * (H_SOUTH - H_NORTH_EAST);
    // Check if board is in the trapezoidal window zone
    if (bz > eastWinZmin && bz < eastWinZmax) {
      // Window zone: boards below and above the window
      const winBottom = 0.8;
      const winTop = wallH - 0.4;
      if (winBottom > 0.05) addBoardZ(group, eastX, bz, 0, winBottom);
      if (wallH > winTop + 0.05) addBoardZ(group, eastX, bz, winTop, wallH);
    } else {
      addBoardZ(group, eastX, bz, 0, wallH);
    }
  }

  // --- South wall cladding (only the solid portions: left edge, right edge, below openings) ---
  // The south wall is mostly glass, so cladding only on the edge strips and below glass
  const southZ = HALF_GABLE + CLAD_THICKNESS / 2;
  // Left edge strip
  for (let i = 0; i < Math.floor(0.382 / CLAD_MODULE); i++) {
    const bx = -HALF_FACADE + CLAD_MODULE / 2 + i * CLAD_MODULE;
    addBoard(group, bx, southZ, 0, H_SOUTH);
  }
  // Right edge strip
  for (let i = 0; i < Math.floor(0.382 / CLAD_MODULE); i++) {
    const bx = HALF_FACADE - 0.382 + CLAD_MODULE / 2 + i * CLAD_MODULE;
    addBoard(group, bx, southZ, 0, H_SOUTH);
  }

  return group;
}

// Board on north/south wall (vertical, facing Z)
function addBoard(group, x, z, yBottom, yTop) {
  const h = yTop - yBottom;
  if (h < 0.02) return;
  const geo = new THREE.BoxGeometry(CLAD_BOARD_W, h, CLAD_THICKNESS);
  const mesh = new THREE.Mesh(geo, claddingMat);
  mesh.position.set(x, FLOOR_Y + yBottom + h / 2, z);
  group.add(mesh);
}

// Board on east/west gable (vertical, facing X)
function addBoardZ(group, x, z, yBottom, yTop) {
  const h = yTop - yBottom;
  if (h < 0.02) return;
  const geo = new THREE.BoxGeometry(CLAD_THICKNESS, h, CLAD_BOARD_W);
  const mesh = new THREE.Mesh(geo, claddingMat);
  mesh.position.set(x, FLOOR_Y + yBottom + h / 2, z);
  group.add(mesh);
}
