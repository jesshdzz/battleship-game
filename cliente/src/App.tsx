import { useEffect, useState } from 'react';
import io, { Socket } from 'socket.io-client';

// Conectamos al servidor (Backend URL)
const socket: Socket = io('http://localhost:3000');

function App() {
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Escuchar evento de conexión
    socket.on('connect', () => {
      console.log('¡Conectado al servidor con ID:', socket.id);
      setIsConnected(true);
    });

    // Escuchar evento de desconexión
    socket.on('disconnect', () => {
      console.log('Desconectado del servidor');
      setIsConnected(false);
    });

    // Limpieza al desmontar el componente
    return () => {
      socket.off('connect');
      socket.off('disconnect');
    };
  }, []);

  return (
    <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center">
      <div className="text-center p-8 bg-slate-800 rounded-lg shadow-xl">
        <h1 className="text-4xl font-bold mb-4 text-blue-400">Battleship Game</h1>
        <p className="text-xl">
          Estado del Servidor:{' '}
          <span className={isConnected ? 'text-green-500 font-bold' : 'text-red-500 font-bold'}>
            {isConnected ? 'ONLINE 🟢' : 'OFFLINE 🔴'}
          </span>
        </p>
      </div>
    </div>
  );
}

export default App;