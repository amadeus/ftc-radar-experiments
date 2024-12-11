import {memo} from 'react';
import useStore from './Store';
import {useTexture} from '@react-three/drei';
import mapImage from './assets/map-test-large.jpg';
import {DoubleSide} from 'three';
import MapPath from './markers/MapPath';
import {MAP_MODEL_WIDTH, MAP_MODEL_HEIGHT} from './markers/getPositionStyles';

const MAP_ARGS: [number, number] = [MAP_MODEL_WIDTH, MAP_MODEL_HEIGHT];

export default memo(function Map3d() {
  const paths = useStore(({paths}) => paths);
  const texture = useTexture(mapImage);
  const renderedPaths = [];
  for (const [, path] of paths) {
    renderedPaths.push(<MapPath key={path.id} path={path} />);
  }
  return (
    <group>
      <mesh receiveShadow>
        <planeGeometry args={MAP_ARGS} />
        <meshStandardMaterial map={texture} side={DoubleSide} />
      </mesh>
      {renderedPaths}
    </group>
  );
});
