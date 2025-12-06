import {type CellState, type Coordinate } from '../types';

interface GameBoardProps {
  board: CellState[][];          // La matriz de datos 10x10
  isEnemy?: boolean;             // ¿Es el tablero enemigo? (Para cambiar colores/cursores)
  onCellClick?: (x: number, y: number) => void; // Función al hacer clic
  showShips?: boolean;           // ¿Debemos mostrar los barcos? (No en el enemigo)
  disabled?: boolean;            // Para bloquear clics cuando no es tu turno
}

export const GameBoard = ({ 
  board, 
  isEnemy = false, 
  onCellClick, 
  showShips = true,
  disabled = false
}: GameBoardProps) => {

  // Función para decidir el color de la celda según su estado
  const getCellClass = (cell: CellState, x: number, y: number) => {
    const base = "w-8 h-8 md:w-10 md:h-10 border border-slate-700 flex items-center justify-center text-lg transition-all duration-200";
    
    // Si está deshabilitado o ya fue disparado, cursor default. Si no, pointer.
    const cursor = disabled || cell === 'HIT' || cell === 'MISS' ? 'cursor-default' : 'cursor-pointer hover:bg-slate-700';
    
    // Lógica visual de estados
    if (cell === 'HIT') return `${base} bg-red-500 border-red-600 animate-pulse`; // ¡Impacto!
    if (cell === 'MISS') return `${base} bg-blue-900/50 text-blue-400`; // Agua
    
    if (cell === 'SHIP') {
      // Si es enemigo, NO mostramos el barco (salvo que sea debug/final)
      if (isEnemy && !showShips) return `${base} bg-slate-800 ${cursor}`;
      return `${base} bg-gray-400 border-gray-500 ${cursor}`; // Barco visible
    }

    // Celda vacía (mar)
    return `${base} bg-slate-800 ${cursor}`;
  };

  return (
    <div className="flex flex-col items-center">
      {/* Etiquetas de Columnas (A-J) o (0-9) */}
      <div className="flex mb-1">
        <div className="w-6" /> {/* Espaciador para las filas */}
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="w-8 md:w-10 text-center text-xs text-slate-500 font-mono">
            {i}
          </div>
        ))}
      </div>

      <div className="flex">
        {/* Etiquetas de Filas (0-9) */}
        <div className="flex flex-col mr-1">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="h-8 md:h-10 flex items-center justify-center text-xs text-slate-500 font-mono w-6">
              {i}
            </div>
          ))}
        </div>

        {/* LA GRID 10x10 */}
        <div className="grid grid-cols-10 border-2 border-slate-600 bg-slate-900 shadow-2xl">
          {board.map((row, y) => (
            row.map((cell, x) => (
              <div 
                key={`${x}-${y}`}
                className={getCellClass(cell, x, y)}
                onClick={() => !disabled && onCellClick?.(x, y)}
              >
                {/* Iconos opcionales dentro de la celda */}
                {cell === 'HIT' && '💥'}
                {cell === 'MISS' && '💧'}
              </div>
            ))
          ))}
        </div>
      </div>
    </div>
  );
};