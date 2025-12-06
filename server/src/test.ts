// server/src/testSimulation.ts
import { processShot, checkVictory, createEmptyBoard } from './gameUtils';
import { Player, Ship } from './types';

console.log("--- INICIANDO SIMULACIÓN DE BATALLA ---\n");


const playerA: Player = {
  id: 'player-A',
  name: 'Capitán A',
  ready: true,
  ships: [],
  myBoard: createEmptyBoard(),
  shotsFired: [],
  enemyBoard: createEmptyBoard()
};

const playerB: Player = {
  id: 'player-B',
  name: 'Objetivo B', // Este será el que recibe los disparos
  ready: true,
  ships: [],
  myBoard: createEmptyBoard(),
  shotsFired: [],
  enemyBoard: createEmptyBoard()
};

// COLOCAR UN BARCO DE PRUEBA EN JUGADOR B
// Vamos a poner un "Destructor" (tamaño 2) en las coordenadas (0,0) y (1,0) -> Vertical
const testShip: Ship = {
  id: 'ship-1',
  type: 'destroyer',
  size: 2,
  hits: 0,
  sunk: false,
  positions: [{ x: 0, y: 0 }, { x: 0, y: 1 }] // x=0, y=0 y x=0, y=1
};

playerB.ships.push(testShip);
console.log(`Barco colocado en Jugador B en posiciones: [0,0] y [0,1]`);

// --- TEST 1: DISPARO AL AGUA ---
console.log("\nTEST 1: Disparo al agua en [5, 5]");
const result1 = processShot(playerA, playerB, 5, 5);
console.log(`Resultado: ${result1.result} (Esperado: MISS)`);

if (result1.result === 'MISS') console.log("PRUEBA SUPERADA");
else console.error("FALLO EN PRUEBA 1");


// --- TEST 2: PRIMER IMPACTO ---
console.log("\nTEST 2: Disparo certero en [0, 0]");
const result2 = processShot(playerA, playerB, 0, 0);
console.log(`Resultado: ${result2.result} (Esperado: HIT)`);

// Verificamos si se marcó en el barco
if (playerB.ships[0].hits === 1 && result2.result === 'HIT') console.log("PRUEBA SUPERADA (Daño registrado)");
else console.error("FALLO EN PRUEBA 2");


// --- TEST 3: DISPARAR AL MISMO SITIO (ERROR DE USUARIO) ---
console.log("\nTEST 3: Disparar de nuevo en [0, 0]");
const result3 = processShot(playerA, playerB, 0, 0);
console.log(`Resultado: ${result3.result} (Esperado: INVALID)`);

if (result3.result === 'INVALID') console.log("PRUEBA SUPERADA (Evitó disparo duplicado)");
else console.error("FALLO EN PRUEBA 3");


// --- TEST 4: HUNDIR EL BARCO ---
console.log("\nTEST 4: Disparo final en [0, 1]");
const result4 = processShot(playerA, playerB, 0, 1);
console.log(`Resultado: ${result4.result} (Esperado: SUNK)`);
console.log(`Barco afectado: ${result4.hitShipName}`);

if (result4.result === 'SUNK' && playerB.ships[0].sunk === true) console.log("PRUEBA SUPERADA (Barco hundido)");
else console.error("FALLO EN PRUEBA 4");


// --- TEST 5: VICTORIA ---
console.log("\nTEST 5: Chequeo de Victoria");
const isWinner = checkVictory(playerB); // Revisamos si B perdió (todos sus barcos hundidos)
console.log(`¿Jugador B derrotado?: ${isWinner}`);

if (isWinner) console.log("PRUEBA SUPERADA: Lógica de victoria correcta");
else console.error("FALLO EN PRUEBA 5");

console.log("\n--- FIN DE SIMULACIÓN ---");