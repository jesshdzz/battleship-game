import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { customAlphabet } from 'nanoid';
import { EVENTS, GameState, Player, Coordinate, Ship } from './types';
import { processShot, checkVictory, createEmptyBoard } from './gameUtils';

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*", methods: ["GET", "POST"] } // Permitimos cualquier origen por ahora
});

const nanoid = customAlphabet('ABCDEFGHIJKLMNOPQRSTUVWXYZ', 5);
const games: Record<string, GameState> = {};

io.on('connection', (socket) => {
  console.log('Dev Backend: Usuario conectado', socket.id);

  // --- CREAR SALA ---
  socket.on(EVENTS.CREATE_ROOM, (playerName: string) => {
    const roomId = nanoid();
    const newPlayer: Player = {
      id: socket.id,
      name: playerName,
      ready: false,
      ships: [],
      myBoard: createEmptyBoard(), // Tablero propio (donde me disparan)
      shotsFired: [],
      enemyBoard: createEmptyBoard() // Tablero de rastreo (mis disparos)
    };

    games[roomId] = {
      roomId,
      players: [newPlayer],
      status: 'LOBBY',
      turn: '', // Se decide al empezar
      winner: null
    };

    socket.join(roomId);
    socket.emit(EVENTS.GAME_UPDATE, games[roomId]);
    console.log(`Sala ${roomId} creada.`);
  });

  // --- UNIRSE A SALA ---
  socket.on(EVENTS.JOIN_ROOM, ({ roomId, playerName }: { roomId: string, playerName: string }) => {
    const game = games[roomId];
    if (!game || game.players.length >= 2) {
      socket.emit(EVENTS.ERROR, 'Sala no válida o llena');
      return;
    }

    const newPlayer: Player = {
      id: socket.id,
      name: playerName,
      ready: false,
      ships: [],
      myBoard: createEmptyBoard(),
      shotsFired: [],
      enemyBoard: createEmptyBoard()
    };

    game.players.push(newPlayer);
    game.status = 'PLACING_SHIPS'; // Ambos entran, comienza la fase de colocar
    
    socket.join(roomId);
    io.to(roomId).emit(EVENTS.GAME_UPDATE, game);
  });

  // --- COLOCAR BARCOS (Aquí recibimos la flota del frontend) ---
  socket.on(EVENTS.PLACE_SHIP, ({ roomId, ships }: { roomId: string, ships: Ship[] }) => {
    const game = games[roomId];
    if (!game) return;

    const player = game.players.find(p => p.id === socket.id);
    if (!player) return;

    // TODO: Aquí podrías añadir validación extra (que los barcos no se solapen)
    // Por ahora confiamos en que el Frontend manda coordenadas válidas.
    
    player.ships = ships;
    player.ready = true;

    // ¿Están ambos listos?
    const allReady = game.players.length === 2 && game.players.every(p => p.ready);
    
    if (allReady) {
      game.status = 'PLAYING';
      game.turn = game.players[0].id; // Empieza el anfitrión
      console.log(`Juego en sala ${roomId}: ¡Fase de combate iniciada!`);
    }

    io.to(roomId).emit(EVENTS.GAME_UPDATE, game);
  });

  // --- DISPARAR ---
  socket.on(EVENTS.FIRE_SHOT, ({ roomId, x, y }: { roomId: string, x: number, y: number }) => {
    const game = games[roomId];
    if (!game || game.status !== 'PLAYING') return;

    if (game.turn !== socket.id) {
      socket.emit(EVENTS.ERROR, '¡No es tu turno!');
      return;
    }

    const attackerIndex = game.players.findIndex(p => p.id === socket.id);
    const defenderIndex = attackerIndex === 0 ? 1 : 0; // El otro jugador

    const attacker = game.players[attackerIndex];
    const defender = game.players[defenderIndex];

    // Procesar la lógica matemática del disparo
    const { result, hitShipName } = processShot(attacker, defender, x, y);

    if (result === 'INVALID') return; // Clickó en un lugar repetido

    console.log(`Disparo en ${roomId}: [${x},${y}] -> ${result}`);

    // Verificar Victoria
    const isDefenderDefeated = checkVictory(defender);
    
    if (isDefenderDefeated) {
      game.status = 'GAME_OVER';
      game.winner = attacker.id;
      // Revelamos todo el mapa al final
    } else {
      if (result === 'HIT' || result === 'SUNK') {
        game.turn = socket.id;
      } else {
        game.turn = defender.id;
      }  
    }

    io.to(roomId).emit(EVENTS.GAME_UPDATE, game);
  });
  
  // Limpieza básica al desconectar
  socket.on('disconnect', () => {
    // Para un MVP, si uno se va, la sala queda "zombie" o se borra.
    // Lo dejaremos simple por ahora.
  });

  socket.on(EVENTS.SURRENDER, ({ roomId }: { roomId: string }) => {
    const game = games[roomId];
    if (!game || game.status !== 'PLAYING') return;

    // Identificar quién se rinde y quién gana
    const loserId = socket.id;
    const winner = game.players.find(p => p.id !== loserId);

    if (winner) {
      game.winner = winner.id;
      game.status = 'GAME_OVER'; // Esto activará la pantalla de fin de juego
      
      // Opcional: Podrías agregar un campo "reason" al gameState si quieres
      // mostrar un mensaje específico como "Victoria por rendición".
      
      io.to(roomId).emit(EVENTS.GAME_UPDATE, game);
    }
  });

});

const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Backend de Battleship listo en puerto ${PORT}`);
});