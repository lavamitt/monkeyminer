import { GRID_SIZE, BLOCK_TYPE, BASE_SPEED, ANIMATION_SPEED, ANIMATION_FRAMES, ZONE_ANIMATION_SPEED, ZONE_ANIMATION_FRAMES } from "./shared/constants.js"


export class Game {

    constructor(canvas, ctx, ws, hud, renderer) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.ws = ws;
        this.hud = hud;
        this.renderer = renderer;

        // game state
        this.players = new Map();
        this.myId = null;
        this.viewportX = 0;
        this.viewportY = 0;
        this.terrain = [[]];
        this.zones = new Map();
        this.messages = new Map();

        // animation state
        this.lastFrameTime = 0;
        // general animation
        this.lastAnimationUpdate = 0;
        this.currentAnimationFrame = 0;
        // zone animation
        this.lastZoneAnimationUpdate = 0;
        this.currentZoneFrame = 0;

        // Set up WebSocket handlers
        this.setupWebSocket();
    }

    setupWebSocket() {
        this.ws.onmessage(event => {
            const data = JSON.parse(event.data);
            switch (data.type) {
                case 'init':
                this.handleInit(data);
                break;
            case 'playerJoin':
                this.handlePlayerJoin(data);
                break;
            case 'playerLeave':
                this.handlePlayerLeave(data);
                break;
            case 'playerMove':
                this.handlePlayerMove(data);
                break;
            case 'terrainUpdate':
                this.handleTerrainUpdate(data);
                break;
            case 'zoneUpdate':
                this.handleZoneUpdate(data);
                break;
            case 'scoreUpdate':
                this.handleScoreUpdate(data);
                break;
            case 'inventoryUpdate':
                this.handleInventoryUpdate(data);
                break;
            case 'chatUpdate':
                this.handleChatUpdate(data);
                break;
            case 'letterToRead':
                this.handleLetterToRead(data);
                break;
            }
        });
    }

    handleInit(data) {
        this.myId = data.id;
        this.terrain = data.terrain;
        data.zones.forEach(zone => this.zones.set(zone.key, zone));
        data.players.forEach(player => this.players.set(player.id, player));
        
        const myPlayer = this.players.get(this.myId);
        if (myPlayer) {
          this.viewportX = myPlayer.x - this.canvas.width / 2;
          this.viewportY = myPlayer.y - this.canvas.height / 2;
        }
        
        data.messages.forEach(msg => {
          this.messages.set(msg.key, {
            message: msg.message,
            expiration: msg.expiration
          });
        });
    
        this.hud.updateMonkeyId(this.myId);
    }

    handlePlayerJoin(data) {
        this.players.set(data.id, data.player);
        this.hud.updateNumPlayers(players.size);
    }

    handlePlayerLeave(data) {
        this.players.delete(data.id)
    }

    handlePlayerMove(data) {
        // we exclude the current player since we've already updated optimistically in the gameloop.
        if (players.has(data.id) && data.id !== myId) {
            const player = players.get(data.id);
            player.x = data.x;
            player.y = data.y;
            player.direction = data.direction;
            player.moving = data.moving;
        }
    }

    handleTerrainUpdate(data) {
        this.terrain[data.y][data.x] = data.value;
    }

    handleZoneUpdate(data) {
        this.zones.set(data.key, data.zone)
    }

    handleScoreUpdate(data) {
        this.players.get(data.id).score = data.value
        this.hud.updateScores(players, this.myId)
    }

    handleInventoryUpdate(data) {
        this.players.get(data.id).inventory = data.value;
    }

    handleChatUpdate(data) {
        this.messages.set(data.id, {
            message: data.message,
            expiration: data.expiration
        })
    }

    handleLetterToRead(data) {
        const author = players.get(data.authorId) ? `monkey_${data.authorId}` : 'Unknown Monkey';
        const date = new Date(data.timestamp).toLocaleString();
        this.hud.displayLetter(author, date, data.message);
    }

    // SET UP KEY ACTIONS
    static getTargetBlock(player) {
        const playerBlockX = Math.floor(player.x / GRID_SIZE);
        const playerBlockY = Math.floor(player.y / GRID_SIZE);
        
        switch(player.direction) {
            case 'left':
                return { x: playerBlockX - 1, y: playerBlockY };
            case 'right':
                return { x: playerBlockX + 1, y: playerBlockY };
            case 'up':
                return { x: playerBlockX, y: playerBlockY - 1 };
            case 'down':
                return { x: playerBlockX, y: playerBlockY + 1 };
        }
    }

    handleKeyDownEvent(event, keys) {
        const activeElementIsChatInput = document.activeElement === this.hud.elements.chatInput
        const activeElementIsLetterInput = document.activeElement === this.hud.elements.letterInput

        const player = this.players.get(this.myId);
        if (!player) return;

        const key = event.key;
        keys.add(key);

        switch (key) {
            case ' ':
                if (!activeElementIsChatInput && !activeElementIsLetterInput) {
                    this.handleMining(player);
                }
                break;
            case 'q':
                if (!activeElementIsChatInput && !activeElementIsLetterInput) {
                    this.handlePickup(player);
                }
                break;
            case 't':
                if (!activeElementIsChatInput && !activeElementIsLetterInput) {
                    event.preventDefault();
                    this.hud.displayChat();
                    keys.delete(key);
                }
                break;
            case 'l':
                if (!activeElementIsChatInput && !activeElementIsLetterInput) {
                    event.preventDefault();
                    this.handleNewLetter(player)
                }
                break;
            case 'r':
                if (!activeElementIsChatInput && !activeElementIsLetterInput) {
                    this.handleReadLetter(player);
                }
                break;
            case 'Enter':
                if (activeElementIsChatInput) {
                    this.handleChatInput(player)
                } else if (activeElementIsLetterInput && !event.shiftKey) {
                    event.preventDefault();
                    this.handleLetterInput(player);
                }
                break;
            case 'Escape': 
                if (activeElementIsLetterInput) {
                    this.hud.hideLetterAndReturnMessage()
                }
                break;
        }
    }

    handleMining(player) {
        const targetBlock = Game.getTargetBlock(player);
        this.ws.send(JSON.stringify({
            type: 'mine',
            blockX: targetBlock.x,
            blockY: targetBlock.y
        }));
    }

    handlePickup(player) {
        const targetBlock = Game.getTargetBlock(player);
        this.ws.send(JSON.stringify({
            type: 'pickup',
            blockX: targetBlock.x,
            blockY: targetBlock.y
        }));
    }

    handleNewLetter(player) {
        const targetBlock = Game.getTargetBlock(player);
        if (terrain[targetBlock.y]?.[targetBlock.x] === BLOCK_TYPE.EMPTY) {
            this.hud.displayLetterInput()
        }
    }

    handleReadLetter(player) {
        const targetBlock = Game.getTargetBlock(player);
        this.ws.send(JSON.stringify({
            type: 'read',
            blockX: targetBlock.x,
            blockY: targetBlock.y
          }));
    }

    handleChatInput(player) {
        const message = this.hud.hideChatAndReturnMessage()
        if (message) {
            this.ws.send(JSON.stringify({
                type: 'chat',
                id: player.id,
                message
            }))
        }
    }

    handleLetterInput(player) {
        const letter = this.hud.hideLetterAndReturnMessage()
        if (letter) {
            const targetBlock = Game.getTargetBlock(player);
            this.ws.send(JSON.stringify({
                type: 'placeLetter',
                message: letter,
                blockX: targetBlock.x,
                blockY: targetBlock.y
            }));
        }
    }

    handleMovement(player) {
        this.ws.send(JSON.stringify({
            type: 'move',
            x: player.x,
            y: player.y,
            direction: player.direction,
            moving: player.moving
        }));
    }

    isWalkableArea(blockX, blockY) {
        return this.terrain[blockY]?.[blockX] == BLOCK_TYPE.EMPTY 
            || terrain[blockY]?.[blockX] == BLOCK_TYPE.EMPTY_WITH_BANANA 
            || terrain[blockY]?.[blockX] == BLOCK_TYPE.ZONE
    }

    handlePlayerMovement(deltaTime, keys) {
        const myPlayer = players.get(myId);
        if (myPlayer) {
            const speed = BASE_SPEED * deltaTime;
            let newX = myPlayer.x;
            let newY = myPlayer.y;
            let moved = false;
            let newDirection = myPlayer.direction;
            
            if (keys.has('ArrowLeft')) {
              newX -= speed;
              newDirection = 'left';
            }
            if (keys.has('ArrowRight')) {
              newX += speed;
              newDirection = 'right';
            }
            if (keys.has('ArrowUp')) {
              newY -= speed;
              newDirection = 'up';
            }
            if (keys.has('ArrowDown')) {
              newY += speed;
              newDirection = 'down';
            }
    
            // Check collision with terrain
            const blockX = Math.floor(newX / GRID_SIZE);
            const blockY = Math.floor(newY / GRID_SIZE);
            
            if (this.isWalkableArea(blockX, blockY)) {
              moved = newX !== myPlayer.x || newY !== myPlayer.y;
              myPlayer.x = newX;
              myPlayer.y = newY;
            }
    
            // Always update direction, even if movement is blocked
            if (newDirection !== myPlayer.direction || moved) {
                myPlayer.direction = newDirection;
                myPlayer.moving = moved;
                this.handleMovement(myPlayer)
    
                viewportX = myPlayer.x - this.canvas.width / 2;
                viewportY = myPlayer.y - this.canvas.height / 2;
            }
    
            myPlayer.moving = moved;

            this.hud.updatePosition(Math.floor(myPlayer.x / GRID_SIZE), Math.floor(myPlayer.y / GRID_SIZE))
        }
    }

    gameLoop(timestamp, keys) {
        // GET ANIMATION STATE
        const deltaTime = (timestamp - this.lastFrameTime) / 1000;
        this.lastFrameTime = timestamp;

        if (timestamp - this.lastAnimationUpdate > ANIMATION_SPEED) {
            this.currentAnimationFrame = (this.currentAnimationFrame + 1) % ANIMATION_FRAMES;
            this.lastAnimationUpdate = timestamp;
        }
    
        if (timestamp - lastZoneAnimationUpdate > ZONE_ANIMATION_SPEED) {
            this.currentZoneFrame = (currentZoneFrame + 1) % ZONE_ANIMATION_FRAMES;
            this.lastZoneAnimationUpdate = timestamp;
        }

        // HANDLE MOVEMENT
        this.handlePlayerMovement(deltaTime, keys);

        // RENDER MAP
        this.renderer.render(this);
    }
}