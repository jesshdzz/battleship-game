import { useState } from 'react';
import { DndContext, type DragEndEvent, useDraggable, useDroppable } from '@dnd-kit/core';
import { GameBoard } from './GameBoard';
import {  type Ship, type CellState, type ShipType, type Coordinate } from '../types';
import { ShipIcon } from './ShipIcons';

// --- CONFIGURACIÓN ---
const SHIPS_CONFIG: { id: ShipType; name: string; size: number }[] = [
  { id: 'carrier', name: 'Portaaviones', size: 5 },
  { id: 'battleship', name: 'Acorazado', size: 4 },
  { id: 'cruiser', name: 'Crucero', size: 3 },
  { id: 'submarine', name: 'Submarino', size: 3 },
  { id: 'destroyer', name: 'Destructor', size: 2 },
];

// --- COMPONENTE DRAGGABLE (BARCO EN EL MUELLE) ---
const DraggableShip = ({ ship }: { ship: typeof SHIPS_CONFIG[0] }) => {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: `dock-${ship.id}`,
    data: { ship, fromDock: true },
  });

  const style = transform ? { transform: `translate3d(${transform.x}js, ${transform.y}px, 0)` } : undefined;

  return (
    <div ref={setNodeRef} style={style} {...listeners} {...attributes} 
         className="flex items-center gap-2 bg-slate-800 p-2 rounded cursor-grab active:cursor-grabbing hover:bg-slate-700 border border-slate-600 mb-2 shadow-lg touch-none">
      <div className={`w-8 h-8 flex items-center justify-center font-bold text-slate-300 bg-slate-900 rounded`}>
        {ship.size}
      </div>
      <div className="flex-1">
        <p className="text-xs text-slate-400 font-bold uppercase">{ship.name}</p>
        <div className="h-6 w-24 text-blue-400">
           <ShipIcon type={ship.id} />
        </div>
      </div>
    </div>
  );
};

// --- LOGICA PRINCIPAL ---
export const ShipPlacement = ({ onShipsPlaced }: { onShipsPlaced: (ships: Ship[]) => void }) => {
  const [board, setBoard] = useState<CellState[][]>(Array(10).fill(null).map(() => Array(10).fill('EMPTY')));
  const [placedShips, setPlacedShips] = useState<Ship[]>([]);
  const [isHorizontal, setIsHorizontal] = useState(true);

  // Barcos que faltan por colocar
  const availableShips = SHIPS_CONFIG.filter(s => !placedShips.some(ps => ps.type === s.id));

  // --- ALGORITMO ALEATORIO ---
  const randomize = () => {
    let attempts = 0;
    while (attempts < 100) { // Evitar bucle infinito
      const newShips: Ship[] = [];
      const newBoard = Array(10).fill(null).map(() => Array(10).fill('EMPTY'));
      let success = true;

      for (const shipConfig of SHIPS_CONFIG) {
        let placed = false;
        let shipAttempts = 0;
        while (!placed && shipAttempts < 50) {
          const horizontal = Math.random() > 0.5;
          const x = Math.floor(Math.random() * 10);
          const y = Math.floor(Math.random() * 10);
          
          if (canPlace(newBoard, x, y, shipConfig.size, horizontal)) {
             // Colocar
             const positions: Coordinate[] = [];
             for(let i=0; i<shipConfig.size; i++) {
               const cx = horizontal ? x + i : x;
               const cy = horizontal ? y : y + i;
               newBoard[cy][cx] = 'SHIP';
               positions.push({ x: cx, y: cy });
             }
             newShips.push({ id: `${shipConfig.id}-${Date.now()}`, type: shipConfig.id, size: shipConfig.size, hits: 0, sunk: false, positions });
             placed = true;
          }
          shipAttempts++;
        }
        if (!placed) { success = false; break; }
      }

      if (success) {
        setBoard(newBoard);
        setPlacedShips(newShips);
        return;
      }
      attempts++;
    }
    alert("No se pudo generar una configuración válida. Intenta de nuevo.");
  };

  const canPlace = (currentBoard: CellState[][], x: number, y: number, size: number, horizontal: boolean) => {
    if (horizontal && x + size > 10) return false;
    if (!horizontal && y + size > 10) return false;
    for (let i = 0; i < size; i++) {
      const cx = horizontal ? x + i : x;
      const cy = horizontal ? y : y + i;
      if (currentBoard[cy][cx] !== 'EMPTY') return false;
    }
    return true;
  };

  // --- EVENTO DROP ---
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;

    // Extraer coordenadas de la celda donde soltamos (id="cell-x-y")
    const [_, xStr, yStr] = (over.id as string).split('-');
    const x = parseInt(xStr);
    const y = parseInt(yStr);

    const shipConfig = active.data.current?.ship;
    
    if (shipConfig && canPlace(board, x, y, shipConfig.size, isHorizontal)) {
      // Colocar barco
      const positions: Coordinate[] = [];
      const newBoard = board.map(row => [...row]);
      
      for (let i = 0; i < shipConfig.size; i++) {
         const cx = isHorizontal ? x + i : x;
         const cy = isHorizontal ? y : y + i;
         newBoard[cy][cx] = 'SHIP';
         positions.push({ x: cx, y: cy });
      }

      setBoard(newBoard);
      setPlacedShips([...placedShips, {
        id: `${shipConfig.id}-${Date.now()}`,
        type: shipConfig.id,
        size: shipConfig.size,
        hits: 0,
        sunk: false,
        positions
      }]);
    }
  };

  const resetBoard = () => {
    setBoard(Array(10).fill(null).map(() => Array(10).fill('EMPTY')));
    setPlacedShips([]);
  };

  return (
    <DndContext onDragEnd={handleDragEnd}>
      <div className="flex flex-col md:flex-row gap-8 w-full max-w-5xl mx-auto p-4 animate-fade-in">
        
        {/* PANEL IZQUIERDO: MUELLE */}
        <div className="w-full md:w-1/3 bg-slate-900 p-6 rounded-xl border border-slate-700 shadow-2xl h-fit">
          <h2 className="text-2xl font-bold text-blue-400 mb-4 flex items-center gap-2">
            ⚓ ASTILLERO
          </h2>
          
          <div className="flex gap-2 mb-6">
            <button onClick={() => setIsHorizontal(!isHorizontal)} 
              className={`flex-1 py-2 px-4 rounded font-bold transition-all ${isHorizontal ? 'bg-blue-600 text-white shadow-blue-500/50 shadow-lg' : 'bg-slate-700 text-slate-400'}`}>
              {isHorizontal ? 'HORIZONTAL ⮕' : 'VERTICAL ⬇'}
            </button>
            <button onClick={randomize} className="bg-purple-600 hover:bg-purple-500 text-white p-2 rounded" title="Aleatorio">
              🎲
            </button>
             <button onClick={resetBoard} className="bg-red-600 hover:bg-red-500 text-white p-2 rounded" title="Borrar todo">
              🗑️
            </button>
          </div>

          <div className="space-y-2 min-h-[200px]">
            {availableShips.length === 0 ? (
              <div className="text-center p-4 bg-green-900/30 border border-green-500/50 rounded text-green-400 animate-pulse">
                ✅ Flota lista para combate
              </div>
            ) : (
              availableShips.map(ship => <DraggableShip key={ship.id} ship={ship} />)
            )}
          </div>

          {availableShips.length === 0 && (
            <button onClick={() => onShipsPlaced(placedShips)} className="w-full mt-8 bg-green-500 hover:bg-green-400 text-black font-black py-4 rounded-lg shadow-xl transform hover:scale-105 transition-all">
              ¡DESPLEGAR FLOTA! ⚔️
            </button>
          )}
        </div>

        {/* PANEL DERECHO: TABLERO DROP */}
        <div className="flex-1 flex flex-col items-center">
          <h3 className="text-slate-400 mb-2">ARRASTRA LOS BARCOS AL MAPA</h3>
          
          {/* Usamos GameBoard pero inyectamos lógica de Droppable */}
          <PlacementBoard board={board} />
        </div>
      </div>
    </DndContext>
  );
};

// Componente interno para hacer las celdas "Droppables"
const PlacementBoard = ({ board }: { board: CellState[][] }) => {
  return (
    <div className="grid grid-cols-10 gap-0.5 bg-slate-700 p-0.5 border-4 border-slate-700 shadow-2xl">
      {board.map((row, y) => row.map((cell, x) => (
        <PlacementCell key={`${x}-${y}`} x={x} y={y} cell={cell} />
      )))}
    </div>
  );
};

const PlacementCell = ({ x, y, cell }: { x: number, y: number, cell: CellState }) => {
  const { setNodeRef, isOver } = useDroppable({ id: `cell-${x}-${y}` });
  
  return (
    <div ref={setNodeRef} 
      className={`w-8 h-8 md:w-10 md:h-10 flex items-center justify-center border border-slate-800/50 transition-colors
        ${cell === 'SHIP' ? 'bg-gray-500 border-gray-400' : 'bg-slate-900'}
        ${isOver ? 'bg-blue-500/50' : ''}
      `}
    >
      {cell === 'SHIP' && <div className="w-full h-full bg-slate-600/50"></div>}
    </div>
  );
};