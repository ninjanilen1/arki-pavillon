import * as THREE from 'three';
import {
  FLOOR_Y, HALF_FACADE, HALF_GABLE, FACADE_LENGTH, GABLE_WIDTH,
  H_SOUTH, H_NORTH_EAST,
  SOUTH_EDGE, SLIDE_DOOR_W, SOUTH_GAP, ENTRY_DOOR_W, ENTRY_POST_W, ENTRY_WINDOW_W,
  GLASS_H, FRAME_H,
  NORTH_PAN1_W, NORTH_PAN1_H, NORTH_PAN2_W,
  NORTH_PAN_BOTTOM_Y, NORTH_VERT_W, NORTH_VERT_H, NORTH_VERT_FROM_LEFT,
  NORTH_SQ_W, NORTH_SQ_H, NORTH_SQ_FROM_RIGHT
} from './constants.js';
import { glassMat, glassFrameMat } from './materials.js';

const GLASS_DEPTH = 0.008;
const FRAME_DEPTH = 0.04;
const FRAME_THICK = 0.04;

function glassPanel(w, h) {
  return new THREE.Mesh(new THREE.BoxGeometry(w, h, GLASS_DEPTH), glassMat);
}

function frameH(w, depth) {
  return new THREE.Mesh(new THREE.BoxGeometry(w, FRAME_THICK, depth), glassFrameMat);
}

function frameV(h, depth) {
  return new THREE.Mesh(new THREE.BoxGeometry(FRAME_THICK, h, depth), glassFrameMat);
}

function framedGlassPanel(w, h, x, y, z) {
  const group = new THREE.Group();
  // Glass
  const g = glassPanel(w, h);
  g.position.set(x, y, z);
  group.add(g);
  // Frame
  group.add(posAt(frameH(w + FRAME_THICK, FRAME_DEPTH), x, y - h / 2, z)); // bottom
  group.add(posAt(frameH(w + FRAME_THICK, FRAME_DEPTH), x, y + h / 2, z)); // top
  group.add(posAt(frameV(h, FRAME_DEPTH), x - w / 2, y, z)); // left
  group.add(posAt(frameV(h, FRAME_DEPTH), x + w / 2, y, z)); // right
  return group;
}

function posAt(mesh, x, y, z) {
  mesh.position.set(x, y, z);
  return mesh;
}

export function createWindows() {
  const group = new THREE.Group();
  const southZ = HALF_GABLE;
  const northZ = -HALF_GABLE;
  const W = -HALF_FACADE;

  // =================== SOUTH FACADE ===================
  // Glass bottom Y relative to floor
  const glassBottomOffset = (FRAME_H - GLASS_H) / 2; // sill height
  const glassCenterY = FLOOR_Y + glassBottomOffset + GLASS_H / 2;

  // Compute X positions from left (west)
  let cx = W + SOUTH_EDGE;

  // Left sliding door
  const leftSlideX = cx + SLIDE_DOOR_W / 2;
  group.add(framedGlassPanel(SLIDE_DOOR_W, GLASS_H, leftSlideX, glassCenterY, southZ));
  // Add vertical divider in the middle (sliding door split)
  group.add(posAt(frameV(GLASS_H, FRAME_DEPTH), leftSlideX, glassCenterY, southZ));
  cx += SLIDE_DOOR_W + SOUTH_GAP;

  // Entry door
  const doorX = cx + ENTRY_DOOR_W / 2;
  group.add(framedGlassPanel(ENTRY_DOOR_W, GLASS_H, doorX, glassCenterY, southZ));
  cx += ENTRY_DOOR_W;

  // Center post
  group.add(posAt(frameV(FRAME_H, FRAME_DEPTH), cx + ENTRY_POST_W / 2, FLOOR_Y + FRAME_H / 2, southZ));
  cx += ENTRY_POST_W;

  // Entry window
  const winX = cx + ENTRY_WINDOW_W / 2;
  group.add(framedGlassPanel(ENTRY_WINDOW_W, GLASS_H, winX, glassCenterY, southZ));
  cx += ENTRY_WINDOW_W + SOUTH_GAP;

  // Right sliding door
  const rightSlideX = cx + SLIDE_DOOR_W / 2;
  group.add(framedGlassPanel(SLIDE_DOOR_W, GLASS_H, rightSlideX, glassCenterY, southZ));
  group.add(posAt(frameV(GLASS_H, FRAME_DEPTH), rightSlideX, glassCenterY, southZ));

  // =================== NORTH FACADE ===================
  // Panorama window 1 (left)
  const pan1X = W + 0.2 + NORTH_PAN1_W / 2;
  const panY = FLOOR_Y + NORTH_PAN_BOTTOM_Y + NORTH_PAN1_H / 2;
  group.add(framedGlassPanel(NORTH_PAN1_W, NORTH_PAN1_H, pan1X, panY, northZ));

  // Panorama window 2 (right)
  const pan2X = HALF_FACADE - 0.2 - NORTH_PAN2_W / 2;
  group.add(framedGlassPanel(NORTH_PAN2_W, NORTH_PAN1_H, pan2X, panY, northZ));

  // Vertical window
  const vertX = W + NORTH_VERT_FROM_LEFT;
  const vertY = FLOOR_Y + 0.4 + NORTH_VERT_H / 2;
  group.add(framedGlassPanel(NORTH_VERT_W, NORTH_VERT_H, vertX, vertY, northZ));

  // Square window 1 (center)
  const sq1X = W + FACADE_LENGTH / 2;
  const sqY = FLOOR_Y + 1.2 + NORTH_SQ_H / 2;
  group.add(framedGlassPanel(NORTH_SQ_W, NORTH_SQ_H, sq1X, sqY, northZ));

  // Square window 2 (right side)
  const sq2X = HALF_FACADE - NORTH_SQ_FROM_RIGHT;
  group.add(framedGlassPanel(NORTH_SQ_W, NORTH_SQ_H, sq2X, sqY, northZ));

  // =================== EAST GABLE - Trapezoidal window ===================
  const eastX = HALF_FACADE;
  // Trapezoidal window following roof slope
  const winBottomZ1 = -HALF_GABLE + 0.335;
  const winBottomZ2 = HALF_GABLE - 0.335;
  const winBottomW = winBottomZ2 - winBottomZ1;
  const winBottomY = FLOOR_Y + 0.8;
  // Top follows the slope: north side is higher
  const topYnorth = FLOOR_Y + H_NORTH_EAST - 0.4;
  const topYsouth = FLOOR_Y + H_SOUTH - 0.1;

  // Create trapezoid shape
  const shape = new THREE.Shape();
  // In local coords: x = z-axis (gable width), y = height
  const halfW = winBottomW / 2;
  shape.moveTo(-halfW, winBottomY);          // bottom-left (north side)
  shape.lineTo(halfW, winBottomY);            // bottom-right (south side)
  shape.lineTo(halfW, topYsouth);             // top-right (south, lower)
  shape.lineTo(-halfW, topYnorth);            // top-left (north, higher)
  shape.closePath();

  const extGeo = new THREE.ExtrudeGeometry(shape, { depth: GLASS_DEPTH, bevelEnabled: false });
  const trapGlass = new THREE.Mesh(extGeo, glassMat);
  trapGlass.rotation.y = Math.PI / 2;
  trapGlass.position.set(eastX, 0, 0);
  group.add(trapGlass);

  // Trapezoid frame edges
  const frameEdges = [
    [[-halfW, winBottomY], [halfW, winBottomY]],     // bottom
    [[halfW, winBottomY], [halfW, topYsouth]],         // right (south)
    [[halfW, topYsouth], [-halfW, topYnorth]],         // top (sloped)
    [[-halfW, topYnorth], [-halfW, winBottomY]],       // left (north)
  ];
  for (const [p1, p2] of frameEdges) {
    const dx = p2[0] - p1[0], dy = p2[1] - p1[1];
    const len = Math.sqrt(dx * dx + dy * dy);
    const angle = Math.atan2(dy, dx);
    const bar = new THREE.Mesh(
      new THREE.BoxGeometry(len, FRAME_THICK, FRAME_DEPTH),
      glassFrameMat
    );
    bar.rotation.y = Math.PI / 2;
    bar.rotation.x = angle;
    // Position at midpoint
    const midZ = (p1[0] + p2[0]) / 2;
    const midY = (p1[1] + p2[1]) / 2;
    bar.position.set(eastX, midY, midZ);
    group.add(bar);
  }

  return group;
}
