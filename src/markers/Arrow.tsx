import {useMemo, memo} from 'react';
import {useGLTF} from '@react-three/drei';
import {Vector3, Euler, type Mesh, type Material} from 'three';
import type {PathPoint} from '../../types';
import getPositionStyles from './getPositionStyles';
import {GLTF} from 'three-stdlib';

const ARROW_SCALE: [number, number, number] = [0.005, 0.002, 0.005];

interface GLTFResult extends GLTF {
  nodes: {
    arrow: Mesh;
  };
  materials: {
    [name: string]: Material;
  };
  animations: [];
}

interface ArrowProps {
  start: PathPoint;
  target: PathPoint;
  army: number;
  overrideColor?: string;
}

export default memo(function Arrow({start, target, army, overrideColor}: ArrowProps) {
  const {nodes} = useGLTF('/models/arrow-basic.glb') as GLTFResult;
  const {rotation, startVec} = useMemo(() => {
    const startVec = new Vector3(...getPositionStyles(start.x, start.y, 0.005));
    const targetVec = new Vector3(...getPositionStyles(target.x, target.y, 0.005));
    const direction = new Vector3().subVectors(targetVec, startVec).normalize();
    const height = 0.04;
    const adjustedPosition = startVec.clone().add(direction.clone().multiplyScalar(height / 2));
    const dx = targetVec.x - startVec.x;
    const dy = targetVec.y - startVec.y;
    const angle2 = Math.atan2(dy, dx);
    return {
      rotation: new Euler(Math.PI / 2, angle2, 0),
      startVec: adjustedPosition,
    };
  }, [start, target]);
  return (
    <group position={startVec} rotation={rotation} scale={ARROW_SCALE}>
      <mesh geometry={nodes.arrow.geometry} receiveShadow castShadow>
        <meshPhysicalMaterial color={overrideColor != null ? overrideColor : army === 1 ? 'blue' : 'red'} />
      </mesh>
    </group>
  );
});
