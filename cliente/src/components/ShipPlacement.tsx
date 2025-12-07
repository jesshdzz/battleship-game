import { useState, type JSX } from 'react';
import { DndContext, type DragEndEvent, type DragStartEvent, DragOverlay, useDraggable, useDroppable } from '@dnd-kit/core';
import { type Ship, type CellState, type ShipType, type Coordinate } from '../types';

// --- CONFIGURACIÓN ---
const colors = {
  ally: {
    primary: '#3B82F6', // Blue 500
    secondary: '#1E40AF', // Blue 800
    accent: '#60A5FA', // Blue 400
    light: '#DBEAFE', // Blue 100
    glow: 'rgba(59, 130, 246, 0.5)',
    bg: 'bg-slate-900',
    text: 'text-blue-100',
    panel: 'bg-slate-800/50 border-blue-500/30'
  },
  enemy: {
    primary: '#EF4444', // Red 500
    secondary: '#991B1B', // Red 800
    accent: '#F87171', // Red 400
    light: '#FEE2E2', // Red 100
    glow: 'rgba(239, 68, 68, 0.5)',
    bg: 'bg-neutral-900',
    text: 'text-red-100',
    panel: 'bg-neutral-800/50 border-red-500/30'
  }
};


type ColorPalette = typeof colors.ally;

const SHIPS: { id: ShipType; name: string; size: number; desc: string; viewBox?: string; renderTop: (c: ColorPalette) => JSX.Element; renderProfile: (c: ColorPalette) => JSX.Element }[] = [
  {
    id: 'carrier',
    name: "Portaaviones Clase Titán",
    size: 5,
    desc: "Plataforma de despliegue aéreo masivo. Lento pero estratégico.",
    viewBox: '0 0 300 80',
    renderTop: (c) => (
      <g>
        {/* Hull */}
        <path d="M 10,25 L 20,5 L 280,5 L 290,25 L 290,55 L 280,75 L 20,75 L 10,55 Z" fill={c.secondary} stroke={c.light} strokeWidth="2" />
        <rect x="25" y="15" width="250" height="50" rx="2" fill="#334155" stroke={c.primary} strokeWidth="1" />

        {/* Runway Markings */}
        <line x1="40" y1="40" x2="260" y2="40" stroke="white" strokeWidth="2" strokeDasharray="10,10" opacity="0.8" />
        <path d="M 30,25 L 60,55 M 30,55 L 60,25" stroke={c.accent} strokeWidth="2" opacity="0.5" />

        {/* Control Tower */}
        <rect x="180" y="8" width="40" height="12" rx="2" fill={c.primary} stroke={c.light} />
        <circle cx="190" cy="14" r="3" fill={c.accent} />

        {/* Details */}
        <rect x="260" y="20" width="15" height="40" fill={c.secondary} opacity="0.5" />
        <rect x="40" y="20" width="10" height="40" fill={c.secondary} opacity="0.5" />
      </g>
    ),
    renderProfile: (c) => (
      <g>
        {/* Hull */}
        <path d="M 10,40 L 30,60 L 270,60 L 290,40 Z" fill={c.secondary} stroke={c.primary} strokeWidth="2" />
        {/* Deck */}
        <rect x="5" y="30" width="290" height="10" fill="#334155" stroke={c.light} strokeWidth="1" />
        {/* Tower */}
        <path d="M 180,30 L 180,10 L 210,10 L 215,30 Z" fill={c.primary} stroke={c.light} />
        {/* Antennas */}
        <line x1="190" y1="10" x2="190" y2="0" stroke={c.accent} strokeWidth="2" />
        <line x1="200" y1="10" x2="205" y2="2" stroke={c.accent} strokeWidth="2" />
      </g>
    )
  },
  {
    id: 'battleship',
    name: "Acorazado MK-IV",
    size: 4,
    desc: "Blindaje pesado y artillería de largo alcance.",
    viewBox: '20 10 220 60',
    renderTop: (c) => (
      <g>
        {/* Hull */}
        <path d="M 20,40 L 60,10 L 230,10 L 240,40 L 230,70 L 60,70 Z" fill={c.secondary} stroke={c.light} strokeWidth="2" />
        {/* Deck structure */}
        <rect x="80" y="20" width="120" height="40" rx="5" fill={c.primary} opacity="0.8" />

        {/* Turrets Front */}
        <circle cx="70" cy="40" r="12" fill="#334155" stroke={c.light} />
        <rect x="45" y="36" width="25" height="3" fill="#94A3B8" /> {/* Barrel */}
        <rect x="45" y="41" width="25" height="3" fill="#94A3B8" /> {/* Barrel */}

        {/* Turrets Back */}
        <circle cx="210" cy="40" r="12" fill="#334155" stroke={c.light} />
        <rect x="222" y="36" width="25" height="3" fill="#94A3B8" />
        <rect x="222" y="41" width="25" height="3" fill="#94A3B8" />

        {/* Center */}
        <rect x="120" y="30" width="40" height="20" fill={c.accent} />
      </g>
    ),
    renderProfile: (c) => (
      <g>
        {/* Hull */}
        <path d="M 10,45 L 50,65 L 220,65 L 240,50 L 240,45 Z" fill={c.secondary} stroke={c.primary} strokeWidth="2" />
        {/* Superstructure */}
        <path d="M 100,45 L 100,20 L 160,20 L 170,45 Z" fill={c.primary} stroke={c.light} />
        <rect x="110" y="10" width="40" height="10" fill={c.accent} />
        {/* Guns Side View */}
        <path d="M 60,45 L 70,35 L 90,35 L 90,45 Z" fill="#334155" />
        <rect x="40" y="38" width="30" height="4" fill="#94A3B8" />
      </g>
    )
  },
  {
    id: 'submarine',
    name: "Submarino Fantasma",
    size: 3,
    desc: "Sigiloso. Diseñado para ataques sorpresa bajo el agua.",
    viewBox: '30 15 200 50',
    renderTop: (c) => (
      <g>
        {/* Hull (Cigar shape) */}
        <path d="M 30,40 Q 30,15 80,15 L 200,20 Q 230,22 230,40 Q 230,58 200,60 L 80,65 Q 30,65 30,40 Z" fill={c.secondary} stroke={c.light} strokeWidth="2" />

        {/* Conning Tower */}
        <rect x="110" y="30" width="40" height="20" rx="5" fill={c.primary} stroke={c.accent} />
        <circle cx="130" cy="40" r="6" fill={c.bg} /> {/* Hatch */}

        {/* Propeller/Fins */}
        <path d="M 220,40 L 235,25 M 220,40 L 235,55" stroke={c.accent} strokeWidth="3" />
      </g>
    ),
    renderProfile: (c) => (
      <g>
        {/* Main Body */}
        <path d="M 20,40 Q 20,25 60,25 L 200,25 Q 240,25 240,40 Q 240,55 200,55 L 60,55 Q 20,55 20,40 Z" fill={c.secondary} stroke={c.primary} strokeWidth="2" />

        {/* Tower */}
        <path d="M 110,25 L 115,10 L 140,10 L 145,25 Z" fill={c.primary} stroke={c.light} />

        {/* Periscope */}
        <line x1="125" y1="10" x2="125" y2="2" stroke={c.accent} strokeWidth="3" />
        <line x1="125" y1="2" x2="135" y2="2" stroke={c.accent} strokeWidth="3" />

        {/* Tail fins */}
        <path d="M 220,40 L 235,30 L 235,50 Z" fill={c.accent} />
      </g>
    )
  },
  {
    id: 'cruiser',
    name: "Crucero Interceptor",
    size: 3,
    desc: "Equilibrio perfecto entre velocidad y potencia de fuego.",
    viewBox: '15 15 175 50',
    renderTop: (c) => (
      <g>
        {/* Hull */}
        <path d="M 15,40 L 50,15 L 180,15 L 190,40 L 180,65 L 50,65 Z" fill={c.secondary} stroke={c.light} strokeWidth="2" />

        {/* Deck Detail */}
        <path d="M 60,25 L 160,25 L 160,55 L 60,55 Z" fill="none" stroke={c.primary} strokeWidth="1" />

        {/* Radar Dish */}
        <circle cx="120" cy="40" r="10" fill="none" stroke={c.accent} strokeWidth="2" />
        <line x1="120" y1="30" x2="120" y2="50" stroke={c.accent} />
        <line x1="110" y1="40" x2="130" y2="40" stroke={c.accent} />

        {/* Small turrets */}
        <circle cx="50" cy="40" r="6" fill={c.primary} />
        <circle cx="170" cy="40" r="6" fill={c.primary} />
      </g>
    ),
    renderProfile: (c) => (
      <g>
        {/* Hull */}
        <path d="M 10,45 L 40,60 L 180,60 L 195,45 Z" fill={c.secondary} stroke={c.primary} strokeWidth="2" />

        {/* Structures */}
        <rect x="70" y="25" width="30" height="20" fill={c.primary} stroke={c.light} />
        <rect x="110" y="30" width="40" height="15" fill={c.primary} stroke={c.light} />

        {/* Radar */}
        <circle cx="90" cy="20" r="8" fill="none" stroke={c.accent} strokeWidth="2" />

        {/* Antenna */}
        <line x1="130" y1="30" x2="140" y2="10" stroke={c.accent} strokeWidth="1" />
      </g>
    )
  },
  {
    id: 'destroyer',
    name: "Destructor Veloz",
    size: 2,
    desc: "Unidad de reconocimiento rápida y maniobrable.",
    viewBox: '10 30 140 25',
    renderTop: (c) => (
      <g>
        {/* Hull */}
        <path d="M 20,30 L 130,30 L 140,40 L 130,50 L 20,50 L 10,40 Z" fill={c.secondary} stroke={c.light} strokeWidth="2" />

        {/* Engine vents */}
        <rect x="30" y="35" width="10" height="10" fill={c.accent} />
        <rect x="50" y="35" width="10" height="10" fill={c.accent} />

        {/* Bridge */}
        <rect x="80" y="32" width="20" height="16" fill={c.primary} stroke={c.light} />
      </g>
    ),
    renderProfile: (c) => (
      <g>
        {/* Hull */}
        <path d="M 5,45 L 20,55 L 130,55 L 140,45 Z" fill={c.secondary} stroke={c.primary} strokeWidth="2" />

        {/* Top structure */}
        <path d="M 70,45 L 75,30 L 100,30 L 105,45 Z" fill={c.primary} stroke={c.light} />

        {/* Antenna */}
        <line x1="90" y1="30" x2="80" y2="15" stroke={c.accent} strokeWidth="2" />
      </g>
    )
  }
];

// --- COMPONENTE DRAGGABLE (BARCO EN EL MUELLE) ---
const DraggableShip = ({ ship }: { ship: typeof SHIPS[0] }) => {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `dock-${ship.id}`,
    data: { ship, fromDock: true },
  });

  return (
    <div ref={setNodeRef}  {...listeners} {...attributes}
      className={`flex items-center gap-2 bg-slate-800 p-2 rounded cursor-grab hover:bg-slate-700 border border-slate-600 mb-2 shadow-lg touch-none ${isDragging ? 'opacity-50' : ''}`}>
      <div className={`w-8 h-8 flex items-center justify-center font-bold text-slate-300 bg-slate-900 rounded`}>
        {ship.size}
      </div>
      <div className="flex-1">
        <p className="text-xs text-slate-400 font-bold uppercase">{ship.name}</p>
        <div className="h-6 w-24 text-blue-400">
          <svg viewBox={ship.viewBox || "0 0 300 80"} className="w-full h-full" preserveAspectRatio="xMidYMid meet">
            {ship.renderProfile(colors.ally)}
          </svg>
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
  const [activeId, setActiveId] = useState<string | null>(null);

  // Barcos que faltan por colocar
  const availableShips = SHIPS.filter(s => !placedShips.some(ps => ps.type === s.id));

  // --- ALGORITMO ALEATORIO ---
  const randomize = () => {
    let attempts = 0;
    while (attempts < 100) { // Evitar bucle infinito
      const newShips: Ship[] = [];
      const newBoard = Array(10).fill(null).map(() => Array(10).fill('EMPTY'));
      let success = true;

      for (const shipConfig of SHIPS) {
        let placed = false;
        let shipAttempts = 0;
        while (!placed && shipAttempts < 50) {
          const horizontal = Math.random() > 0.5;
          const x = Math.floor(Math.random() * 10);
          const y = Math.floor(Math.random() * 10);

          if (canPlace(newBoard, x, y, shipConfig.size, horizontal)) {
            // Colocar
            const positions: Coordinate[] = [];
            for (let i = 0; i < shipConfig.size; i++) {
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

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  // --- EVENTO DROP ---
  const handleDragEnd = (event: DragEndEvent) => {
    setActiveId(null);
    const { active, over } = event;
    if (!over) return;

    // Extraer coordenadas de la celda donde soltamos (id="cell-x-y")
    const parts = (over.id as string).split('-');
    if (parts.length < 3) return;
    const x = parseInt(parts[1]);
    const y = parseInt(parts[2]);

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

  // Get active ship config for overlay
  const activeShipConfig = activeId ? SHIPS.find(s => activeId.includes(s.id)) : null;

  const getSizeClasses = (size: number, horizontal: boolean) => {
    // 32px (w-8) base, 40px (w-10) md base
    if (horizontal) {
      // Horizontal: Width varies, Height is 1 cell
      // Size 2: w-16 md:w-20
      // Size 3: w-24 md:w-[120px] (3*40=120)
      // Size 4: w-32 md:w-40
      // Size 5: w-40 md:w-[200px] (5*40=200)
      const wApps = {
        2: 'w-19 md:w-20',
        3: 'w-24 md:w-[120px]',
        4: 'w-32 md:w-40', // 4*32=128(w-32), 4*40=160(w-40)
        5: 'w-40 md:w-[200px]'
      }[size] || 'w-8';
      return `${wApps} h-8 md:h-10`;
    } else {
      // Vertical: Width is 1 cell, Height varies
      const hApps = {
        2: 'h-16 md:h-20',
        3: 'h-24 md:h-[120px]',
        4: 'h-32 md:h-40',
        5: 'h-40 md:h-[200px]'
      }[size] || 'h-8';
      return `w-8 md:w-10 ${hApps}`;
    }
  };

  return (
    <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="flex flex-col md:flex-row gap-8 w-full max-w-5xl mx-auto p-4 animate-fade-in relative">

        {/* PANEL IZQUIERDO: MUELLE */}
        <div className="w-full md:w-1/3 bg-slate-900 p-6 rounded-xl border border-slate-700 shadow-2xl h-fit">
          <h2 className="text-2xl font-bold text-blue-400 mb-4 flex items-center gap-2">
            ⚓ ASTILLERO
          </h2>

          <div className="flex gap-2 mb-6">
            <button onClick={() => setIsHorizontal(!isHorizontal)}
              className={`flex-1 py-2 px-4 rounded font-bold transition-all ${isHorizontal ? 'bg-blue-600 text-white shadow-blue-500/50 shadow-lg' : 'bg-green-600 text-white shadow-green-500/50 shadow-lg'}`}>
              ORIENTACIÓN {isHorizontal ? 'HORIZONTAL' : 'VERTICAL'}
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
        <div className="flex-1 flex flex-col items-center relative z-0">
          <h3 className="text-slate-400 mb-2">ARRASTRA LOS BARCOS AL MAPA</h3>
          <PlacementBoard board={board} placedShips={placedShips} />
        </div>
      </div>

      <DragOverlay zIndex={50} className="cursor-grabbing">
        {activeShipConfig ? (
          <div
            className={`opacity-90 ${getSizeClasses(activeShipConfig.size, isHorizontal)}`}
          >
            <div className="w-full h-full text-blue-400 relative">
              {isHorizontal ? (
                <svg viewBox={activeShipConfig.viewBox || "0 0 300 80"} className="w-full h-full" preserveAspectRatio="none">
                  {activeShipConfig.renderTop(colors.ally)}
                </svg>
              ) : (
                <div style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  width: `${activeShipConfig.size * 100}%`, // Width = Size * (ContainerWidth). But ContainerWidth=1cell. So width=Size cells.
                  height: `${100 / activeShipConfig.size}%`, // Height = 1cell.
                  transform: 'translate(-50%, -50%) rotate(90deg)',
                }}>
                  <svg viewBox={activeShipConfig.viewBox || "0 0 300 80"} className="w-full h-full" preserveAspectRatio="none">
                    {activeShipConfig.renderTop(colors.ally)}
                  </svg>
                </div>
              )}
            </div>
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
};

// Componente interno para hacer las celdas "Droppables"
const PlacementBoard = ({ board, placedShips }: { board: CellState[][], placedShips: Ship[] }) => {
  return (
    <div className="relative border-4 border-slate-700 shadow-2xl bg-slate-900">
      <div className="grid grid-cols-10 gap-0.5 bg-slate-700 p-0.5 relative z-10">
        {board.map((row, y) => row.map((cell, x) => (
          <PlacementCell key={`${x}-${y}`} x={x} y={y} cell={cell} />
        )))}
      </div>

      {/* CAPA DE BARCOS RENDERIZADOS */}
      <div className="absolute top-0.5 left-0.5 w-full h-full pointer-events-none z-20 overflow-hidden">
        {placedShips.map(ship => {
          const isHorizontal = ship.positions[0].y === ship.positions[1]?.y;
          if (ship.positions.length === 1 && ship.size > 1) {
            // Should not happen
          }
          const x = ship.positions[0].x;
          const y = ship.positions[0].y;

          const left = `${x * 10}%`;
          const top = `${y * 10}%`;
          const width = isHorizontal ? `${ship.size * 10}%` : `10%`;
          const height = isHorizontal ? `10%` : `${ship.size * 10}%`;

          const shipConfig = SHIPS.find(s => s.id === ship.type);
          if (!shipConfig) return null;

          return (
            <div key={ship.id} style={{ left, top, width, height }} className="absolute text-blue-400">
              {isHorizontal ? (
                <div className="w-full h-full">
                  <svg viewBox={shipConfig.viewBox || "0 0 300 80"} className="w-full h-full" preserveAspectRatio="none">
                    {shipConfig.renderTop(colors.ally)}
                  </svg>
                </div>
              ) : (
                // Vertical Logic using absolute center positioning + rotation
                <div style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  // The container is 1xSize. We want to place a Sizex1 horizontal ship in it and rotate.
                  // Inner dimensions must match the Horizontal size relative to the Vertical container.
                  // Width of Inner = Size * ContainerWidth (10%)? No.
                  // Width of Inner = Size units. Container Width = 1 unit.
                  // So Width = Size * 100% of container width? No. Size * 100% = Size units. Correct.
                  width: `${ship.size * 100}%`,
                  // Height of Inner = 1 unit. Container Height = Size units.
                  // So Height = (1/Size) * 100% of container height.
                  height: `${100 / ship.size}%`,
                  transform: 'translate(-50%, -50%) rotate(90deg)',
                }} >
                  <svg viewBox={shipConfig.viewBox || "0 0 300 80"} className="w-full h-full" preserveAspectRatio="none">
                    {shipConfig.renderTop(colors.ally)}
                  </svg>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

const PlacementCell = ({ x, y, cell }: { x: number, y: number, cell: CellState }) => {
  const { setNodeRef, isOver } = useDroppable({ id: `cell-${x}-${y}` });

  return (
    <div ref={setNodeRef}
      className={`w-8 h-8 md:w-10 md:h-10 flex items-center justify-center border border-slate-800/50 transition-colors
        ${cell === 'SHIP' ? 'bg-slate-800/50' : 'bg-slate-900'} /* Ya no usamos color solido para SHIP */
        ${isOver ? 'bg-blue-500/50' : ''}
      `}
    >
      {/* Debug: {x},{y} */}
    </div>
  );
};