import {useContext, memo, useMemo} from 'react';
import DebugContext from '../DebugContext';
import {getRandomInteger} from '../utils';
import Arrow from './Arrow';
import PathInfoBlock from './PathInfoBlock';
import type {Path} from '../../types';
import useStableCallback from '../hooks/useStableCallback';

interface PathProps {
  path: Path;
}

export default memo(function Path({path}: PathProps) {
  const handleClick = useStableCallback(() => console.log(path));
  const debugMode = useContext(DebugContext);
  const debugColor = useMemo(
    () =>
      debugMode
        ? `rgb(${getRandomInteger(0, 255)},${getRandomInteger(0, 255)},${getRandomInteger(0, 255)})`
        : undefined,
    [debugMode]
  );

  const renderedLined: React.ReactNode[] = [];
  let i = 0;
  for (const point of path.points) {
    const nextPoint = path.points[i + 1];
    if (nextPoint != null) {
      renderedLined.push(
        <Arrow
          key={`${path.id}-${point.mission_time}`}
          start={point}
          target={nextPoint}
          army={path.army}
          overrideColor={debugColor}
        />
      );
    }
    i++;
  }
  const {x, y, z} = path.currentPosition;
  return (
    <>
      {renderedLined}
      <PathInfoBlock
        x={x}
        y={y}
        z={z}
        army={path.army}
        colorOverride={debugColor}
        units={path.units}
        displayId={path.displayId}
        onClick={handleClick}
      />
    </>
  );
});
