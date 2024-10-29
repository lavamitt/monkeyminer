import express from 'express';
import WebSocket, { WebSocketServer } from 'ws';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { createServer } from 'http';
import { GameState } from './game.js'
import { Zone } from './models/zone.js'
import {
  GRID_SIZE,
  WORLD_SIZE,
  BLOCK_TYPE,
  CHAT_MESSAGE_DURATION,
  WEBSOCKET_SERVER_TO_CLIENT_EVENTS,
  WEBSOCKET_CLIENT_TO_SERVER_EVENTS,
  GAME_RULES,
}  from '../shared/constants.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const server = createServer(app);
const wss = new WebSocketServer({ server });

// Serve static files from client directory
app.use(express.static(join(__dirname, '../client')));
app.use('/shared', express.static(join(__dirname, '../shared')));

const game = new GameState();

wss.on('connection', (ws) => {
    const clientId = Math.random().toString(36).substring(2, 9);
    game.addNewPlayer(clientId);

    // Send client their ID, initial state, and terrain
    ws.send(JSON.stringify({
        type: WEBSOCKET_SERVER_TO_CLIENT_EVENTS.INIT,
        id: clientId,
        ...game.toJSON()
    }));

    // Broadcast new player to others
    wss.clients.forEach(client => {
        if (client !== ws && client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({
                type: WEBSOCKET_SERVER_TO_CLIENT_EVENTS.PLAYER_JOIN,
                id: clientId,
                player: game.getPlayer(clientId).toJSON(),
            }));
        }
    });

    ws.on('message', (message) => {
        let data = {};
        try {
            data = JSON.parse(message);
        } catch (error) {
            console.error(`Invalid JSON received from client ${clientId}:`, error);
            ws.send(JSON.stringify({
                type: 'error',
                message: 'Invalid message format'
            }));
            return;
        }
    
        if (data.type === WEBSOCKET_CLIENT_TO_SERVER_EVENTS.MOVE) {
            game.movePlayer(clientId, data.x, data.y, data.direction);

            const player = players.get(clientId);
            if (player) {
                player.x = data.x;
                player.y = data.y;
                player.direction = data.direction;
        
                wss.clients.forEach(client => {
                    if (client.readyState === WebSocket.OPEN) {
                        client.send(JSON.stringify({
                            type: WEBSOCKET_SERVER_TO_CLIENT_EVENTS.PLAYER_MOVE,
                            id: clientId,
                            x: player.x,
                            y: player.y,
                            direction: player.direction
                        }));
                    }
                });

            
            
            if (zone && !zone.completed) {
                zone.currentMonkeys.add(clientId);
                if (zone.currentMonkeys.size >= zone.requiredMonkeys) {
                zone.completed = true;
                  
                  zone.currentMonkeys.forEach(playerId => {
                      const zonePlayer = players.get(playerId);
                      if (zonePlayer) {
                          zonePlayer.score += GAME_RULES.ZONE_COMPLETION_BASE_SCORE * zone.currentMonkeys.size;
                          zonePlayer.inventory.pop();  // Remove banana
                      }

                      wss.clients.forEach(client => {
                        if (client.readyState === WebSocket.OPEN) {
                          client.send(JSON.stringify({
                              type: WEBSOCKET_SERVER_TO_CLIENT_EVENTS.SCORE_UPDATE,
                              id: zonePlayer.id,
                              value: zonePlayer.score,
                            }))
                        }});
                      
                      wss.clients.forEach(client => {
                        if (client.readyState === WebSocket.OPEN) {
                          client.send(JSON.stringify({
                            type: WEBSOCKET_SERVER_TO_CLIENT_EVENTS.INVENTORY_UPDATE,
                            id: zonePlayer.id,
                            value: zonePlayer.inventory,
                            }))
                        }});
                    });
                }
                wss.clients.forEach(client => {
                  if (client.readyState === WebSocket.OPEN) {
                      client.send(JSON.stringify({
                          type: WEBSOCKET_SERVER_TO_CLIENT_EVENTS.ZONE_UPDATE,
                          key: zoneKey,
                          zone: {
                            ...zone,
                            currentMonkeys: Array.from(zone.currentMonkeys)
                          },
                      }));
                  }
              });
            }
        } else {
            // Remove player from any zones they were in
            for (let [zoneKey, zone] of zones) {
                if (zone.currentMonkeys.has(clientId)) {
                   zone.currentMonkeys.delete(clientId);
                   wss.clients.forEach(client => {
                    if (client.readyState === WebSocket.OPEN) {
                        client.send(JSON.stringify({
                            type: WEBSOCKET_SERVER_TO_CLIENT_EVENTS.ZONE_UPDATE,
                            key: zoneKey,
                            zone: {
                              ...zone,
                              currentMonkeys: Array.from(zone.currentMonkeys)
                            },
                        }));
                    }
                });
                }
            }
        }
      }
    } else if (data.type === WEBSOCKET_CLIENT_TO_SERVER_EVENTS.MINE) {
      const player = players.get(clientId);

      const blockX = data.blockX;
      const blockY = data.blockY;
      
      if (blockX >= 0 && blockX < WORLD_SIZE && 
          blockY >= 0 && blockY < WORLD_SIZE &&
          terrain[blockY][blockX] !== BLOCK_TYPE.EMPTY &&
          terrain[blockY][blockX] !== BLOCK_TYPE.EMPTY_WITH_BANANA &&
          terrain[blockY][blockX] !== BLOCK_TYPE.ZONE &&
          terrain[blockY][blockX] !== BLOCK_TYPE.EMPTY_WITH_ENVELOPE) {
        if (terrain[blockY][blockX] == BLOCK_TYPE.ORE) {
          player.score += GAME_RULES.MINE_ORE_SCORE;
        }

        if (Math.random() < GAME_RULES.BANANA_SPAWN_CHANCE) {
          terrain[blockY][blockX] = BLOCK_TYPE.EMPTY_WITH_BANANA;
        } else {
          terrain[blockY][blockX] = BLOCK_TYPE.EMPTY;
        }
        
        wss.clients.forEach(client => {
          if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({
              type: WEBSOCKET_SERVER_TO_CLIENT_EVENTS.TERRAIN_UPDATE,
              x: blockX,
              y: blockY,
              value: terrain[blockY][blockX]
            }));
          }
        });

        wss.clients.forEach(client => {
          if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({
              type: WEBSOCKET_SERVER_TO_CLIENT_EVENTS.SCORE_UPDATE,
                id: clientId,
                value: player.score,
              }))
          }});
      }
    } else if (data.type == WEBSOCKET_CLIENT_TO_SERVER_EVENTS.PICKUP) {
      const player = players.get(clientId);
      const blockX = data.blockX;
      const blockY = data.blockY;
      if (terrain[blockY][blockX] === BLOCK_TYPE.EMPTY_WITH_BANANA) {
        player.inventory.push("banana");

        terrain[blockY][blockX] = BLOCK_TYPE.EMPTY;
        wss.clients.forEach(client => {
          if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({
              type: WEBSOCKET_SERVER_TO_CLIENT_EVENTS.TERRAIN_UPDATE,
              x: blockX,
              y: blockY,
              value: terrain[blockY][blockX]
            }));
          }
        });

        ws.send(JSON.stringify({
          type: WEBSOCKET_SERVER_TO_CLIENT_EVENTS.INVENTORY_UPDATE,
          id: clientId,
          value: player.inventory
        }));
      }
    } else if (data.type == WEBSOCKET_CLIENT_TO_SERVER_EVENTS.CHAT) {
      const current_timestamp = Date.now();
      const expiration = current_timestamp + CHAT_MESSAGE_DURATION;
      messages.set(data.id, {
        message: data.message,
        expiration,
      })

      wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify({
            type: WEBSOCKET_SERVER_TO_CLIENT_EVENTS.CHAT_UPDATE,
            id: data.id,
            message: data.message,
            expiration,
          }));
        }
      });
    } else if (data.type == WEBSOCKET_CLIENT_TO_SERVER_EVENTS.PLACE_LETTER) {
      const blockX = data.blockX;
      const blockY = data.blockY;
      const letterKey = `${blockX},${blockY}`;
      if (terrain[blockY][blockX] === BLOCK_TYPE.EMPTY) {
        // Store the letter
        letters.set(letterKey, {
            message: data.message,
            authorId: clientId,
            timestamp: Date.now()
        });
        
        // Update terrain to show envelope
        terrain[blockY][blockX] = BLOCK_TYPE.EMPTY_WITH_ENVELOPE;
        
        wss.clients.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify({
                    type: WEBSOCKET_SERVER_TO_CLIENT_EVENTS.TERRAIN_UPDATE,
                    x: blockX,
                    y: blockY,
                    value: terrain[blockY][blockX]
                }));
            }
        });
      }
    } else if (data.type == WEBSOCKET_CLIENT_TO_SERVER_EVENTS.READ) {
      const blockX = data.blockX;
      const blockY = data.blockY;
      if (terrain[blockY][blockX] === BLOCK_TYPE.EMPTY_WITH_ENVELOPE) {
        const letterKey = `${blockX},${blockY}`;
        const letter = letters.get(letterKey);

        ws.send(JSON.stringify({
          type: WEBSOCKET_SERVER_TO_CLIENT_EVENTS.LETTER_TO_READ,
          x: data.x,
          y: data.y,
          authorId: letter.authorId,
          message: letter.message,
          timestamp: letter.timestamp
        }));
    }}
  });

  ws.on('close', () => {
    players.delete(clientId);
    for (let [zoneKey, zone] of zones) {
      if (zone.currentMonkeys.has(clientId)) {
         zone.currentMonkeys.delete(clientId);
         wss.clients.forEach(client => {
          if (client.readyState === WebSocket.OPEN) {
              client.send(JSON.stringify({
                  type: WEBSOCKET_SERVER_TO_CLIENT_EVENTS.ZONE_UPDATE,
                  key: zoneKey,
                  zone: {
                    ...zone,
                    currentMonkeys: Array.from(zone.currentMonkeys)
                  },
              }));
            }
        });
      }
    }

    wss.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify({
          type: WEBSOCKET_SERVER_TO_CLIENT_EVENTS.PLAYER_LEAVE,
          id: clientId
        }));
      }
    });
  });
});

server.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});