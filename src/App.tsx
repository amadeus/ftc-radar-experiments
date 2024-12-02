import useWebSocket from './useWebSocket';
import Map3d from './Map3d';
import {Canvas} from '@react-three/fiber';
import {OrbitControls} from '@react-three/drei';
import Toolbar from './Toolbar';

function Controls() {
  // const {camera} = useThree();
  return (
    <OrbitControls
      enableRotate={false}
      enablePan
      mouseButtons={{
        LEFT: 2,
        RIGHT: 2,
        MIDDLE: 1,
      }}
    />
  );
}

export default function App() {
  const {connected, states} = useWebSocket();
  return (
    <>
      <Canvas
        style={{height: '100vh', backgroundColor: 'black'}}
        camera={{
          position: [0, -10, 8], // Start at a tilted position
          fov: 10,
        }}>
        <Controls />
        <Map3d states={states} />
        <ambientLight intensity={0.5} />
        <directionalLight position={[0, 0, 5]} />
      </Canvas>
      <Toolbar connected={connected} />
    </>
  );
}
