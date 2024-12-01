import useWebSocket from './useWebSocket';

export default function App() {
  const {connected} = useWebSocket();
  return (
    <div>
      FTC Radar App <strong>{connected}</strong>
    </div>
  );
}
