import {memo, Fragment} from 'react';
import classNames from 'classnames';
import type {WorldStateItem, Army} from '../types';
import styles from './Map.module.css';
import mapImage from './assets/map-test.jpg';

// const IMAGE_WIDTH = 5000;
// const IMAGE_HEIGHT = 4297;

function getPositionStyles(x: number, y: number, width: number, height: number) {
  return {
    top: `${((height - y) / height) * 100}%`,
    left: `${(x / width) * 100}%`,
  };
}

interface MapProps {
  states: WorldStateItem[];
}

export default memo(function MapProps({states}: MapProps) {
  return (
    <div className={styles.map}>
      <img src={mapImage} className={styles.image} />
      <div className={styles.offsetHack}>
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
              <div
                key={aircraft.id}
                className={classNames({
                  [styles.aircraft]: true,
                  [styles.army1]: army.id === 1,
                  [styles.army2]: army.id === 2,
                })}
                style={getPositionStyles(aircraft.x, aircraft.y, battle_area.w, battle_area.h)}
              />
            );
          }
          return <Fragment key={mission_time}>{renderedAircraft}</Fragment>;
        })}
      </div>
    </div>
  );
});
