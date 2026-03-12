import * as THREE from 'three';
import {
  FLOOR_Y, HALF_FACADE, HALF_GABLE,
  H_SOUTH, H_NORTH_WEST, H_NORTH_EAST,
  BEAM_H, ROOF_THICKNESS, ROOF_OVERHANG_WEST, ROOF_OVERHANG_EAST,
  ROOF_SURFACE_WIDTH, GABLE_WIDTH
} from './constants.js';
import { roofMat } from './materials.js';

export function createRoof() {
  const group = new THREE.Group();

  // Roof corners at the top of beams
  // The roof plane sits on top of the beams (beam top = wall top + BEAM_H)
  const beamTopSouth = FLOOR_Y + H_SOUTH + BEAM_H;
  const beamTopNW = FLOOR_Y + H_NORTH_WEST + BEAM_H;
  const beamTopNE = FLOOR_Y + H_NORTH_EAST + BEAM_H;

  // Overhangs
  const westX = -HALF_FACADE - ROOF_OVERHANG_WEST;
  const eastX = HALF_FACADE + ROOF_OVERHANG_EAST;

  // North-south overhang: roof surface width is 4.838m, building depth is 3.36m
  const overhangTotal = ROOF_SURFACE_WIDTH - GABLE_WIDTH;
  const overhangSouth = overhangTotal * 0.4; // 40% front
  const overhangNorth = overhangTotal * 0.6; // 60% back (higher side, wider overhang typical)
  const southZ = HALF_GABLE + overhangSouth;
  const northZ = -HALF_GABLE - overhangNorth;

  // Four corner heights of the roof (top surface)
  // South side is lower, north side is higher
  // West side lower than east side on north wall
  const SW_Y = beamTopSouth;
  const SE_Y = beamTopSouth;
  const NW_Y = beamTopNW;
  const NE_Y = beamTopNE;

  // Adjust for overhang slope continuation
  // South overhang: extend the slope downward
  const slopeNS_west = (NW_Y - SW_Y) / (HALF_GABLE * 2); // rise per meter north
  const slopeNS_east = (NE_Y - SE_Y) / (HALF_GABLE * 2);

  const roofSW_Y = SW_Y - slopeNS_west * overhangSouth;
  const roofSE_Y = SE_Y - slopeNS_east * overhangSouth;
  const roofNW_Y = NW_Y + slopeNS_west * overhangNorth;
  const roofNE_Y = NE_Y + slopeNS_east * overhangNorth;

  // Build roof as two triangles (top surface)
  const topVerts = new Float32Array([
    // Triangle 1: SW, SE, NE
    westX, roofSW_Y, southZ,
    eastX, roofSE_Y, southZ,
    eastX, roofNE_Y, northZ,
    // Triangle 2: SW, NE, NW
    westX, roofSW_Y, southZ,
    eastX, roofNE_Y, northZ,
    westX, roofNW_Y, northZ,
  ]);

  // Bottom surface (offset down by ROOF_THICKNESS)
  const botVerts = new Float32Array([
    westX, roofSW_Y - ROOF_THICKNESS, southZ,
    eastX, roofNE_Y - ROOF_THICKNESS, northZ,
    eastX, roofSE_Y - ROOF_THICKNESS, southZ,

    westX, roofSW_Y - ROOF_THICKNESS, southZ,
    westX, roofNW_Y - ROOF_THICKNESS, northZ,
    eastX, roofNE_Y - ROOF_THICKNESS, northZ,
  ]);

  // Top face
  const topGeo = new THREE.BufferGeometry();
  topGeo.setAttribute('position', new THREE.BufferAttribute(topVerts, 3));
  topGeo.computeVertexNormals();
  group.add(new THREE.Mesh(topGeo, roofMat));

  // Bottom face
  const botGeo = new THREE.BufferGeometry();
  botGeo.setAttribute('position', new THREE.BufferAttribute(botVerts, 3));
  botGeo.computeVertexNormals();
  group.add(new THREE.Mesh(botGeo, roofMat));

  // Side edges (fascia boards) - four edges around the roof
  // South edge
  addRoofEdge(group, westX, roofSW_Y, southZ, eastX, roofSE_Y, southZ);
  // North edge
  addRoofEdge(group, westX, roofNW_Y, northZ, eastX, roofNE_Y, northZ);
  // West edge
  addRoofEdge(group, westX, roofSW_Y, southZ, westX, roofNW_Y, northZ);
  // East edge
  addRoofEdge(group, eastX, roofSE_Y, southZ, eastX, roofNE_Y, northZ);

  return group;
}

function addRoofEdge(group, x1, y1, z1, x2, y2, z2) {
  const dx = x2 - x1, dy = y2 - y1, dz = z2 - z1;
  const len = Math.sqrt(dx * dx + dy * dy + dz * dz);

  // Use a cylinder for reliable orientation between two points
  const geo = new THREE.BoxGeometry(0.04, 0.12, len);
  const mesh = new THREE.Mesh(geo, roofMat);

  // Position at midpoint
  mesh.position.set((x1 + x2) / 2, (y1 + y2) / 2 - 0.06, (z1 + z2) / 2);

  // Orient along the edge direction
  if (Math.abs(dx) > Math.abs(dz)) {
    // Mostly along X (south/north edges)
    const angle = Math.atan2(dy, Math.abs(dx));
    mesh.rotation.z = dx > 0 ? -angle : angle;
  } else {
    // Mostly along Z (west/east edges)
    const angle = Math.atan2(dy, Math.abs(dz));
    mesh.rotation.x = dz < 0 ? angle : -angle;
  }

  group.add(mesh);
}
