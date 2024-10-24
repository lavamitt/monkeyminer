const WebSocket = require('ws');
const http = require('http');
const fs = require('fs');

const server = http.createServer((req, res) => {
  if (req.url === '/') {
    fs.readFile('index.html', (err, data) => {
      if (err) {
        res.writeHead(500);
        res.end('Error loading index.html');
      } else {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(data);
      }
    });
  } else if (req.url === '/monkey.js') {
    fs.readFile('./sprites/monkey.js', (err, data) => {
      if (err) {
        res.writeHead(404);
        res.end('File not found');
      } else {
        res.writeHead(200, { 'Content-Type': 'application/javascript' });
        res.end(data);
      }
    });
  } else if (req.url === '/banana.js') {
    fs.readFile('./sprites/banana.js', (err, data) => {
      if (err) {
        res.writeHead(404);
        res.end('File not found');
      } else {
        res.writeHead(200, { 'Content-Type': 'application/javascript' });
        res.end(data);
      }
    });
  } else if (req.url === '/favicon.ico') {
    fs.readFile('./favicon.ico', (err, data) => {
      if (err) {
        res.writeHead(404);
        res.end('File not found');
      } else {
        res.writeHead(200, { 'Content-Type': 'image/x-icon' });
        res.end(data);
      }
    });
  }
});

const wss = new WebSocket.Server({ server });

// Game constants
const GRID_SIZE = 32; // Size of each terrain block
const WORLD_SIZE = 1000; // World size in blocks
const START_AREA_SIZE = 10; // Size of starting area in blocks

const BLOCK_TYPE = Object.freeze({
  EMPTY: 0,
  DIRT: 1,
  ORE: 2,
  EMPTY_WITH_BANANA: 3,
  ZONE: 4
});

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
      if (Math.random() < 0.1) {
        terrain[y][x] = BLOCK_TYPE.ORE;
      }
    }
  }
}

// Add zones
const zones = new Map();
const NUM_ZONES = 1000;
const MIN_DISTANCE_BETWEEN_ZONES = 10;
const MIN_ZONE_SIDE = 1;
const MAX_ZONE_SIDE = 10;
const MIN_REQUIRED_MONKEYS = 1;
const MAX_REQUIRED_MONKEYS = 15;

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
    direction: 'right', // default direction
    score: 0,
    inventory: []
  });

  // Send client their ID, initial state, and terrain
  ws.send(JSON.stringify({
    type: 'init',
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
        type: 'playerJoin',
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
    
    if (data.type === 'move') {
      const player = players.get(clientId);
      if (player) {
        player.x = data.x;
        player.y = data.y;
        player.direction = data.direction;
        
        wss.clients.forEach(client => {
          if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({
              type: 'playerMove',
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

                  console.log("COMPLETED!");
                  console.log(zone.currentMonkeys);
                  
                  zone.currentMonkeys.forEach(playerId => {
                      console.log("SENDING UPDATES FOR SCORES");
                      const zonePlayer = players.get(playerId);
                      console.log(zonePlayer);
                      if (zonePlayer) {
                          zonePlayer.score += 10 * zone.currentMonkeys.size;
                          zonePlayer.inventory.pop();  // Remove banana
                      }
                      console.log(zonePlayer);

                      wss.clients.forEach(client => {
                        if (client.readyState === WebSocket.OPEN) {
                          client.send(JSON.stringify({
                              type: 'scoreUpdate',
                              id: zonePlayer.id,
                              value: zonePlayer.score,
                            }))
                        }});
                      
                      wss.clients.forEach(client => {
                        if (client.readyState === WebSocket.OPEN) {
                          client.send(JSON.stringify({
                            type: 'inventoryUpdate',
                            id: zonePlayer.id,
                            value: zonePlayer.inventory,
                            }))
                        }});
                    });
                }
                wss.clients.forEach(client => {
                  if (client.readyState === WebSocket.OPEN) {
                      client.send(JSON.stringify({
                          type: 'zoneUpdate',
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
                            type: 'zoneUpdate',
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
    } else if (data.type === 'mine') {
      const player = players.get(clientId);

      const blockX = data.blockX;
      const blockY = data.blockY;
      
      if (blockX >= 0 && blockX < WORLD_SIZE && 
          blockY >= 0 && blockY < WORLD_SIZE &&
          terrain[blockY][blockX] !== BLOCK_TYPE.EMPTY &&
          terrain[blockY][blockX] !== BLOCK_TYPE.EMPTY_WITH_BANANA &&
          terrain[blockY][blockX] !== BLOCK_TYPE.ZONE) {
        if (terrain[blockY][blockX] == BLOCK_TYPE.ORE) {
          player.score += 1;
        }

        if (Math.random() < 0.05) {
          terrain[blockY][blockX] = BLOCK_TYPE.EMPTY_WITH_BANANA;
        } else {
          terrain[blockY][blockX] = BLOCK_TYPE.EMPTY;
        }
        
        wss.clients.forEach(client => {
          if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({
              type: 'terrainUpdate',
              x: blockX,
              y: blockY,
              value: terrain[blockY][blockX]
            }));
          }
        });

        wss.clients.forEach(client => {
          if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({
              type: 'scoreUpdate',
                id: clientId,
                value: player.score,
              }))
          }});
      }
    } else if (data.type == 'pickup') {
      const player = players.get(clientId);
      const blockX = data.blockX;
      const blockY = data.blockY;
      if (terrain[blockY][blockX] === BLOCK_TYPE.EMPTY_WITH_BANANA) {
        player.inventory.push("banana");

        terrain[blockY][blockX] = BLOCK_TYPE.EMPTY;
        wss.clients.forEach(client => {
          if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({
              type: 'terrainUpdate',
              x: blockX,
              y: blockY,
              value: terrain[blockY][blockX]
            }));
          }
        });

        ws.send(JSON.stringify({
          type: 'inventoryUpdate',
          id: clientId,
          value: player.inventory
        }));
      }
    } else if (data.type = 'chat') {
      const current_timestamp = Date.now()
      const expiration = current_timestamp + 5 * 1000 // 5 seconds
      messages.set(data.id, {
        message: data.message,
        expiration,
      })

      wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify({
            type: 'chatUpdate',
            id: data.id,
            message: data.message,
            expiration,
          }));
        }
      });
    }
  });

  ws.on('close', () => {
    players.delete(clientId);
    for (let [zoneKey, zone] of zones) {
      if (zone.currentMonkeys.has(clientId)) {
         zone.currentMonkeys.delete(clientId);
         wss.clients.forEach(client => {
          if (client.readyState === WebSocket.OPEN) {
              client.send(JSON.stringify({
                  type: 'zoneUpdate',
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
          type: 'playerLeave',
          id: clientId
        }));
      }
    });
  });
});

server.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});