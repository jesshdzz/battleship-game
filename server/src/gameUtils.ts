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

  // Validar si ya disparó ahí antes
  const alreadyShot = attacker.shotsFired.some(s => s.x === x && s.y === y);
  if (alreadyShot) return { result: 'INVALID' };

  // Registrar el disparo en el historial del atacante
  attacker.shotsFired.push({ x, y });

  // Buscar si impactó algún barco del defensor
  for (const ship of defender.ships) {
    const hitIndex = ship.positions.findIndex(pos => pos.x === x && pos.y === y);

    if (hitIndex !== -1) {
      // ¡IMPACTO!
      ship.hits++;
      
      // Actualizar el tablero "público" del atacante (lo que él ve del enemigo)
      attacker.enemyBoard[y][x] = 'HIT';

      // Verificar si se hundió
      if (ship.hits >= ship.size) {
        ship.sunk = true;
        return { result: 'SUNK', hitShipName: ship.type };
      }

      return { result: 'HIT' };
    }
  }

  // Si no encontró nada, es AGUA
  attacker.enemyBoard[y][x] = 'MISS';
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