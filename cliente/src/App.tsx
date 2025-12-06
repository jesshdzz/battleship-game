import { useEffect, useState } from 'react';
import io, { Socket } from 'socket.io-client';
import { EVENTS } from './types';
import type { GameState } from './types';

const socket: Socket = io('http://localhost:3000');

function App() {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [playerName, setPlayerName] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    // Escuchar actualizaciones del juego
    socket.on(EVENTS.GAME_UPDATE, (game: GameState) => {
      setGameState(game);
      setError(''); // Limpiar errores si todo va bien
    });

    socket.on(EVENTS.ERROR, (msg: string) => {
      setError(msg);
    });

    return () => {
      socket.off(EVENTS.GAME_UPDATE);
      socket.off(EVENTS.ERROR);
    };
  }, []);

  const createRoom = () => {
    if (!playerName) return alert('Escribe tu nombre');
    socket.emit(EVENTS.CREATE_ROOM, playerName);
  };

  const joinRoom = () => {
    if (!playerName || !roomCode) return alert('Faltan datos');
    socket.emit(EVENTS.JOIN_ROOM, { roomId: roomCode.toUpperCase(), playerName });
  };

  // --- VISTA: DENTRO DEL JUEGO (LOBBY) ---
  if (gameState) {
    return (
      <div className="min-h-screen bg-slate-900 text-white p-8 font-mono">
        <h1 className="text-3xl text-yellow-400 mb-4">Sala: {gameState.roomId}</h1>

        <div className="bg-slate-800 p-6 rounded-lg mb-8">
          <h2 className="text-xl mb-4">Jugadores:</h2>
          <ul>
            {gameState.players.map((p, i) => (
              <li key={p.id} className="text-lg py-2 border-b border-slate-700">
                {i + 1}. {p.name} {p.id === socket.id ? '(Tú)' : ''}
              </li>
            ))}
          </ul>

          {gameState.players.length < 2 && (
            <p className="mt-4 text-gray-400 animate-pulse">Esperando a tu oponente...</p>
          )}

          {gameState.players.length === 2 && (
            <p className="mt-4 text-green-400 font-bold">¡Oponente encontrado! La batalla comenzará pronto.</p>
          )}
        </div>
      </div>
    );
  }

  // --- VISTA: MENÚ PRINCIPAL ---
  return (
    <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center font-mono">
      <div className="max-w-md w-full bg-slate-900 p-8 rounded-xl shadow-2xl border border-slate-800">
        <h1 className="text-4xl font-bold text-center text-blue-500 mb-8 tracking-tighter">BATTLESHIP</h1>

        {error && <div className="bg-red-500/20 text-red-400 p-3 mb-4 rounded text-center text-sm">{error}</div>}

        <div className="space-y-4">
          <div>
            <label className="block text-xs uppercase text-slate-400 mb-1">Tu Nombre de Capitán</label>
            <input
              type="text"
              className="w-full bg-slate-800 border border-slate-700 p-3 rounded text-white focus:outline-none focus:border-blue-500"
              placeholder="Ej: Jack Sparrow"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
            />
          </div>

          <button
            onClick={createRoom}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded transition-all"
          >
            CREAR NUEVA FLOTA
          </button>

          <div className="relative flex py-2 items-center">
            <div className="flex-grow border-t border-slate-700"></div>
            <span className="flex-shrink mx-4 text-slate-500 text-xs">O ÚNETE A UNA</span>
            <div className="flex-grow border-t border-slate-700"></div>
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              className="flex-1 bg-slate-800 border border-slate-700 p-3 rounded text-white uppercase placeholder:normal-case"
              placeholder="Código de Sala"
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value)}
            />
            <button
              onClick={joinRoom}
              className="bg-slate-700 hover:bg-slate-600 px-6 rounded font-bold text-slate-200"
            >
              UNIRSE
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;