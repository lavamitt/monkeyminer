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

// Store player positions and colors
const players = new Map();

function generateColor() {
  return '#' + Math.floor(Math.random()*16777215).toString(16);
}

wss.on('connection', (ws) => {
  const clientId = Math.random().toString(36).substring(2, 9);
  
  // Add direction to player state
  players.set(clientId, {
    x: (startX + START_AREA_SIZE/2) * GRID_SIZE,
    y: (startY + START_AREA_SIZE/2) * GRID_SIZE,
    color: generateColor(),
    direction: 'right' // default direction
  });

  // Send client their ID, initial state, and terrain
  ws.send(JSON.stringify({
    type: 'init',
    id: clientId,
    players: Array.from(players.entries()).map(([id, data]) => ({
      id,
      ...data
    })),
    terrain: terrain,
    gridSize: GRID_SIZE
  }));

  // Broadcast new player to others
  wss.clients.forEach(client => {
    if (client !== ws && client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify({
        type: 'playerJoin',
        id: clientId,
        ...players.get(clientId)
      }));
    }
  });

  ws.on('message', (message) => {
    const data = JSON.parse(message);
    
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
      }
    } else if (data.type === 'mine') {
      const blockX = data.blockX;
      const blockY = data.blockY;
      
      if (blockX >= 0 && blockX < WORLD_SIZE && 
          blockY >= 0 && blockY < WORLD_SIZE &&
          terrain[blockY][blockX]) {
        terrain[blockY][blockX] = BLOCK_TYPE.EMPTY;
        
        wss.clients.forEach(client => {
          if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({
              type: 'terrainUpdate',
              x: blockX,
              y: blockY,
              value: BLOCK_TYPE.EMPTY
            }));
          }
        });
      }
    }
  });

  ws.on('close', () => {
    players.delete(clientId);
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