import {memo} from 'react';
import type {WebsocketConnectionState} from '../types';
import styles from './Toolbar.module.css';

interface ToolbarProps {
  connected: WebsocketConnectionState;
  setDebugMode(debugMode: boolean): void;
  debugMode: boolean;
}

export default memo(function Toolbar({connected, setDebugMode, debugMode}: ToolbarProps) {
  return (
    <div className={styles.fixedWrapper}>
      WebSocket Status: {connected}
      <button className={styles.button} onClick={() => setDebugMode(!debugMode)}>
        {debugMode ? 'Disable' : 'Enable'} Debug Mode
      </button>
    </div>
  );
});
