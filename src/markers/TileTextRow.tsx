import {useMemo, memo} from 'react';
import {Text} from '@react-three/drei';
import {RED, BLUE, YELLOW, WHITE, BLACK} from './constants';

type RowType = 'top' | 'middle' | 'bottom';

const RowConstants = {
  bottom: {
    position: [0.031, 0.016, 0],
    rotation: [0, 0, Math.PI / 6.3] as [number, number, number],
    textRotation: [0, Math.PI / 2, 0] as [number, number, number],
  },
  middle: {
    position: [0.015, 0.047, 0],
    rotation: [0, 0, Math.PI / 6.3] as [number, number, number],
    textRotation: [0, Math.PI / 2, 0] as [number, number, number],
  },
  top: {
    position: [-0.001, 0.078, 0],
    rotation: [0, 0, Math.PI / 6.3] as [number, number, number],
    textRotation: [0, Math.PI / 2, 0] as [number, number, number],
  },
} as const;

const TILE_SIZE = 0.028;
const TILE_ARGS = [0.001, TILE_SIZE, TILE_SIZE] as [number, number, number];
const TILE_SPACING_SIZE = TILE_SIZE + 0.001;

const TEXT_PROPS = {
  position: [0.001, 0, 0] as [number, number, number],
  fontSize: 0.03,
  fontWeight: 'bold',
};

function getGroupPosition(rowType: RowType, offset: number): [number, number, number] {
  const [x, y, z] = RowConstants[rowType].position;
  return [x, y, z + offset];
}

interface TileTextRowProps {
  row: RowType;
  text: string;
  army: number;
}

export default memo(function TileTextRow({row, text, army}: TileTextRowProps) {
  const {renderedMeshes, position, rotation} = useMemo(() => {
    const {rotation, textRotation} = RowConstants[row];
    const letters = text.split('');
    const renderedMeshes: React.ReactNode[] = [];
    const {textColor, tileColor} = (() => {
      if (row === 'top' && army === 1) {
        return {textColor: WHITE, tileColor: RED};
      } else if (row === 'top') {
        return {textColor: BLACK, tileColor: YELLOW};
      }
      if (row === 'middle') {
        return {textColor: WHITE, tileColor: RED};
      }
      return {textColor: WHITE, tileColor: BLUE};
    })();

    // Top row prefixes
    if (row === 'top' && army === 1) {
      renderedMeshes.push(
        <mesh position={[0, 0, 0.029 * 0 * -1]} key="prefix" castShadow receiveShadow>
          <boxGeometry args={TILE_ARGS} />
          <meshStandardMaterial color={WHITE} />
          <Text {...TEXT_PROPS} rotation={textRotation} color={RED}>
            F
          </Text>
        </mesh>
      );
    } else if (row === 'top') {
      renderedMeshes.push(
        <mesh position={[0, 0, 0.029 * 0 * -1]} key="prefix" castShadow receiveShadow>
          <boxGeometry args={TILE_ARGS} />
          <meshStandardMaterial color={tileColor} />
          <Text {...TEXT_PROPS} rotation={textRotation} color={textColor}>
            H
          </Text>
        </mesh>
      );
    }

    for (const letter of letters) {
      const index = renderedMeshes.length;
      renderedMeshes.push(
        <mesh position={[0, 0, 0.029 * index * -1]} key={index} castShadow receiveShadow>
          <boxGeometry args={TILE_ARGS} />
          <meshStandardMaterial color={tileColor} />
          <Text {...TEXT_PROPS} rotation={textRotation} color={textColor}>
            {letter.toUpperCase()}
          </Text>
        </mesh>
      );
    }
    return {
      renderedMeshes,
      position: getGroupPosition(row, (renderedMeshes.length * TILE_SPACING_SIZE) / 2 - TILE_SPACING_SIZE / 2),
      rotation,
    };
  }, [text, army, row]);
  return (
    <group position={position} rotation={rotation}>
      {renderedMeshes}
    </group>
  );
});
