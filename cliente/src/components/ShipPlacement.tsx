import { useState } from 'react';
import { GameBoard } from './GameBoard';
import {  type CellState, type Ship, type Coordinate } from '../types';

// Definición local de los barcos disponibles para colocar
const AVAILABLE_SHIPS = [
  { name: 'Portaaviones', size: 5, id: 'carrier' },
  { name: 'Acorazado', size: 4, id: 'battleship' },
  { name: 'Crucero', size: 3, id: 'cruiser' },
  { name: 'Submarino', size: 3, id: 'submarine' },
  { name: 'Destructor', size: 2, id: 'destroyer' },
];

interface ShipPlacementProps {
  onShipsPlaced: (ships: Ship[]) => void; // Callback cuando termine
}

export const ShipPlacement = ({ onShipsPlaced }: ShipPlacementProps) => {
  // Estado local del tablero de previsualización
  const [board, setBoard] = useState<CellState[][]>(Array(10).fill(null).map(() => Array(10).fill('EMPTY')));
  const [placedShips, setPlacedShips] = useState<Ship[]>([]);
  const [currentShipIndex, setCurrentShipIndex] = useState(0);
  const [isHorizontal, setIsHorizontal] = useState(true);

  const currentShipToPlace = AVAILABLE_SHIPS[currentShipIndex];

  // Lógica para validar si cabe
  const canPlaceShip = (x: number, y: number, size: number, horizontal: boolean) => {
    // 1. Límites del mapa
    if (horizontal && x + size > 10) return false;
    if (!horizontal && y + size > 10) return false;

    // 2. Colisión con otros barcos
    for (let i = 0; i < size; i++) {
      const cx = horizontal ? x + i : x;
      const cy = horizontal ? y : y + i;
      if (board[cy][cx] !== 'EMPTY') return false;
    }
    return true;
  };

  const handleCellClick = (x: number, y: number) => {
    if (!currentShipToPlace) return;

    if (canPlaceShip(x, y, currentShipToPlace.size, isHorizontal)) {
      // 1. Calcular coordenadas
      const positions: Coordinate[] = [];
      const newBoard = [...board.map(row => [...row])]; // Copia profunda

      for (let i = 0; i < currentShipToPlace.size; i++) {
        const cx = isHorizontal ? x + i : x;
        const cy = isHorizontal ? y : y + i;
        positions.push({ x: cx, y: cy });
        newBoard[cy][cx] = 'SHIP'; // Pintar en el tablero visual
      }

      // 2. Guardar el barco
      const newShip: Ship = {
        id: `${currentShipToPlace.id}-${Date.now()}`, // ID único temporal
        type: currentShipToPlace.id as any,
        size: currentShipToPlace.size,
        hits: 0,
        sunk: false,
        positions
      };

      setPlacedShips([...placedShips, newShip]);
      setBoard(newBoard);
      setCurrentShipIndex(prev => prev + 1); // Pasar al siguiente barco
    } else {
      alert("¡No cabe aquí o choca con otro barco!");
    }
  };

  const handleReset = () => {
    setBoard(Array(10).fill(null).map(() => Array(10).fill('EMPTY')));
    setPlacedShips([]);
    setCurrentShipIndex(0);
  };

  const handleFinish = () => {
    onShipsPlaced(placedShips);
  };

  // Si ya colocó todos
  if (!currentShipToPlace) {
    return (
      <div className="text-center animate-fade-in">
        <h2 className="text-2xl text-green-400 mb-4">¡Flota lista para el despliegue!</h2>
        <div className="flex justify-center gap-4">
          <button onClick={handleReset} className="px-4 py-2 bg-red-600 rounded hover:bg-red-500">Reiniciar</button>
          <button onClick={handleFinish} className="px-6 py-2 bg-green-600 rounded font-bold hover:bg-green-500 shadow-lg shadow-green-500/50">
            CONFIRMAR FLOTA E INICIAR
          </button>
        </div>
        <div className="mt-8 opacity-50 pointer-events-none">
           <GameBoard board={board} />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row gap-8 items-start justify-center">
      {/* Controles */}
      <div className="bg-slate-800 p-6 rounded-lg shadow-xl w-full md:w-64">
        <h3 className="text-xl text-blue-300 mb-4">Colocar Flota</h3>
        
        <div className="mb-6 p-4 bg-slate-900 rounded border border-slate-700">
          <p className="text-sm text-slate-400">Colocando:</p>
          <p className="text-xl font-bold text-white">{currentShipToPlace.name}</p>
          <p className="text-xs text-slate-500">Tamaño: {currentShipToPlace.size} casillas</p>
        </div>

        <button 
          onClick={() => setIsHorizontal(!isHorizontal)}
          className="w-full mb-4 py-3 bg-blue-600 hover:bg-blue-500 rounded text-white font-bold transition-all"
        >
          Rotar: {isHorizontal ? 'HORIZONTAL ⮕' : 'VERTICAL ⬇'}
        </button>

        <p className="text-xs text-slate-400 text-center">
          Haz clic en el tablero para colocar el barco.
        </p>
      </div>

      {/* Tablero Interactivo */}
      <div>
        <GameBoard 
          board={board} 
          onCellClick={handleCellClick}
        />
      </div>
    </div>
  );
};