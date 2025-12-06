import { motion } from 'framer-motion'; // ¡Animaciones!
import { type CellState } from '../types';
import { ShipIcon } from './ShipIcons'; // Importamos iconos si quisieramos renderizarlos en la grid

interface GameBoardProps {
  board: CellState[][];
  isEnemy?: boolean;
  onCellClick?: (x: number, y: number) => void;
  showShips?: boolean;
  disabled?: boolean;
}

export const GameBoard = ({ board, isEnemy, onCellClick, showShips, disabled }: GameBoardProps) => {

  const renderCellContent = (cell: CellState) => {
    if (cell === 'HIT') {
      return (
        <motion.div 
          initial={{ scale: 0 }} animate={{ scale: 1 }} 
          className="absolute inset-0 flex items-center justify-center bg-red-500/40 z-10"
        >
          <span className="text-xl md:text-2xl drop-shadow-md animate-bounce">💥</span>
        </motion.div>
      );
    }
    if (cell === 'MISS') {
      return (
        <motion.div 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="w-3 h-3 md:w-4 md:h-4 bg-blue-400/50 rounded-full"
        />
      );
    }
    return null;
  };

  return (
    <div className="relative">
      {/* Marco decorativo */}
      <div className="absolute -inset-2 bg-gradient-to-br from-slate-700 to-slate-800 rounded-lg -z-10 shadow-2xl"></div>

      {/* Grid */}
      <div className="grid grid-cols-10 gap-px bg-slate-700 border-2 border-slate-600 shadow-inner">
        {board.map((row, y) => row.map((cell, x) => {
          
          let bgClass = "bg-slate-900";
          if (cell === 'SHIP') {
             // Si soy el enemigo, no mostrar el barco (a menos que ya esté impactado, pero eso lo maneja el 'HIT')
             bgClass = (isEnemy && !showShips) ? "bg-slate-900" : "bg-slate-600";
          }
          if (cell === 'HIT') bgClass = "bg-red-900"; // Fondo rojo quemado
          if (cell === 'MISS') bgClass = "bg-blue-900";

          // Clase para cursor
          const canClick = !disabled && isEnemy && cell !== 'HIT' && cell !== 'MISS';
          
          return (
            <div 
              key={`${x}-${y}`}
              onClick={() => canClick && onCellClick?.(x, y)}
              className={`
                w-8 h-8 md:w-10 md:h-10 relative flex items-center justify-center
                ${bgClass}
                ${canClick ? 'cursor-crosshair hover:bg-slate-800' : 'cursor-default'}
                transition-colors duration-300
              `}
            >
              {renderCellContent(cell)}
              
              {/* Overlay de mira para el enemigo */}
              {canClick && (
                <div className="absolute inset-0 opacity-0 hover:opacity-100 flex items-center justify-center pointer-events-none">
                  <div className="w-2 h-2 border border-red-500 rounded-full"></div>
                </div>
              )}
            </div>
          );
        }))}
      </div>
    </div>
  );
};