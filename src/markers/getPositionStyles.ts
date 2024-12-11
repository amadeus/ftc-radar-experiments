import {translator} from '../utils';

// const BATTLE_AREA = {x: 10000, y: 10000, w: 350000, h: 300000, sector_size: 10000};
const IMAGE_WIDTH = 11011;
const IMAGE_HEIGHT = 9474;

export const MAP_MODEL_WIDTH = IMAGE_WIDTH / 1000;
export const MAP_MODEL_HEIGHT = IMAGE_HEIGHT / 1000;
export const MAX_Z = 60000;

export default function getPositionStyles(x: number, y: number, zOverride = 0.04): [number, number, number] {
  const coords = translator({x, y});
  return [
    (coords.x / IMAGE_WIDTH) * MAP_MODEL_WIDTH - MAP_MODEL_WIDTH / 2,
    MAP_MODEL_HEIGHT - (coords.y / IMAGE_HEIGHT) * MAP_MODEL_HEIGHT - MAP_MODEL_HEIGHT / 2,
    zOverride,
  ];
}
