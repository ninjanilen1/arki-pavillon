// All dimensions in meters (mm / 1000)

// Foundation / Sokkel
export const SOKKEL_LENGTH = 9.5;
export const SOKKEL_WIDTH = 3.5;
export const SOKKEL_HEIGHT = 0.15;

// Building body (outer edge of timber frame)
export const FACADE_LENGTH = 9.36;
export const GABLE_WIDTH = 3.36;
export const HALF_FACADE = FACADE_LENGTH / 2; // 4.68
export const HALF_GABLE = GABLE_WIDTH / 2;    // 1.68

// Floor level = top of sokkel
export const FLOOR_Y = SOKKEL_HEIGHT; // 0.15

// Wall top heights above floor (world Y = FLOOR_Y + value)
export const H_SOUTH = 2.078;
export const H_NORTH_WEST = 2.88825;   // NW corner (west gable back)
export const H_NORTH_EAST = 3.38733;   // NE corner (east gable back)
export const H_NORTH_BACK = 2.84871;   // general north reference

// Roof
export const ROOF_SLOPE_DEG = 5.2;
export const ROOF_TOTAL_LENGTH = 10.1;     // east-west span
export const ROOF_SURFACE_WIDTH = 4.838;   // north-south span (incl. overhang)
export const ROOF_OVERHANG_WEST = 0.478;
export const ROOF_OVERHANG_EAST = 1.01918;
export const ROOF_THICKNESS = 0.05;

// Timber sections
export const BEAM_W = 0.09;
export const BEAM_H = 0.3;
export const POST_W = 0.045;
export const POST_D = 0.195;
export const POST2_W = 0.045;
export const POST2_D = 0.095;

// Cladding
export const CLAD_MODULE = 0.125;
export const CLAD_GAP = 0.04;
export const CLAD_BOARD_W = CLAD_MODULE - CLAD_GAP; // 0.085
export const CLAD_THICKNESS = 0.022;

// South facade elements (left to right)
export const SOUTH_EDGE = 0.382;
export const SLIDE_DOOR_W = 3.372;
export const SOUTH_GAP = 0.191;
export const ENTRY_DOOR_W = 0.78;
export const ENTRY_POST_W = 0.05;
export const ENTRY_WINDOW_W = 0.78;
export const GLASS_H = 1.89;
export const FRAME_H = 2.028;

// North facade windows
export const NORTH_PAN1_W = 3.3295;
export const NORTH_PAN1_H = 0.25;
export const NORTH_PAN2_W = 1.485;
export const NORTH_PAN2_H = 0.25;
export const NORTH_PAN_BOTTOM_Y = 2.25; // above floor
export const NORTH_VERT_W = 0.25;
export const NORTH_VERT_H = 1.75;
export const NORTH_VERT_FROM_LEFT = 2.6725;
export const NORTH_SQ_W = 0.25;
export const NORTH_SQ_H = 0.58;
export const NORTH_SQ_FROM_RIGHT = 1.27475;

// Gables
export const TERRACE_DEPTH = 2.5;
export const TERRACE_HEIGHT = 0.222;
export const EAST_WIN_BOTTOM_W = 2.73;
export const EAST_WIN_EDGE = 0.335;

// Interpolate north wall height at a given X position
export function northWallHeight(x) {
  const t = (x + HALF_FACADE) / FACADE_LENGTH; // 0 at west, 1 at east
  return H_NORTH_WEST + t * (H_NORTH_EAST - H_NORTH_WEST);
}

// Rafter spacing
export const RAFTER_SPACING = 0.6;
