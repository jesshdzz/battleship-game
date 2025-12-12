import { useEffect, useState, useRef } from 'react';
import io from 'socket.io-client';
import { EVENTS, type GameState, type Ship, type CellState } from './types';
import { GameBoard } from './components/GameBoard';
import { ShipPlacement } from './components/ShipPlacement';
import { InstructionsModal } from './components/InstructionsModal';
import { AboutUsModal } from './components/AboutUsModal';
import { useSound } from './hooks/useSound';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';
const socket = io(BACKEND_URL);

function App() {
  const { play, toggleSoundtrack } = useSound();
  const prevGameState = useRef<GameState | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(false);

  const [gameState, setGameState] = useState<GameState | null>(null);
  const [playerName, setPlayerName] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [myId, setMyId] = useState('');

  const [showInstructions, setShowInstructions] = useState(false);
  const [showAboutUs, setShowAboutUs] = useState(false);

  // Efecto para sockets
  useEffect(() => {
    socket.on('connect', () => setMyId(socket.id || ''));
    socket.on(EVENTS.GAME_UPDATE, (game: GameState) => {
      setGameState(game);
    });
    return () => { socket.off(EVENTS.GAME_UPDATE); };
  }, []);

  // Efecto para sonidos
  useEffect(() => {
    if (!gameState) return;
    const prev = prevGameState.current;

    // 1. Estados
    if (prev?.status !== gameState.status) {
      if (gameState.status === 'PLAYING') {
        play('start');
        if (soundEnabled) toggleSoundtrack(true);
      }
      if (gameState.status === 'GAME_OVER') {
        toggleSoundtrack(false);
        const iWon = gameState.winner === myId;
        play(iWon ? 'win' : 'lose');
      }
    }

    // 2. Hits/Misses
    if (gameState.status === 'PLAYING' && prev) {
      const countHits = (board: CellState[][]) => board.flat().filter(c => c === 'HIT').length;
      const countMiss = (board: CellState[][]) => board.flat().filter(c => c === 'MISS').length;

      const myShotsHits = countHits(gameState.players.find(p => p.id === myId)?.enemyBoard || []);
      const myShotsMiss = countMiss(gameState.players.find(p => p.id === myId)?.enemyBoard || []);

      const prevMyShotsHits = countHits(prev.players.find(p => p.id === myId)?.enemyBoard || []);
      const prevMyShotsMiss = countMiss(prev.players.find(p => p.id === myId)?.enemyBoard || []);

      if (myShotsHits > prevMyShotsHits) play('hit');
      if (myShotsMiss > prevMyShotsMiss) play('miss');

      // Enemy shots
      const enemyShotsHits = countHits(gameState.players.find(p => p.id === myId)?.myBoard || []);
      const prevEnemyShotsHits = countHits(prev.players.find(p => p.id === myId)?.myBoard || []);
      if (enemyShotsHits > prevEnemyShotsHits) play('hit');
    }

    prevGameState.current = gameState;
  }, [gameState, myId, play, toggleSoundtrack, soundEnabled]);

  const enableAudio = () => {
    setSoundEnabled(!soundEnabled);
    toggleSoundtrack(!soundEnabled);
  };

  // Botón flotante de sonido
  const SoundButton = () => (
    <button
      onClick={enableAudio}
      className="fixed top-4 right-4 z-50 bg-slate-800 p-2 rounded-full border border-slate-600 hover:bg-slate-700 text-xl"
      title={soundEnabled ? "Desactivar Sonido" : "Activar Sonido"}
    >
      {soundEnabled ? '🔊' : '🔇'}
    </button>
  );

  const createRoom = () => { 
    if (playerName) {
      socket.emit(EVENTS.CREATE_ROOM, playerName); 
    } else {
      alert('Por favor, ingresa un nombre de jugador.');
    }
  };
  const joinRoom = () => { 
    if (playerName && roomCode) {
      socket.emit(EVENTS.JOIN_ROOM, { roomId: roomCode.toUpperCase(), playerName }); 
    } else {
      alert('Por favor, ingresa un nombre de jugador y un código de sala.');
    }
  };

  const handleShipsPlaced = (ships: Ship[]) => {
    if (!gameState) return;
    socket.emit(EVENTS.PLACE_SHIP, { roomId: gameState.roomId, ships });
  };

  const handleAttack = (x: number, y: number) => {
    if (!gameState) return;
    // Evitar disparar si no es mi turno
    if (gameState.turn !== myId) return;
    socket.emit(EVENTS.FIRE_SHOT, { roomId: gameState.roomId, x, y });
  };

  // ... (debajo de handleAttack)

  const handleSurrender = () => {
    if (!gameState) return;

    // Confirmación para evitar clicks por error
    const confirm = window.confirm("¿Estás seguro de que quieres rendirte? Tu flota será destruida.");

    if (confirm) {
      socket.emit(EVENTS.SURRENDER, { roomId: gameState.roomId });
    }
  };

  // --- VISTA 1: LOGIN / LOBBY ---
  if (!gameState) {
    return (
      <div className="min-h-screen bg-slate-950 font-mono text-white relative">
        <InstructionsModal isOpen={showInstructions} onClose={() => setShowInstructions(false)} />
        <AboutUsModal isOpen={showAboutUs} onClose={() => setShowAboutUs(false)} />

        <div className="grid min-h-dvh grid-[auto_1fr_auto]">
          {/* Header */}
          <header className="flex flex-col items-center justify-center gap-4 px-6 py-6 max-w-6xl mx-auto w-full mt-4">
            <div className="text-3xl font-bold text-blue-500 tracking-tighter cursor-default select-none animate-pulse">
              Battleship Game
            </div>
            <button
              onClick={() => setShowInstructions(true)}
              className="bg-slate-900 text-slate-400 px-4 py-2 rounded-lg text-sm font-bold border border-slate-800 hover:bg-slate-800 hover:text-white transition-all hover:border-blue-500/50 shadow-lg"
            >
              📜 CÓMO JUGAR
            </button>
          </header>

          <div className="flex items-center justify-center p-4">
            <div className=' bg-slate-900 w-full max-w-md p-8 rounded-2xl shadow-2xl border border-slate-800 relative overflow-hidden group'>
              {/* Decorative gradient */}
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-cyan-500 to-blue-500 opacity-50"></div>

              <SoundButton />

              <h2 className="text-xl text-center mb-8 font-bold text-slate-200 tracking-wide">INICIAR MISIÓN</h2>

              <input className="w-full bg-slate-950 p-4 mb-4 border border-slate-800 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500/50 outline-none transition-all placeholder:text-slate-600 text-center font-bold" placeholder="TU ALIAS" value={playerName} onChange={e => setPlayerName(e.target.value)} />

              <button onClick={createRoom} className="w-full bg-blue-600 p-4 rounded-lg font-black tracking-widest mb-8 hover:bg-blue-500 hover:shadow-[0_0_20px_rgba(37,99,235,0.3)] transition-all active:scale-[0.98]">
                CREAR SALA
              </button>

              <div className="relative flex items-center gap-3 border-t border-slate-800 pt-6">
                <input className="flex-1 bg-slate-950 p-3 border border-slate-800 rounded-lg uppercase text-center tracking-[0.2em] font-mono focus:ring-1 focus:ring-yellow-500/50 outline-none transition-all placeholder:text-slate-700" placeholder="CÓDIGO" value={roomCode} onChange={e => setRoomCode(e.target.value)} />
                <button onClick={joinRoom} className="bg-slate-800 px-6 py-3 rounded-lg font-bold text-slate-300 hover:bg-slate-700 hover:text-white transition-colors border border-slate-700 hover:border-slate-500">
                  UNIRSE
                </button>
              </div>
            </div>
          </div>

          <footer className='flex items-end justify-center pb-8 text-sm'>
            <button
              onClick={() => setShowAboutUs(true)}
              className="text-slate-600 hover:text-blue-400 transition-colors flex items-center gap-2 px-4 py-2 rounded-full hover:bg-slate-900/50"
            >
              <span>ℹ️ Sobre Nosotros</span>
            </button>
          </footer>

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
      <div className="min-h-screen bg-slate-950 text-white p-4 flex flex-col items-center">
        <SoundButton />
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
        <SoundButton />
        <div className="mb-6 text-center">
          <h1 className="text-3xl font-bold mb-2">BATALLA NAVAL</h1>
          <div className={`text-xl px-6 py-2 rounded-full inline-block ${isMyTurn ? 'bg-green-500 animate-pulse' : 'bg-red-900/50'}`}>
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
              ships={enemy?.ships || []} // Pasamos los barcos para que se muestren SOLO si sunk=true
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
              ships={me?.ships || []} // Pasamos mis barcos
              disabled={true} // No puedo dispararme a mí mismo
            />
          </div>
        </div>

        {/* --- NUEVO BOTÓN DE RENDIRSE (Abajo y al centro) --- */}
        <div className="mt-8 flex justify-center">
          <button
            onClick={handleSurrender}
            className="flex items-center gap-2 bg-transparent border border-red-800 text-red-500 hover:bg-red-900/30 hover:text-red-200 px-6 py-2 rounded transition-all font-bold uppercase text-sm tracking-widest"
          >
            🏳️ Rendirse
          </button>
        </div>

        {/* LOG DEL JUEGO (Opcional) */}
        <div className="mt-8 text-slate-500 text-sm">
          Jugando contra: {enemy?.name || 'Desconocido'}
        </div>
      </div>
    );
  }

  // --- VISTA 5: GAME OVER ---
  // --- VISTA 5: GAME OVER ---
  if (gameState.status === 'GAME_OVER') {
    const iWon = gameState.winner === myId;

    return (
      <div className={`min-h-screen flex items-center justify-center relative overflow-hidden font-mono`}>
        {/* Fondo con color condicional */}
        <div className={`absolute inset-0 ${iWon ? 'bg-green-950' : 'bg-red-950'} opacity-90`}></div>

        <div className="relative z-10 text-center p-12 bg-black/40 rounded-2xl backdrop-blur-md border border-white/10 shadow-2xl max-w-lg mx-4">
          <div className="text-6xl mb-4">{iWon ? '🏆' : '💀'}</div>

          <h1 className={`text-5xl md:text-7xl font-black mb-2 tracking-tighter ${iWon ? 'text-green-400' : 'text-red-500'}`}>
            {iWon ? 'VICTORIA' : 'DERROTA'}
          </h1>

          <p className="text-xl md:text-2xl mb-8 text-slate-300 font-light">
            {iWon
              ? 'El enemigo ha sido eliminado.'
              : 'Tu flota ha sido destruida.'}
          </p>

          <button
            onClick={() => window.location.reload()}
            className="w-full px-8 py-4 bg-white hover:bg-slate-200 text-black font-black text-lg tracking-widest rounded-lg shadow-lg hover:scale-105 transition-all"
          >
            VOLVER A JUGAR
          </button>
        </div>
      </div>
    );
  }

  return <div>Cargando...</div>;
}

export default App;