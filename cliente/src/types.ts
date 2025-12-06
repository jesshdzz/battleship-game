export type PlayerId = string; // El Socket ID
export type RoomId = string;   // Código de la sala (ej: "XJ9-12")

export type Coordinate = {
    x: number;
    y: number;
};

// --- BARCOS ---
export type ShipType = 'carrier' | 'battleship' | 'cruiser' | 'submarine' | 'destroyer';

export interface Ship {
    id: string;
    type: ShipType;
    size: number;
    positions: Coordinate[]; // Dónde está colocado
    hits: number;            // Cuántas veces le han dado
    sunk: boolean;           // ¿Hundido?
}

// --- TABLERO ---
// El estado de una celda para mostrar en pantalla
export type CellState = 'EMPTY' | 'SHIP' | 'HIT' | 'MISS';

// --- ESTADO DEL JUEGO ---
export interface Player {
    id: PlayerId;
    name: string;
    ready: boolean;      // ¿Ya puso sus barcos?
    ships: Ship[];
    myBoard: CellState[][];    // Tablero propio
    shotsFired: Coordinate[];  // Historial de disparos hechos
    enemyBoard: CellState[][]; // Tablero de rastreo (mis disparos)
}

export interface GameState {
    roomId: RoomId;
    players: Player[];   // Máximo 2 jugadores
    status: 'LOBBY' | 'PLACING_SHIPS' | 'PLAYING' | 'GAME_OVER';
    turn: PlayerId;      // ID del jugador que le toca disparar
    winner: PlayerId | null;
}

// --- EVENTOS DE SOCKET ---
// Estos son los nombres de los mensajes que enviaremos
export const EVENTS = {
    JOIN_ROOM: 'join_room',
    CREATE_ROOM: 'create_room',
    GAME_UPDATE: 'game_update', // El servidor envía el estado nuevo
    PLACE_SHIP: 'place_ship',
    FIRE_SHOT: 'fire_shot',
    ERROR: 'error_msg'
}