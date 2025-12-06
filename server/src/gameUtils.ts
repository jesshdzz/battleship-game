import { GameState, Player, Ship, Coordinate, CellState } from './types';

// verificar si una coordenada está dentro del tablero 10x10
export const isValidCoordinate = (c: Coordinate): boolean => {
  return c.x >= 0 && c.x < 10 && c.y >= 0 && c.y < 10;
};

// Lógica de Disparo
export const processShot = (
  attacker: Player,
  defender: Player,
  x: number,
  y: number
): { result: 'HIT' | 'MISS' | 'SUNK' | 'INVALID', hitShipName?: string } => {
  
  const alreadyShot = attacker.shotsFired.some(s => s.x === x && s.y === y);
  if (alreadyShot) return { result: 'INVALID' };

  attacker.shotsFired.push({ x, y });

  // Buscar impacto
  for (const ship of defender.ships) {
    const hitIndex = ship.positions.findIndex(pos => pos.x === x && pos.y === y);

    if (hitIndex !== -1) {
      ship.hits++;
      attacker.enemyBoard[y][x] = 'HIT';
      defender.myBoard[y][x] = 'HIT'; // Actualizamos el tablero del defensor también

      if (ship.hits >= ship.size) {
        ship.sunk = true;
        // Marcar todo el barco como hundido visualmente si quieres (opcional)
        return { result: 'SUNK', hitShipName: ship.type };
      }
      return { result: 'HIT' };
    }
  }

  attacker.enemyBoard[y][x] = 'MISS';
  defender.myBoard[y][x] = 'MISS'; // El defensor ve el agua
  return { result: 'MISS' };
};

// Verificar condición de victoria
export const checkVictory = (player: Player): boolean => {
  // Si todos los barcos están hundidos, perdió
  return player.ships.every(ship => ship.sunk);
};

// Generar tablero vacío 10x10 (para inicializar)
export const createEmptyBoard = (): CellState[][] => {
  return Array(10).fill(null).map(() => Array(10).fill('EMPTY'));
};