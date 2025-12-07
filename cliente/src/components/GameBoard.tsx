import { motion } from 'framer-motion';
import { type CellState, type Ship } from '../types';
import { SHIPS, colors } from './ShipDefinitions';

interface GameBoardProps {
  board: CellState[][];
  isEnemy?: boolean;
  onCellClick?: (x: number, y: number) => void;
  ships?: Ship[];      // Nueva prop para los barcos
  disabled?: boolean;
}

export const GameBoard = ({ board, isEnemy, onCellClick, ships = [], disabled }: GameBoardProps) => {

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
      <div className={`absolute -inset-2 bg-gradient-to-br ${isEnemy ? 'from-red-900 to-slate-900' : 'from-blue-900 to-slate-900'} rounded-lg -z-10 shadow-2xl`}></div>

      {/* Grid */}
      <div className="grid grid-cols-10 gap-px bg-slate-700 border-2 border-slate-600 shadow-inner relative z-0">
        {board.map((row, y) => row.map((cell, x) => {

          let bgClass = "bg-slate-900";
          // Mantenemos la lógica de background simple para retro-compatibilidad visual de "SHIP" cell state,
          // pero la imagen real del barco va en el overlay.

          if (cell === 'HIT') bgClass = "bg-red-900/50"; // Fondo rojo quemado
          if (cell === 'MISS') bgClass = "bg-blue-900/30";

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
                <div className="absolute inset-0 opacity-0 hover:opacity-100 flex items-center justify-center pointer-events-none z-20">
                  <div className="w-4 h-4 border-2 border-red-500 rounded-full animate-ping"></div>
                </div>
              )}
            </div>
          );
        }))}
      </div>

      {/* CAPA DE BARCOS */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none z-1 overflow-hidden">
        {ships.map(ship => {
          // Lógica de visualización:
          // 1. Si no es enemigo (soy yo), mostrar SIEMPRE.
          // 2. Si es enemigo, mostrar SOLO si está hundido (sunk).
          const isVisible = !isEnemy || ship.sunk;

          if (!isVisible) return null;

          const shipConfig = SHIPS.find(s => s.id === ship.type);
          if (!shipConfig) return null;

          const isHorizontal = ship.positions[0].y === ship.positions[1]?.y;
          const x = ship.positions[0].x;
          const y = ship.positions[0].y;

          const left = `${x * 10}%`;
          const top = `${y * 10}%`;
          const width = isHorizontal ? `${ship.size * 10}%` : `10%`;
          const height = isHorizontal ? `10%` : `${ship.size * 10}%`;

          // Colores: Si está hundido (sea mio o enemigo), usar paleta "quemada" o roja
          // Si es mio y está vivo, usar ally colors.
          const palette = ship.sunk
            ? { ...colors.enemy, secondary: '#450a0a', primary: '#7f1d1d', light: '#991b1b', accent: '#000' } // Dark burnt style
            : colors.ally;

          return (
            <motion.div
              key={ship.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              style={{ left, top, width, height }}
              className="absolute z-0"
            >
              {isHorizontal ? (
                <div className="w-full h-full">
                  <svg viewBox={shipConfig.viewBox || "0 0 300 80"} className="w-full h-full" preserveAspectRatio="none">
                    {shipConfig.renderTop(palette)}
                  </svg>
                </div>
              ) : (
                <div style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  width: `${ship.size * 100}%`,
                  height: `${100 / ship.size}%`,
                  transform: 'translate(-50%, -50%) rotate(90deg)',
                }} >
                  <svg viewBox={shipConfig.viewBox || "0 0 300 80"} className="w-full h-full" preserveAspectRatio="none">
                    {shipConfig.renderTop(palette)}
                  </svg>
                </div>
              )}
            </motion.div>
          );
        })}
      </div>

    </div>
  );
};