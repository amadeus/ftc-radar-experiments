import {memo, Fragment} from 'react';
import type {WorldStateItem, Army} from '../types';
import {useTexture} from '@react-three/drei';
import mapImage from './assets/map-test-large.jpg';
import {DoubleSide} from 'three';

const WIDTH = 5000 / 1000;
const HEIGHT = 4297 / 1000;
const MAX_Z = 60000;

function getPositionStyles(
  x: number,
  y: number,
  z: number,
  maxX: number,
  maxY: number,
  maxZ: number
): [number, number, number] {
  const xPercentage = x / maxX;
  const yPercentage = y / maxY;
  const zPercentage = z / maxZ;
  return [WIDTH * xPercentage - WIDTH / 2, HEIGHT * yPercentage - HEIGHT / 2, 3 * zPercentage];
}

// const IMAGE_WIDTH = 5000;
// const IMAGE_HEIGHT = 4297;

interface SphereProps {
  position: [number, number, number];
  color: string;
}

function Sphere({position, color}: SphereProps) {
  return (
    <mesh position={position}>
      <sphereGeometry args={[8 / 5000, 32, 32]} />
      <meshStandardMaterial color={color} />
    </mesh>
  );
}

interface Map3dProps {
  states: WorldStateItem[];
}

export default memo(function Map3d({states}: Map3dProps) {
  const texture = useTexture(mapImage);
  return (
    <group position={[0, 0, 0]}>
      <mesh>
        <planeGeometry args={[5, 4.297]} />
        <meshStandardMaterial map={texture} side={DoubleSide} />
      </mesh>
      {states.map(({aircrafts, armies, mission_time, battle_area}) => {
        const armyRecord: Record<number, Army | undefined> = {};
        for (const army of armies) {
          armyRecord[army.id] = army;
        }
        const renderedAircraft = [];
        for (const aircraft of aircrafts) {
          const army = armyRecord[aircraft.army];
          if (army == null) continue;
          renderedAircraft.push(
            <Sphere
              key={aircraft.id}
              position={getPositionStyles(aircraft.x, aircraft.y, aircraft.z, battle_area.w, battle_area.h, MAX_Z)}
              color={army.id === 1 ? 'red' : 'blue'}
            />
          );
        }
        return renderedAircraft.length > 0 ? <Fragment key={mission_time}>{renderedAircraft}</Fragment> : null;
      })}
    </group>
  );
});
