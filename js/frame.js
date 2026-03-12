import * as THREE from 'three';
import {
  FLOOR_Y, HALF_FACADE, HALF_GABLE, FACADE_LENGTH,
  H_SOUTH, H_NORTH_WEST, H_NORTH_EAST,
  BEAM_W, BEAM_H, POST_W, POST_D, POST2_W, POST2_D,
  RAFTER_SPACING, northWallHeight,
  SOUTH_EDGE, SLIDE_DOOR_W, SOUTH_GAP, ENTRY_DOOR_W, ENTRY_POST_W, ENTRY_WINDOW_W
} from './constants.js';
import { timberMat, windBraceMat } from './materials.js';

function makeBox(w, h, d, mat) {
  return new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
}

// Create a vertical post
function post(x, z, height, secW, secD) {
  const m = makeBox(secW, height, secD, timberMat);
  m.position.set(x, FLOOR_Y + height / 2, z);
  return m;
}

// Create a horizontal beam along X axis
function beamX(x1, x2, y, z, w, h) {
  const len = Math.abs(x2 - x1);
  const m = makeBox(len, h, w, timberMat);
  m.position.set((x1 + x2) / 2, y + h / 2, z);
  return m;
}

// Create a tilted beam along X (for north wall top plate that slopes east-west)
function tiltedBeamX(x1, y1, x2, y2, z, bw, bh) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = Math.sqrt(dx * dx + dy * dy);
  const angle = Math.atan2(dy, dx);
  const m = makeBox(len, bh, bw, timberMat);
  m.position.set((x1 + x2) / 2, (y1 + y2) / 2 + bh / 2, z);
  m.rotation.z = angle;
  return m;
}

// Create a rafter spanning from south to north wall
function rafter(x, ySouth, yNorth, zSouth, zNorth) {
  const horizDist = zSouth - zNorth; // positive (south Z > north Z)
  const dy = yNorth - ySouth;        // positive (north is higher)
  const len = Math.sqrt(horizDist * horizDist + dy * dy);
  const angle = Math.atan2(dy, horizDist); // small positive angle
  const m = makeBox(POST_W, POST_D, len, timberMat);
  m.position.set(x, (ySouth + yNorth) / 2, (zSouth + zNorth) / 2);
  m.rotation.x = angle;
  return m;
}

export function createFrame() {
  const group = new THREE.Group();
  const S = HALF_GABLE;   // south Z
  const N = -HALF_GABLE;  // north Z
  const W = -HALF_FACADE; // west X
  const E = HALF_FACADE;  // east X

  // --- Corner posts ---
  group.add(post(W, S, H_SOUTH, POST_W, POST_D));        // SW
  group.add(post(E, S, H_SOUTH, POST_W, POST_D));        // SE
  group.add(post(W, N, H_NORTH_WEST, POST_W, POST_D));   // NW
  group.add(post(E, N, H_NORTH_EAST, POST_W, POST_D));   // NE

  // --- South facade intermediate posts ---
  // Layout from left (west) edge: edge + slide + gap + door + post + window + gap + slide + edge
  const southPostXs = [];
  let cx = W + SOUTH_EDGE;
  southPostXs.push(cx); // left of left sliding door
  cx += SLIDE_DOOR_W;
  southPostXs.push(cx); // right of left sliding door
  cx += SOUTH_GAP;
  southPostXs.push(cx); // left of door
  cx += ENTRY_DOOR_W;
  southPostXs.push(cx); // right of door / left of center post
  cx += ENTRY_POST_W;
  southPostXs.push(cx); // right of center post / left of window
  cx += ENTRY_WINDOW_W;
  southPostXs.push(cx); // right of window
  cx += SOUTH_GAP;
  southPostXs.push(cx); // left of right sliding door
  cx += SLIDE_DOOR_W;
  southPostXs.push(cx); // right of right sliding door

  for (const x of southPostXs) {
    group.add(post(x, S, H_SOUTH, POST_W, POST_D));
  }

  // --- North wall intermediate posts (at window boundaries) ---
  // Add posts at regular intervals and at window edges
  const northPostXs = new Set();
  // Regular posts every ~1.2m
  for (let x = W + 1.2; x < E - 0.5; x += 1.2) {
    northPostXs.add(Math.round(x * 1000) / 1000);
  }
  for (const x of northPostXs) {
    const h = northWallHeight(x);
    group.add(post(x, N, h, POST_W, POST_D));
  }

  // --- Gable posts (west and east) ---
  // West gable: 2 intermediate posts
  for (let z = N + 0.8; z < S - 0.3; z += 1.0) {
    const t = (z - N) / (S - N); // 0 at north, 1 at south
    const h = H_NORTH_WEST + t * (H_SOUTH - H_NORTH_WEST);
    group.add(post(W, z, h, POST_W, POST_D));
  }
  // East gable: 2 intermediate posts
  for (let z = N + 0.8; z < S - 0.3; z += 1.0) {
    const t = (z - N) / (S - N);
    const h = H_NORTH_EAST + t * (H_SOUTH - H_NORTH_EAST);
    group.add(post(E, z, h, POST_W, POST_D));
  }

  // --- Top beams (remme) ---
  // South wall top beam (horizontal)
  const ySouthBeam = FLOOR_Y + H_SOUTH;
  group.add(beamX(W, E, ySouthBeam, S, BEAM_W, BEAM_H));

  // North wall top beam (tilted east-west)
  const yNW = FLOOR_Y + H_NORTH_WEST;
  const yNE = FLOOR_Y + H_NORTH_EAST;
  group.add(tiltedBeamX(W, yNW, E, yNE, N, BEAM_W, BEAM_H));

  // West gable top beam (tilted south-north)
  {
    const dy = yNW - ySouthBeam;          // positive (north higher)
    const horizDist = S - N;               // positive (south Z > north Z)
    const len = Math.sqrt(horizDist * horizDist + dy * dy);
    const angle = Math.atan2(dy, horizDist);
    const m = makeBox(BEAM_W, BEAM_H, len, timberMat);
    m.position.set(W, (ySouthBeam + yNW) / 2, (S + N) / 2);
    m.rotation.x = angle;
    group.add(m);
  }

  // East gable top beam (tilted south-north)
  {
    const dy = yNE - ySouthBeam;
    const horizDist = S - N;
    const len = Math.sqrt(horizDist * horizDist + dy * dy);
    const angle = Math.atan2(dy, horizDist);
    const m = makeBox(BEAM_W, BEAM_H, len, timberMat);
    m.position.set(E, (ySouthBeam + yNE) / 2, (S + N) / 2);
    m.rotation.x = angle;
    group.add(m);
  }

  // --- Rafters ---
  const rafterCount = Math.floor(FACADE_LENGTH / RAFTER_SPACING);
  for (let i = 0; i <= rafterCount; i++) {
    const x = W + i * RAFTER_SPACING;
    if (x > E + 0.01) break;
    const yS = ySouthBeam + BEAM_H;
    const yN = FLOOR_Y + northWallHeight(x) + BEAM_H;
    group.add(rafter(x, yS, yN, S, N));
  }

  // --- Wind bracing (diagonal X-braces on roof plane) ---
  // Two diagonal braces across the rafter field
  {
    const yS1 = ySouthBeam + BEAM_H + POST_D / 2;
    const yN1 = FLOOR_Y + northWallHeight(W + 1.5) + BEAM_H + POST_D / 2;
    const yN2 = FLOOR_Y + northWallHeight(E - 1.5) + BEAM_H + POST_D / 2;

    // Brace 1: SW area to NE area
    const b1 = makeBrace(W + 0.5, yS1, S - 0.2, W + 3.0, yN1, N + 0.2);
    group.add(b1);

    // Brace 2: SE area
    const b2 = makeBrace(E - 0.5, yS1, S - 0.2, E - 3.0, yN2, N + 0.2);
    group.add(b2);
  }

  return group;
}

function makeBrace(x1, y1, z1, x2, y2, z2) {
  const dx = x2 - x1, dy = y2 - y1, dz = z2 - z1;
  const len = Math.sqrt(dx * dx + dy * dy + dz * dz);
  const m = makeBox(0.03, 0.01, len, windBraceMat);
  m.position.set((x1 + x2) / 2, (y1 + y2) / 2, (z1 + z2) / 2);
  m.lookAt(x2, y2, z2);
  return m;
}
