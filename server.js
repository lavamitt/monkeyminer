import WebSocket, { WebSocketServer } from 'ws';
import { createServer } from 'http';
import { readFile } from 'fs';
import {
  GRID_SIZE,
  WORLD_SIZE,
  START_AREA_SIZE,
  BLOCK_TYPE,
  NUM_ZONES,
  MIN_DISTANCE_BETWEEN_ZONES,
  MIN_ZONE_SIDE,
  MAX_ZONE_SIDE,
  MIN_REQUIRED_MONKEYS,
  MAX_REQUIRED_MONKEYS,
  ORE_SPAWN_CHANCE,
  CHAT_MESSAGE_DURATION,
  WEBSOCKET_SERVER_TO_CLIENT_EVENTS,
  WEBSOCKET_CLIENT_TO_SERVER_EVENTS,
  GAME_RULES,
  DIRECTIONS
}  from './shared/constants.js';

const server = createServer((req, res) => {
  if (req.url === '/') {
    readFile('./client/index.html', (err, data) => {
      if (err) {
        res.writeHead(500);
        res.end('Error loading index.html');
      } else {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(data);
      }
    });
   } else if (req.url === '/styles/main.css') {
      readFile('./client/styles/main.css', (err, data) => {
        if (err) {
          res.writeHead(404);
          res.end('File not found');
        } else {
          res.writeHead(200, { 'Content-Type': 'text/css' });
          res.end(data);
        }
      });
  } else if (req.url === '/js/game.js') {
    readFile('./client/js/game.js', (err, data) => {
      if (err) {
        res.writeHead(404);
        res.end('File not found');
      } else {
        res.writeHead(200, { 'Content-Type': 'application/javascript' });
        res.end(data);
      }
    });
  } else if (req.url === '/js/hud.js') {
    readFile('./client/js/hud.js', (err, data) => {
      if (err) {
        res.writeHead(404);
        res.end('File not found');
      } else {
        res.writeHead(200, { 'Content-Type': 'application/javascript' });
        res.end(data);
      }
    });
  } else if (req.url === '/js/renderer.js') {
    readFile('./client/js/renderer.js', (err, data) => {
      if (err) {
        res.writeHead(404);
        res.end('File not found');
      } else {
        res.writeHead(200, { 'Content-Type': 'application/javascript' });
        res.end(data);
      }
    });
  } else if (req.url === '/shared/constants.js') {
    readFile('./shared/constants.js', (err, data) => {
      if (err) {
        res.writeHead(404);
        res.end('File not found');
      } else {
        res.writeHead(200, { 'Content-Type': 'application/javascript' });
        res.end(data);
      }
    });
  } else if (req.url === '/sprites/monkey.js') {
    readFile('./client/sprites/monkey.js', (err, data) => {
      if (err) {
        res.writeHead(404);
        res.end('File not found');
      } else {
        res.writeHead(200, { 'Content-Type': 'application/javascript' });
        res.end(data);
      }
    });
  } else if (req.url === '/sprites/banana.js') {
    readFile('./client/sprites/banana.js', (err, data) => {
      if (err) {
        res.writeHead(404);
        res.end('File not found');
      } else {
        res.writeHead(200, { 'Content-Type': 'application/javascript' });
        res.end(data);
      }
    });
  } else if (req.url === '/sprites/envelope.js') {
    readFile('./client/sprites/envelope.js', (err, data) => {
      if (err) {
        res.writeHead(404);
        res.end('File not found');
      } else {
        res.writeHead(200, { 'Content-Type': 'application/javascript' });
        res.end(data);
      }
    });
  } else if (req.url === '/favicon.ico') {
    readFile('./favicon.ico', (err, data) => {
      if (err) {
        res.writeHead(404);
        res.end('File not found');
      } else {
        res.writeHead(200, { 'Content-Type': 'image/x-icon' });
        res.end(data);
      }
    });
  } else {
    console.log("File asked does not exist!")
    console.log(req.url)
  }
});

const wss = new WebSocketServer({ server });

const terrain = new Array(WORLD_SIZE).fill(null)
  .map(() => new Array(WORLD_SIZE).fill(BLOCK_TYPE.DIRT));

// Create starting area
const startX = Math.floor(WORLD_SIZE / 2 - START_AREA_SIZE / 2);
const startY = Math.floor(WORLD_SIZE / 2 - START_AREA_SIZE / 2);
for (let y = startY; y < startY + START_AREA_SIZE; y++) {
  for (let x = startX; x < startX + START_AREA_SIZE; x++) {
    terrain[y][x] = BLOCK_TYPE.EMPTY;
  }
}

// Add random ore
for (let y = 0; y < WORLD_SIZE; y++) {
  for (let x = 0; x < WORLD_SIZE; x++) {
    if (terrain[y][x] !== BLOCK_TYPE.EMPTY) {
      if (Math.random() < ORE_SPAWN_CHANCE) {
        terrain[y][x] = BLOCK_TYPE.ORE;
      }
    }
  }
}

const zones = new Map();

function tooCloseToNearestZone(x, y) {
  for (let [_, zone] of zones) {
      // Find closest x and y points on the zone
      const closestX = Math.max(zone.x, Math.min(x, zone.x + zone.width - 1));
      const closestY = Math.max(zone.y, Math.min(y, zone.y + zone.height - 1));
      
      // Calculate distance to closest point
      const distance = Math.sqrt(
          Math.pow(x - closestX, 2) + 
          Math.pow(y - closestY, 2)
      );
      
      if (distance < MIN_DISTANCE_BETWEEN_ZONES) {
          return true;
      }
  }
  return false;
}

let zones_created = 0;
while (zones_created < NUM_ZONES) {
    const zone_width = Math.floor(Math.random() * (MAX_ZONE_SIDE - MIN_ZONE_SIDE) + MIN_ZONE_SIDE)
    const zone_height = Math.floor(Math.random() * (MAX_ZONE_SIDE - MIN_ZONE_SIDE) + MIN_ZONE_SIDE)

    const x = Math.floor(Math.random() * (WORLD_SIZE - zone_width));
    const y = Math.floor(Math.random() * (WORLD_SIZE - zone_height));

    let is_valid_location = true;
    // Check if entire zone area is empty and far from other zones
    for (let dy = 0; dy < zone_height; dy++) {
        for (let dx = 0; dx < zone_width; dx++) {
            if (terrain[y + dy][x + dx] == BLOCK_TYPE.EMPTY || 
                tooCloseToNearestZone(x + dx, y + dy)) {
                is_valid_location = false;
                break;
            }
        }
        if (!is_valid_location) break;
    }

    if (is_valid_location) {
      for (let dy = 0; dy < zone_height; dy++) {
          for (let dx = 0; dx < zone_width; dx++) {
              terrain[y + dy][x + dx] = BLOCK_TYPE.ZONE;
          }
      }
      
      const required_monkeys = Math.floor(Math.random() * (MAX_REQUIRED_MONKEYS - MIN_REQUIRED_MONKEYS) + MIN_REQUIRED_MONKEYS);
      zones.set(`${x},${y}`, { // TOP LEFT CORNER OF ZONE
          x,  
          y,
          width: zone_width,
          height: zone_height,
          requiredMonkeys: required_monkeys,
          currentMonkeys: new Set(),
          completed: false
      });
      zones_created += 1;
  }
}

function isInZone(blockX, blockY) {
  for (let [_, zone] of zones) {
      if (blockX >= zone.x && blockX < zone.x + zone.width &&
          blockY >= zone.y && blockY < zone.y + zone.height) {
          return `${zone.x},${zone.y}`;
      }
  }
  return null;
}

// Store player positions and colors
const players = new Map();
const messages = new Map();
const letters = new Map();

function generateColor() {
  return '#' + Math.floor(Math.random()*16777215).toString(16);
}

wss.on('connection', (ws) => {
  const clientId = Math.random().toString(36).substring(2, 9);
  
  // Add direction to player state
  players.set(clientId, {
    id: clientId,
    x: (startX + START_AREA_SIZE/2) * GRID_SIZE,
    y: (startY + START_AREA_SIZE/2) * GRID_SIZE,
    color: generateColor(),
    direction: DIRECTIONS.RIGHT, // default direction
    score: 0,
    inventory: []
  });

  // Send client their ID, initial state, and terrain
  ws.send(JSON.stringify({
    type: WEBSOCKET_SERVER_TO_CLIENT_EVENTS.INIT,
    id: clientId,
    players: Array.from(players.entries()).map(([_, data]) => data),
    terrain: terrain,
    zones: Array.from(zones.entries()).map(([key, zone]) => ({
      key,
      ...zone,
      currentMonkeys: Array.from(zone.currentMonkeys)
    })),
    messages: Array.from(messages.entries()).map(([key, msg]) => ({
      key,
      ...msg
    })),
    gridSize: GRID_SIZE
  }));

  // Broadcast new player to others
  wss.clients.forEach(client => {
    if (client !== ws && client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify({
        type: WEBSOCKET_SERVER_TO_CLIENT_EVENTS.PLAYER_JOIN,
        id: clientId,
        player: players.get(clientId),
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

        const playerBlockX = Math.floor(player.x / GRID_SIZE);
        const playerBlockY = Math.floor(player.y / GRID_SIZE);
        const zoneKey = isInZone(playerBlockX, playerBlockY);
        if (zoneKey && player.inventory.length > 0) {
            const zone = zones.get(zoneKey);
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