import {useRef, useEffect, useState} from 'react';
import DebugContext from './DebugContext';
import useWebSocket from './useWebSocket';
import Map from './Map';
import {Canvas, useThree} from '@react-three/fiber';
import {OrbitControls} from '@react-three/drei';
import Toolbar from './Toolbar';
import {Vector3} from 'three';
import Clock from './Clock';
import type {Tuple} from '../types';

const MIN_Z_CAMERA = 0.8273704858012328;
const MAX_Z_CAMERA = 6.386383017550268;
const Z_TUPLE: Tuple = [MIN_Z_CAMERA, MAX_Z_CAMERA];

const MIN_X_PAN_MULTIPLY = 0.00028;
const MAX_X_PAN_MULTIPLY = 0.00214;
const X_TUPLE: Tuple = [MIN_X_PAN_MULTIPLY, MAX_X_PAN_MULTIPLY];

const MIN_Y_PAN_MULTIPLY = -0.00035;
const MAX_Y_PAN_MULTIPLY = -0.00258;
const Y_TUPLE: Tuple = [MIN_Y_PAN_MULTIPLY, MAX_Y_PAN_MULTIPLY];

function mapRange(val: number, [a1, a2]: Tuple, [b1, b2]: Tuple) {
  if (a1 === a2) throw new Error('Invalid range: a1 cannot equal a2.');
  return b1 + ((val - a1) / (a2 - a1)) * (b2 - b1);
}

function Controls() {
  const {gl, camera} = useThree();
  const ref = useRef<any>(null);
  useEffect(() => {
    return;
    // NOTE(amadeus): Keeping this around to experiment with more in the future, I need to learn a bit more about cameras
    let mouse = new Vector3();
    let dragging = false;
    const onMouseMove = ({clientX, clientY}: MouseEvent) => {
      if (!dragging) return;
      const newMouse = new Vector3(clientX, clientY, 0);
      // mouse.set(newMouse)
      ref.current.target.sub(
        newMouse
          .clone()
          .sub(mouse)
          .multiply(
            new Vector3(mapRange(camera.position.z, Z_TUPLE, X_TUPLE), mapRange(camera.position.z, Z_TUPLE, Y_TUPLE), 1)
          )
      );
      mouse = newMouse;
    };
    const onMouseDown = ({button, clientX, clientY}: MouseEvent) => {
      if (button !== 0 || dragging) return;
      dragging = true;
      mouse.set(clientX, clientY, 0);
      gl.domElement.addEventListener('mousemove', onMouseMove);
      window.addEventListener('mouseup', onMouseUp);
    };
    const onMouseUp = (event: MouseEvent) => {
      if (!dragging || event.button !== 0) return;
      cleanUp();
    };
    const cleanUp = () => {
      dragging = false;
      gl.domElement.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
    gl.domElement.addEventListener('mousedown', onMouseDown);
    return () => {
      cleanUp();
      gl.domElement.removeEventListener('mousedown', onMouseDown);
    };
  }, [gl, camera]);

  return (
    <OrbitControls
      ref={ref}
      screenSpacePanning
      enableRotate={true}
      enablePan={true}
      enableDamping={false}
      minDistance={1}
      maxDistance={8}
      // Slightly below horizontal
      minPolarAngle={Math.PI / 2 + 0.6}
      // A bit more downward range
      maxPolarAngle={Math.PI - 0.4}
      minAzimuthAngle={0}
      maxAzimuthAngle={0}
      mouseButtons={{LEFT: 2, RIGHT: 0, MIDDLE: 1}}
    />
  );
}

export default function App() {
  const connected = useWebSocket();
  const [debugMode, setDebugMode] = useState(false);
  return (
    <DebugContext.Provider value={debugMode}>
      <Canvas style={{height: '100vh', backgroundColor: 'black'}} camera={{position: [0, 0, 5], fov: 40}} shadows>
        <Controls />
        <Map />
        <ambientLight intensity={0.5} />
        <directionalLight position={[-2, -3, 5]} castShadow shadow-mapSize-width={8192} shadow-mapSize-height={8192} />
      </Canvas>
      <Toolbar connected={connected} setDebugMode={setDebugMode} debugMode={debugMode} />
      <Clock />
    </DebugContext.Provider>
  );
}
