import {memo} from 'react';
import type {WebsocketConnectionState} from '../types';
import styles from './Toolbar.module.css';

interface ToolbarProps {
  connected: WebsocketConnectionState;
}

export default memo(function Toolbar({connected}: ToolbarProps) {
  return <div className={styles.fixedWrapper}>WebSocket Status: {connected}</div>;
});
