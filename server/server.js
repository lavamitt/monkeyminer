import express from 'express';
import WebSocket, { WebSocketServer } from 'ws';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { createServer } from 'http';
import { GameState } from './game.js'
import { Zone } from './models/zone.js'
import {
  GRID_SIZE,
  BLOCK_TYPE,
  WEBSOCKET_SERVER_TO_CLIENT_EVENTS,
  WEBSOCKET_CLIENT_TO_SERVER_EVENTS,
  GAME_RULES,
  BANANA
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
    game.addNewPlayer(clientId)

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
                player: game.getPlayer(clientId),
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
            const player = game.getPlayer(clientId);
            if (player) {
                player.updatePosition(data.x, data.y, data.direction);
        
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
                const zoneKey = Zone.isInZone(playerBlockX, playerBlockY, game.zones);
                if (zoneKey && player.inventory.length > 0) {
                    const zone = game.getZone(zoneKey);
                    if (zone && !zone.completed) {
                        zone.addMonkey(clientId);
                        if (zone.completed) {
                            zone.currentMonkeys.forEach(playerId => {
                                const zonePlayer = game.getPlayer(playerId);
                                if (zonePlayer) {
                                    zonePlayer.addToScore(GAME_RULES.ZONE_COMPLETION_BASE_SCORE * zone.currentMonkeys.size);
                                    zonePlayer.removeFromInventory(BANANA);
                                }

                                wss.clients.forEach(client => {
                                    if (client.readyState === WebSocket.OPEN) {
                                        client.send(JSON.stringify({
                                            type: WEBSOCKET_SERVER_TO_CLIENT_EVENTS.SCORE_UPDATE,
                                            id: zonePlayer.id,
                                            value: zonePlayer.score,
                                        }))
                                    }
                                })

                                wss.clients.forEach(client => {
                                    if (client.readyState === WebSocket.OPEN) {
                                        client.send(JSON.stringify({
                                            type: WEBSOCKET_SERVER_TO_CLIENT_EVENTS.INVENTORY_UPDATE,
                                            id: zonePlayer.id,
                                            value: zonePlayer.inventory,
                                        }))
                                    }
                                });
                            });
                        }

                        wss.clients.forEach(client => {
                            if (client.readyState === WebSocket.OPEN) {
                                client.send(JSON.stringify({
                                    type: WEBSOCKET_SERVER_TO_CLIENT_EVENTS.ZONE_UPDATE,
                                    key: zoneKey,
                                    zone: zone.toJSON()
                                }))
                            }
                        });
                    }
                } else {
                    // Remove player from any zones they were in
                    console.log("REMOVING PLAYER!")
                    console.log(clientId)
                    for (let [zoneKey, zone] of game.zones) {
                        if (zone.currentMonkeys.size > 0) {
                            console.log(zone.currentMonkeys);
                            console.log(zone.hasMonkey(clientId))
                        }
                        if (zone.hasMonkey(clientId)) {
                            zone.removeMonkey(clientId);
                            wss.clients.forEach(client => {
                                if (client.readyState === WebSocket.OPEN) {
                                    client.send(JSON.stringify({
                                        type: WEBSOCKET_SERVER_TO_CLIENT_EVENTS.ZONE_UPDATE,
                                        key: zoneKey,
                                        zone: zone.toJSON()
                                    }));
                                }
                            });
                            console.log(zone.toJSON());
                        }
                    }
                }
            }
        } else if (data.type === WEBSOCKET_CLIENT_TO_SERVER_EVENTS.MINE) {
            const player = game.getPlayer(clientId);

            const blockX = data.blockX;
            const blockY = data.blockY;
      
            if (game.isMineableBlock(blockX, blockY)) {
                if (game.getBlock(blockX, blockY) == BLOCK_TYPE.ORE) {
                    player.addToScore(GAME_RULES.MINE_ORE_SCORE);
                }

                if (Math.random() < GAME_RULES.BANANA_SPAWN_CHANCE) {
                    game.setBlock(blockX, blockY, BLOCK_TYPE.EMPTY_WITH_BANANA);
                } else {
                    game.setBlock(blockX, blockY, BLOCK_TYPE.EMPTY);
                }
        
                wss.clients.forEach(client => {
                    if (client.readyState === WebSocket.OPEN) {
                        client.send(JSON.stringify({
                            type: WEBSOCKET_SERVER_TO_CLIENT_EVENTS.TERRAIN_UPDATE,
                            x: blockX,
                            y: blockY,
                            value: game.getBlock(blockX, blockY)
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
                    }
                });
            }
        } else if (data.type == WEBSOCKET_CLIENT_TO_SERVER_EVENTS.PICKUP) {
            const player = game.getPlayer(clientId);
            const blockX = data.blockX;
            const blockY = data.blockY;
            if (game.getBlock(blockX, blockY) === BLOCK_TYPE.EMPTY_WITH_BANANA) {
                player.addToInventory(BANANA);
                game.setBlock(blockX, blockY, BLOCK_TYPE.EMPTY);

                wss.clients.forEach(client => {
                    if (client.readyState === WebSocket.OPEN) {
                        client.send(JSON.stringify({
                            type: WEBSOCKET_SERVER_TO_CLIENT_EVENTS.TERRAIN_UPDATE,
                            x: blockX,
                            y: blockY,
                            value: game.getBlock(blockX, blockY)
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
            const newMessage = game.addNewMessage(data.id, data.message);

            wss.clients.forEach(client => {
                if (client.readyState === WebSocket.OPEN) {
                    client.send(JSON.stringify({
                        type: WEBSOCKET_SERVER_TO_CLIENT_EVENTS.CHAT_UPDATE,
                        id: newMessage.playerId,
                        message: newMessage.content,
                        expiration: newMessage.expiration,
                    }));
                }
            });
        } else if (data.type == WEBSOCKET_CLIENT_TO_SERVER_EVENTS.PLACE_LETTER) {
            const newLetter = game.addNewLetter(clientId, data.content, data.blockX, data.blockY);
            if (newLetter) {
                wss.clients.forEach(client => {
                    if (client.readyState === WebSocket.OPEN) {
                        client.send(JSON.stringify({
                            type: WEBSOCKET_SERVER_TO_CLIENT_EVENTS.TERRAIN_UPDATE,
                            x: newLetter.x,
                            y: newLetter.y,
                            value: game.getBlock(newLetter.x, newLetter.y)
                        }));
                    }
                });
            }
        } else if (data.type == WEBSOCKET_CLIENT_TO_SERVER_EVENTS.READ) {
            const blockX = data.blockX;
            const blockY = data.blockY;
            if (game.getBlock(blockX, blockY) === BLOCK_TYPE.EMPTY_WITH_ENVELOPE) {
                const letter = game.getLetter(blockX, blockY);
                if (letter) {
                    ws.send(JSON.stringify({
                        type: WEBSOCKET_SERVER_TO_CLIENT_EVENTS.LETTER_TO_READ,
                        ...letter.toJSON()
                    }));
                } 
            }
        }
    });

    ws.on('close', () => {
        game.removePlayer(clientId);
        for (let [zoneKey, zone] of game.zones) {
            if (zone.hasMonkey(clientId)) {
                zone.removeMonkey(clientId);
                wss.clients.forEach(client => {
                    if (client.readyState === WebSocket.OPEN) {
                        client.send(JSON.stringify({
                            type: WEBSOCKET_SERVER_TO_CLIENT_EVENTS.ZONE_UPDATE,
                            key: zoneKey,
                            zone: zone.toJSON()
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