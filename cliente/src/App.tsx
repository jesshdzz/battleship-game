import { useEffect, useState } from 'react';
import io, { Socket } from 'socket.io-client';
import { EVENTS, type GameState, type Ship, type CellState } from './types';
import { GameBoard } from './components/GameBoard';
import { ShipPlacement } from './components/ShipPlacement';

// Reemplaza localhost por TU IP real que anotaste en el paso 1
// Ejemplo:
const socket: Socket = io('http://192.168.0.26:3000');

function App() {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [playerName, setPlayerName] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [myId, setMyId] = useState('');

  useEffect(() => {
    socket.on('connect', () => setMyId(socket.id || ''));
    
    socket.on(EVENTS.GAME_UPDATE, (game: GameState) => {
      setGameState(game);
    });

    return () => { socket.off(EVENTS.GAME_UPDATE); };
  }, []);

  const createRoom = () => { if(playerName) socket.emit(EVENTS.CREATE_ROOM, playerName); };
  const joinRoom = () => { if(playerName && roomCode) socket.emit(EVENTS.JOIN_ROOM, { roomId: roomCode.toUpperCase(), playerName }); };
  
  const handleShipsPlaced = (ships: Ship[]) => {
    if(!gameState) return;
    socket.emit(EVENTS.PLACE_SHIP, { roomId: gameState.roomId, ships });
  };

  const handleAttack = (x: number, y: number) => {
    if(!gameState) return;
    // Evitar disparar si no es mi turno
    if(gameState.turn !== myId) return; 
    socket.emit(EVENTS.FIRE_SHOT, { roomId: gameState.roomId, x, y });
  };

  // --- VISTA 1: LOGIN / LOBBY ---
  if (!gameState) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center font-mono text-white">
        <div className="bg-slate-900 p-8 rounded-xl shadow-2xl border border-slate-800 w-96">
          <h1 className="text-4xl text-center mb-8 font-bold text-blue-500">BATTLESHIP</h1>
          <input className="w-full bg-slate-800 p-3 mb-4 border border-slate-700 rounded" placeholder="Tu Nombre" value={playerName} onChange={e => setPlayerName(e.target.value)} />
          <button onClick={createRoom} className="w-full bg-blue-600 p-3 rounded font-bold mb-4 hover:bg-blue-500">CREAR SALA</button>
          <div className="flex gap-2">
            <input className="flex-1 bg-slate-800 p-3 border border-slate-700 rounded uppercase" placeholder="CÓDIGO" value={roomCode} onChange={e => setRoomCode(e.target.value)} />
            <button onClick={joinRoom} className="bg-slate-700 px-4 rounded font-bold hover:bg-slate-600">UNIRSE</button>
          </div>
        </div>
      </div>
    );
  }

  // Identificar quién soy yo y quién es el enemigo en el estado del juego
  const me = gameState.players.find(p => p.id === myId);
  const enemy = gameState.players.find(p => p.id !== myId);
  const isMyTurn = gameState.turn === myId;

  // --- VISTA 2: ESPERANDO RIVAL ---
  if (gameState.status === 'LOBBY') {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center">
        <h2 className="text-2xl mb-4">Sala: <span className="text-yellow-400 text-4xl font-mono">{gameState.roomId}</span></h2>
        <p className="animate-pulse text-slate-400">Esperando al segundo jugador...</p>
      </div>
    );
  }

  // --- VISTA 3: COLOCANDO BARCOS ---
  if (gameState.status === 'PLACING_SHIPS') {
    return (
      <div className="min-h-screen bg-slate-900 text-white p-4 flex flex-col items-center">
        <h1 className="text-2xl font-bold mb-8">PREPARAR FLOTA</h1>
        {me?.ready ? (
          <div className="text-center mt-20">
            <h2 className="text-3xl text-green-400 mb-4">¡Flota Desplegada!</h2>
            <p className="animate-pulse text-slate-400">Esperando a que el enemigo termine...</p>
          </div>
        ) : (
          <ShipPlacement onShipsPlaced={handleShipsPlaced} />
        )}
      </div>
    );
  }

  // --- VISTA 4: BATALLA (Juego Principal) ---
  if (gameState.status === 'PLAYING') {
    return (
      <div className="min-h-screen bg-slate-950 text-white p-2 md:p-8 flex flex-col items-center">
        <div className="mb-6 text-center">
          <h1 className="text-3xl font-bold mb-2">BATALLA NAVAL</h1>
          <div className={`text-xl px-6 py-2 rounded-full inline-block ${isMyTurn ? 'bg-green-600 animate-pulse' : 'bg-red-900/50'}`}>
            {isMyTurn ? '¡ES TU TURNO! ATACA' : 'ESPERANDO AL ENEMIGO...'}
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-8 md:gap-16 items-start">
          
          {/* TABLERO ENEMIGO (DONDE DISPARO) */}
          <div className="flex flex-col items-center">
            <h3 className="text-red-400 mb-2 font-bold flex items-center gap-2">
              RADAR ENEMIGO (ATAQUE) 🎯
            </h3>
            <GameBoard 
              board={me?.enemyBoard || []} 
              isEnemy={true}
              showShips={false} // ¡No mostrar barcos enemigos!
              onCellClick={handleAttack}
              disabled={!isMyTurn}
            />
          </div>

          {/* MI TABLERO (DONDE RECIBO) */}
          <div className="flex flex-col items-center opacity-80 scale-90 md:scale-100">
            <h3 className="text-blue-400 mb-2 font-bold flex items-center gap-2">
              MI FLOTA 🛡️
            </h3>
            <GameBoard 
              board={me?.myBoard || []} 
              isEnemy={false}
              showShips={true}
              disabled={true} // No puedo dispararme a mí mismo
            />
          </div>
        </div>

        {/* LOG DEL JUEGO (Opcional) */}
        <div className="mt-8 text-slate-500 text-sm">
          Jugando contra: {enemy?.name || 'Desconocido'}
        </div>
      </div>
    );
  }

  // --- VISTA 5: GAME OVER ---
  if (gameState.status === 'GAME_OVER') {
    const iWon = gameState.winner === myId;
    return (
      <div className={`min-h-screen flex items-center justify-center ${iWon ? 'bg-green-900' : 'bg-red-900'} text-white`}>
        <div className="text-center p-12 bg-black/30 rounded-xl backdrop-blur-sm">
          <h1 className="text-6xl font-black mb-4">{iWon ? '¡VICTORIA!' : 'DERROTA'}</h1>
          <p className="text-2xl mb-8">{iWon ? 'Has hundido la flota enemiga.' : 'Tu flota descansa en el fondo del mar.'}</p>
          <button onClick={() => window.location.reload()} className="px-8 py-3 bg-white text-black font-bold rounded hover:bg-gray-200">
            JUGAR DE NUEVO
          </button>
        </div>
      </div>
    );
  }

  return <div>Cargando...</div>;
}

export default App;