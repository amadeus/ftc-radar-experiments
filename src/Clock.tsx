import {memo} from 'react';
import useStore from './Store';
import styles from './Clock.module.css';
import {getTimeAsNumbers} from './utils';

function getMinuteHandAngle(minutes: number, seconds: number) {
  return `translateY(-100%) translateX(0) rotate(${minutes * 6 + seconds * 0.1}deg)`;
}

function getHourHandAngle(hours: number, minutes: number) {
  return `translateY(-100%) translateX(0) rotate(${(hours % 12) * 30 + minutes * 0.5}deg)`;
}

export default memo(function Clock() {
  const missionTime = useStore(({missionTime}) => missionTime);
  const {hours, minutes, seconds} = getTimeAsNumbers(missionTime);
  return (
    <div className={styles.container}>
      <div className={styles.minuteHand} style={{transform: getMinuteHandAngle(minutes, seconds)}} />
      <div className={styles.hourHand} style={{transform: getHourHandAngle(hours, minutes)}} />
      <div className={styles.handCenter} />
    </div>
  );
});
