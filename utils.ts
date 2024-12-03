import type {STruple, SquadronId} from './types';

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
  const unit = parseInt(pieces[2], 10);
  if (isNaN(unit) || isNaN(squadronSpawnIndex)) {
    throw new Error(`parseId: unit: ${unit}, or squadronSpawnIndex: ${squadronSpawnIndex} are not valid numbers`);
  }
  return {
    squadronId: `${squadronSpawnIndex}.${pieces[1]}`,
    unitId: 1,
  };
}
