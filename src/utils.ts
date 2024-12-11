import type {STruple, SquadronId, MissionTime} from '../types';

export function isStringTuple(arr: string[]): arr is STruple {
  return arr.length === 3;
}

interface ParsedId {
  squadronId: SquadronId;
  unitId: number;
}

export function parseId(id: string): ParsedId {
  const pieces = id.split(/:|\./g);
  if (!isStringTuple(pieces)) {
    throw new Error(`parseId: ID does not contain 3 parts: ${id}, ${pieces}`);
  }
  const squadronSpawnIndex = parseInt(pieces[0], 10);
  const unitId = parseInt(pieces[2], 10);
  if (isNaN(unitId) || isNaN(squadronSpawnIndex)) {
    throw new Error(`parseId: unit: ${unitId}, or squadronSpawnIndex: ${squadronSpawnIndex} are not valid numbers`);
  }
  return {
    squadronId: `${squadronSpawnIndex}.${pieces[1]}`,
    unitId,
  };
}

export function getRandomInteger(min: number, max: number): number {
  if (min > max) {
    throw new Error('min must be less than or equal to max');
  }
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function getRandomFloat(min: number, max: number): number {
  if (min > max) {
    throw new Error('min must be less than or equal to max');
  }
  return Math.random() * (max - min + 1) + min;
}

interface Point {
  x: number;
  y: number;
}

function createSystemTranslator(
  system1Point1: Point,
  system1Point2: Point,
  system2Point1: Point,
  system2Point2: Point
): (point: Point) => Point {
  // Compute scaling factors
  const scaleX = (system1Point2.x - system1Point1.x) / (system2Point2.x - system2Point1.x);
  const scaleY = (system1Point2.y - system1Point1.y) / (system2Point2.y - system2Point1.y);

  // Compute offsets
  const offsetX = system1Point1.x - system2Point1.x * scaleX;
  const offsetY = system1Point1.y - system2Point1.y * scaleY;

  // Return the translator function
  return (point: Point): Point => {
    return {
      x: point.x * scaleX + offsetX,
      y: point.y * scaleY + offsetY,
    };
  };
}

// Reference points on the image
const system1Point1 = {x: 1878, y: 999};
const system1Point2 = {x: 9162, y: 8846};

// Reference points from the world map:
const system2Point1 = {x: 66531.3, y: 279437.2};
const system2Point2 = {x: 301238.1, y: 28351.6};

export const translator = createSystemTranslator(system1Point1, system1Point2, system2Point1, system2Point2);

interface DeconstructedTime {
  hours: number;
  minutes: number;
  seconds: number;
}

export function getTimeAsNumbers(missionTime: MissionTime): DeconstructedTime {
  const [hours, minutes, seconds] = missionTime.split(':');
  return {hours: parseInt(hours, 10), minutes: parseInt(minutes, 10), seconds: parseFloat(seconds)};
}
