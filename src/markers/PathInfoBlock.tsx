import {useMemo, useEffect, memo} from 'react';
import {useSpring, a} from '@react-spring/three';
import {useGLTF} from '@react-three/drei';
import {getRandomFloat} from '../utils';
import getPositionStyles from './getPositionStyles';
import TileTextRow from './TileTextRow';
import {BROWN} from './constants';
import type {GLTF} from 'three-stdlib';
import type {Mesh, Material} from 'three';

const BLOCK_SCALE: [number, number, number] = [0.056, 0.045, 0.032];

type GLTFResult = GLTF & {
  nodes: {
    cube: Mesh;
  };
  materials: {
    [name: string]: Material;
  };
  animations: [];
};

interface MarkerBlockProps {
  x: number;
  y: number;
  z: number;
  army: number;
  colorOverride?: string;
  onClick?(): unknown;
  units: number;
  displayId: string;
}

export default memo(function MarkerBlock({x, y, z, army, colorOverride, units, displayId, onClick}: MarkerBlockProps) {
  const {
    nodes: {cube},
  } = useGLTF('/models/block-basic.glb') as GLTFResult;
  const rotation = useMemo(() => {
    const angle = getRandomFloat(-95, -85);
    return [Math.PI / 2, angle * (Math.PI / 180), 0] as [number, number, number];
  }, []);
  const [{position}, api] = useSpring<{position: [number, number, number]}>(
    () => ({from: {position: getPositionStyles(x, y, 0)}}),
    []
  );
  useEffect(() => void api.start({position: getPositionStyles(x, y, 0)}), [x, y, api]);
  const strength = (() => {
    if (army === 1) {
      return `${units}`;
    }
    if (units < 5) {
      return '1+';
    }
    return `${Math.floor(units / 5) * 5}+`;
  })();
  const bottomLabel = `${Math.floor((z * 3.28084) / 5000) * 5}`;
  return useMemo(
    () => (
      <a.group position={position} rotation={rotation}>
        <a.mesh scale={BLOCK_SCALE} geometry={cube.geometry} castShadow receiveShadow onClick={onClick}>
          <meshStandardMaterial color={colorOverride != null ? colorOverride : BROWN} />
        </a.mesh>
        <TileTextRow row="top" text={displayId} army={army} />
        <TileTextRow row="middle" text={strength} army={army} />
        <TileTextRow row="bottom" text={bottomLabel} army={army} />
      </a.group>
    ),
    [army, cube, colorOverride, position, rotation, strength, bottomLabel, displayId, onClick]
  );
});
