import {memo, useEffect, useMemo} from 'react';
import type {Path, PathPoint} from '../types';
import useStore from './Store';
import {useTexture, useGLTF} from '@react-three/drei';
import mapImage from './assets/map-test-large.png';
import {DoubleSide, Vector3, Euler} from 'three';
import {useSpring, a} from '@react-spring/three';

const BATTLE_AREA = {x: 10000, y: 10000, w: 350000, h: 300000, sector_size: 10000};
const WIDTH = 5000 / 1000;
const HEIGHT = 4297 / 1000;
export const MAX_Z = 60000;

function getPositionStyles(x: number, y: number, zOverride = 0.04): [number, number, number] {
  const xPercentage = x / BATTLE_AREA.w;
  const yPercentage = y / BATTLE_AREA.h;
  return [WIDTH * xPercentage - WIDTH / 1.7, HEIGHT * yPercentage - HEIGHT / 1.7, zOverride];
}

// const IMAGE_WIDTH = 5000;
// const IMAGE_HEIGHT = 4297;

interface MarkerBlockProps {
  point: PathPoint;
  army: number;
}

function MarkerBlock({point, army}: MarkerBlockProps) {
  const position = getPositionStyles(point.x, point.y);
  const [props, api] = useSpring<{position: [number, number, number]}>(() => ({from: {position}}), []);
  useEffect(() => {
    api.start({position});
  });
  return (
    <a.mesh position={props.position} castShadow>
      <boxGeometry args={[0.04, 0.04, 0.08]} />
      <meshStandardMaterial color={army === 1 ? 'blue' : 'red'} />
    </a.mesh>
  );
}

interface ArrowProps {
  start: PathPoint;
  target: PathPoint;
  army: number;
}

const Arrow = memo(function Arrow({start, target, army}: ArrowProps) {
  const {nodes} = useGLTF('/models/arrow.glb');
  const {rotation, startVec} = useMemo(() => {
    const startVec = new Vector3(...getPositionStyles(start.x, start.y, 0));
    const targetVec = new Vector3(...getPositionStyles(target.x, target.y, 0));
    const direction = new Vector3().subVectors(targetVec, startVec).normalize();
    const height = 0.04;
    const adjustedPosition = startVec.clone().add(direction.clone().multiplyScalar(height / 2));
    const dx = targetVec.x - startVec.x;
    const dy = targetVec.y - startVec.y;
    const angle2 = Math.atan2(dy, dx);
    return {
      rotation: new Euler(0, 0, angle2),
      startVec: adjustedPosition,
    };
  }, [start, target]);
  return (
    <group position={startVec} rotation={rotation} scale={[0.025, 0.025, 0.025]} receiveShadow castShadow>
      <mesh geometry={(nodes.arrow as any).geometry}>
        <meshPhysicalMaterial color={army === 1 ? 'blue' : 'red'} />
      </mesh>
    </group>
  );
});

interface PathProps {
  path: Path;
}

function Path({path}: PathProps) {
  const line = [];
  let i = 0;
  for (const point of path.points) {
    const nextPoint = path.points[i + 1];
    if (nextPoint != null) {
      line.push(<Arrow key={point.mission_time} start={point} target={nextPoint} army={path.army} />);
    }
    i++;
  }
  line.push(<MarkerBlock point={path.currentPosition} army={path.army} key="marker" />);
  return <>{line}</>;
}

export default memo(function Map3d() {
  const paths = useStore(({paths}) => paths);
  const texture = useTexture(mapImage);
  const renderedPaths = [];
  for (const [, path] of paths) {
    renderedPaths.push(<Path key={path.id} path={path} />);
  }
  return (
    <group position={[0, 0, 0]}>
      <mesh receiveShadow>
        <planeGeometry args={[5, 4.297]} />
        <meshStandardMaterial map={texture} side={DoubleSide} />
      </mesh>
      {renderedPaths}
    </group>
  );
});
