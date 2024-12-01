import useWebSocket from './useWebSocket';
import Map from './Map';
import Toolbar from './Toolbar';

export default function App() {
  const {connected, states} = useWebSocket();
  return (
    <div>
      <Map states={states} />
      <Toolbar connected={connected} />
    </div>
  );
}
