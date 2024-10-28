import { GRID_SIZE, BLOCK_TYPE, ZONE_ANIMATION_FRAMES } from "./shared/constants.js"
import { drawMonkeySprite } from './monkey.js';
import { drawBananaSprite } from './banana.js';
import { drawEnvelopeSprite } from './envelope.js';
import { Game } from './js/game.js';

export class Renderer {

    constructor(canvas, ctx) {
        this.canvas = canvas;
        this.ctx = ctx;

        // Create patterns for each block type
        this.patterns = {
            [BLOCK_TYPE.DIRT]: createDirtPattern(),
            [BLOCK_TYPE.ORE]: createOrePattern(),
        };

        this.zonePatternCache = {
            completed: new Array(ZONE_ANIMATION_FRAMES),
            incomplete: new Array(ZONE_ANIMATION_FRAMES)
        };
        createZonePatterns()
    }

    createDirtPattern() {
        const dirtPattern = document.createElement('canvas');
        dirtPattern.width = GRID_SIZE;
        dirtPattern.height = GRID_SIZE;
        const dirtPatternCtx = dirtPattern.getContext('2d');
  
        // Base brown color
        dirtPatternCtx.fillStyle = '#8B6143';
        dirtPatternCtx.fillRect(0, 0, GRID_SIZE, GRID_SIZE);
        
        // Add texture details
        dirtPatternCtx.fillStyle = '#7B5133';
        for (let i = 0; i < 8; i++) {
          const x = Math.random() * GRID_SIZE;
          const y = Math.random() * GRID_SIZE;
          const size = 2 + Math.random() * 4;
          dirtPatternCtx.fillRect(x, y, size, size);
        }
  
        // Add some lighter specs
        dirtPatternCtx.fillStyle = '#9B7153';
        for (let i = 0; i < 5; i++) {
          const x = Math.random() * GRID_SIZE;
          const y = Math.random() * GRID_SIZE;
          const size = 1 + Math.random() * 3;
          dirtPatternCtx.fillRect(x, y, size, size);
        }
  
        // Add a subtle grid line
        dirtPatternCtx.strokeStyle = 'rgba(0, 0, 0, 0.1)';
        dirtPatternCtx.strokeRect(0, 0, GRID_SIZE, GRID_SIZE);
  
        return this.ctx.createPattern(dirtPattern, 'repeat')
    }

    createOrePattern() {
        const orePattern = document.createElement('canvas');
        orePattern.width = GRID_SIZE;
        orePattern.height = GRID_SIZE;
        const orePatternCtx = orePattern.getContext('2d');
  
        // Base grey color
        orePatternCtx.fillStyle = '#9AA7AD';
        orePatternCtx.fillRect(0, 0, GRID_SIZE, GRID_SIZE);
        
        // Add texture details
        orePatternCtx.fillStyle = '#818594';
        for (let i = 0; i < 8; i++) {
          const x = Math.random() * GRID_SIZE;
          const y = Math.random() * GRID_SIZE;
          const size = 2 + Math.random() * 4;
          orePatternCtx.fillRect(x, y, size, size);
        }
  
        // Add some lighter specs
        orePatternCtx.fillStyle = '#B0C4D4';
        for (let i = 0; i < 5; i++) {
          const x = Math.random() * GRID_SIZE;
          const y = Math.random() * GRID_SIZE;
          const size = 1 + Math.random() * 3;
          orePatternCtx.fillRect(x, y, size, size);
        }
  
        // Add a subtle grid line
        orePatternCtx.strokeStyle = 'rgba(0, 0, 0, 0.1)';
        orePatternCtx.strokeRect(0, 0, GRID_SIZE, GRID_SIZE);
  
        return this.ctx.createPattern(orePattern, 'repeat');
    }

    createZonePatterns() {
        const createCanvas = (size) => {
            const canvas = document.createElement('canvas');
            canvas.width = size;
            canvas.height = size;
            return canvas;
        };

        const drawBasePattern = (ctx, config) => {
            const { size, baseColor, lineColor } = config;
            
            // Base color
            ctx.fillStyle = baseColor;
            ctx.fillRect(0, 0, size, size);
            
            // Draw curves
            ctx.strokeStyle = lineColor;
            ctx.lineWidth = 1;
            
            const drawCurve = (start, control, end) => {
              ctx.beginPath();
              ctx.moveTo(...start);
              ctx.quadraticCurveTo(...control, ...end);
              ctx.stroke();
            };
        
            drawCurve(
              [0, size/2],
              [size/2, 0],
              [size, size/2]
            );
            
            drawCurve(
              [size/2, 0],
              [size, size/2],
              [size/2, size]
            );
        };

        const drawSparkles = (ctx, config) => {
            const { size, sparkleColor, frame, frameCount } = config;
            
            ctx.fillStyle = sparkleColor;
            for (let i = 0; i < 4; i++) {
                const angle = (frame / frameCount * Math.PI * 2) + (i * Math.PI / 2);
                const radius = size / 4;
                const x = size/2 + Math.cos(angle) * radius;
                const y = size/2 + Math.sin(angle) * radius;
                
                ctx.beginPath();
                ctx.arc(x, y, 2, 0, Math.PI * 2);
                ctx.fill();
            }
        };

        const patterns = {
            completed: {
              baseColor: '#2eb82e',
              lineColor: '#1a661a',
              sparkleColor: '#4dff4d'
            },
            incomplete: {
              baseColor: '#cc3300',
              lineColor: '#801a00',
              sparkleColor: '#ff6666'
            }
        };

        for (let frame = 0; frame < ZONE_ANIMATION_FRAMES; frame++) {
            for (const [type, colors] of Object.entries(patterns)) {
              const canvas = createCanvas(GRID_SIZE);
              const context = canvas.getContext('2d');
              
              drawBasePattern(context, {
                size: GRID_SIZE,
                ...colors
              });
              
              drawSparkles(context, {
                size: GRID_SIZE,
                frame,
                frameCount: ZONE_ANIMATION_FRAMES,
                ...colors
              });
              
              this.zonePatternCache[type][frame] = ctx.createPattern(canvas, 'repeat');
            }
        }
    }

    drawChatBubble(ctx, x, y, message) {
        const padding = 8;
        const borderRadius = 8;
        
        // Measure text for bubble size
        ctx.font = '14px monospace';
        const textMetrics = ctx.measureText(message);
        const textWidth = textMetrics.width;
        const textHeight = 14; // Approximate height for monospace font
        
        // Bubble dimensions
        const bubbleWidth = textWidth + (padding * 2);
        const bubbleHeight = textHeight + (padding * 2);
        const triangleHeight = 8;
        
        // Position bubble above monkey
        const bubbleX = x - (bubbleWidth / 2);
        const bubbleY = y - bubbleHeight - GRID_SIZE - triangleHeight;
        
        // Draw bubble background
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.beginPath();
        // Draw rounded rectangle
        ctx.moveTo(bubbleX + borderRadius, bubbleY);
        ctx.lineTo(bubbleX + bubbleWidth - borderRadius, bubbleY);
        ctx.quadraticCurveTo(bubbleX + bubbleWidth, bubbleY, bubbleX + bubbleWidth, bubbleY + borderRadius);
        ctx.lineTo(bubbleX + bubbleWidth, bubbleY + bubbleHeight - borderRadius);
        ctx.quadraticCurveTo(bubbleX + bubbleWidth, bubbleY + bubbleHeight, bubbleX + bubbleWidth - borderRadius, bubbleY + bubbleHeight);
        ctx.lineTo(bubbleX + borderRadius, bubbleY + bubbleHeight);
        ctx.quadraticCurveTo(bubbleX, bubbleY + bubbleHeight, bubbleX, bubbleY + bubbleHeight - borderRadius);
        ctx.lineTo(bubbleX, bubbleY + borderRadius);
        ctx.quadraticCurveTo(bubbleX, bubbleY, bubbleX + borderRadius, bubbleY);
        ctx.closePath();
        ctx.fill();
        
        // Draw triangle
        ctx.beginPath();
        ctx.moveTo(x - 8, bubbleY + bubbleHeight);
        ctx.lineTo(x + 8, bubbleY + bubbleHeight);
        ctx.lineTo(x, bubbleY + bubbleHeight + triangleHeight);
        ctx.closePath();
        ctx.fill();
        
        // Draw text
        ctx.fillStyle = 'white';
        ctx.fillText(message, bubbleX + padding, bubbleY + padding + textHeight);
    }

    render(game) {
        const terrain = game.terrain;
        const zones = game.zones;
        const players = game.players;
        const myId = game.myId;
        const messages = game.messages;
        const viewportX = game.viewportX;
        const viewportY = game.viewportY;
        const currentZoneFrame = game.currentZoneFrame;

        const myPlayer = players.get(myId);

        // TERRAIN
        this.renderTerrain(terrain, zones, viewportX, viewportY, currentZoneFrame)

        // TARGET BLOCK INDICATOR
        if (myPlayer) {
            const targetBlock = Game.getTargetBlock(myPlayer)
            if (terrain[targetBlock.y]?.[targetBlock.x] !== BLOCK_TYPE.EMPTY) {
                this.renderTargetIndicator(targetBlock, viewportX, viewportY)
            }
        }

        // PLAYERS
        players.forEach((player, id) => {
            this.renderPlayer(player, id === myId, viewportX, viewportY);
        })

        // MESSAGES
        const currentTime = Date.now()
        messages.forEach((msg, id) => {
            if (msg.expiration < currentTime) {
                messages.delete(id);
            } else {
                const player = players.get(id);
                if (player) {
                    this.renderMessage(player, msg.message, viewportX, viewportY)
                }
            }
        })

        // INVENTORY
        const inventoryCtx = game.hud.inventoryCtx
        if (myPlayer) {
            this.renderInventory(myPlayer.inventory, inventoryCtx)
        }
    }

    renderTerrain(terrain, zones, viewportX, viewportY, currentZoneFrame) {
        this.ctx.fillStyle = '#B89D81';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // frame in view
        const startBlockX = Math.floor(viewportX / GRID_SIZE);
        const startBlockY = Math.floor(viewportY / GRID_SIZE);
        const endBlockX = startBlockX + Math.ceil(this.canvas.width / GRID_SIZE) + 1;
        const endBlockY = startBlockY + Math.ceil(this.canvas.height / GRID_SIZE) + 1;

        for (let y = startBlockY; y < endBlockY; y++) {
            for (let x = startBlockX; x < endBlockX; x++) {
                let block = terrain[y]?.[x];
                if (block !== BLOCK_TYPE.EMPTY) {
                    const screenX = x * GRID_SIZE - viewportX;
                    const screenY = y * GRID_SIZE - viewportY;
                    if (block === BLOCK_TYPE.ZONE) {
                        // Find which zone this block belongs to
                        for (let [coords, zone] of zones) {
                            const [zx, zy] = coords.split(',').map(Number);
                            if (x >= zx && x < zx + zone.width && 
                                y >= zy && y < zy + zone.height) {
                                // Draw zone pattern
                                this.ctx.fillStyle = zone.completed ? 
                                this.zonePatternCache.completed[currentZoneFrame] : 
                                this.zonePatternCache.incomplete[currentZoneFrame];
                                this.ctx.fillRect(screenX, screenY, GRID_SIZE, GRID_SIZE);
                            
                                // If this is the center block of the zone, draw the requirement text
                                const centerX = Math.floor(zx + zone.width/2) === x;
                                const centerY = Math.floor(zy + zone.height/2) === y;
                                if (centerX && centerY && !zone.completed) {
                                    // Draw requirement text
                                    this.ctx.save();
                                    this.ctx.fillStyle = 'white';
                                    this.ctx.strokeStyle = 'black';
                                    this.ctx.lineWidth = 3;
                                    this.ctx.font = 'bold 20px Arial';
                                    this.ctx.textAlign = 'center';
                                    this.ctx.textBaseline = 'middle';
                                    const text = `${zone.currentMonkeys.length}/${zone.requiredMonkeys}`;
                                    const textX = screenX + GRID_SIZE/2;
                                    const textY = screenY + GRID_SIZE/2;
                                    // Draw text stroke
                                    this.ctx.strokeText(text, textX, textY);
                                    // Draw text fill
                                    this.ctx.fillText(text, textX, textY);
                                    this.ctx.restore();
                                }
                                break;
                            }
                    }
                    } else if (block === BLOCK_TYPE.EMPTY_WITH_BANANA) {
                        drawBananaSprite(ctx, screenX, screenY);
                    } else if (block === BLOCK_TYPE.EMPTY_WITH_ENVELOPE) {
                        drawEnvelopeSprite(ctx, screenX, screenY);
                    } else {
                        // Get pattern based on block type
                        const pattern = patterns[block];
                        if (pattern) {
                            ctx.save();
                            ctx.translate(screenX, screenY);
                            ctx.fillStyle = pattern;
                            ctx.fillRect(0, 0, GRID_SIZE, GRID_SIZE);
                            ctx.restore();
                        }
                    }
                }
            }
        }
    }

    renderTargetIndicator(targetBlock, viewportX, viewportY) {
        this.ctx.fillStyle = 'rgba(255, 255, 0, 0.3)';
        this.ctx.fillRect(
            targetBlock.x * GRID_SIZE - viewportX,
            targetBlock.y * GRID_SIZE - viewportY,
            GRID_SIZE,
            GRID_SIZE
        );
    }

    renderPlayer(player, is_current_player, viewportX, viewportY) {
        const screenX = player.x - viewportX - GRID_SIZE/2;
        const screenY = player.y - viewportY - GRID_SIZE/2;

        // Only animate if player is moving
        const frame = player.moving ? animationFrame : 0;
        drawMonkeySprite(ctx, screenX, screenY, player.color, player.direction, frame);

        // Draw outline for current player
        if (is_current_player) {
            ctx.strokeStyle = 'white';
            ctx.lineWidth = 2;
            ctx.strokeRect(screenX, screenY, GRID_SIZE, GRID_SIZE);
        }
    }

    renderMessage(player, message, viewportX, viewportY) {
        const screenX = player.x - viewportX;
        const screenY = player.y - viewportY;
        this.drawChatBubble(this.ctx, screenX, screenY, message)
    }

    renderInventory(inventory, ctx) {
        ctx.clearRect(0, 0, 48, 48);
        ctx.fillStyle = 'rgba(68, 68, 68, 0.4)';
        ctx.fillRect(0, 0, 48, 48);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.strokeRect(0, 0, 48, 48);

        if (inventory.length > 0) {
            drawBananaSprite(ctx, 8, 8);

            ctx.fillStyle = 'white'; 
            ctx.font = '16px Arial';
            ctx.textBaseline = 'bottom';
            ctx.textAlign = 'right';
        
            ctx.fillText(
                inventory.length.toString(),
                44,  // X position (48 - 4 for padding)
                44   // Y position (48 - 4 for padding)
            );
        }
    }
}