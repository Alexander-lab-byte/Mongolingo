import data from "./worldLayout.json";

/* The 3D world's layout. Edit it visually at /studio (on your computer), which saves to worldLayout.json. */

export type Vec3 = [number, number, number];
export type Shot = { name: string; pos: Vec3; look: Vec3; tod: number };
export type GerDef = { id: string; x: number; z: number; rot: number; scale: number };
export type SignDef = { id: string; text: string; bg: string; fg: string; x: number; y: number; z: number; rot: number; cross?: boolean; stripe?: [string, string] };
export type WorldSettings = { bloom: number; lights: number; snow: number; letters: boolean };
export type WorldLayout = { shots: Shot[]; gers: GerDef[]; signs: SignDef[]; settings: WorldSettings };

export const WORLD_LAYOUT = data as WorldLayout;
