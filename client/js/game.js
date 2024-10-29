import {
    GRID_SIZE,
    BLOCK_TYPE,
    BASE_SPEED,
    ANIMATION_SPEED,
    ANIMATION_FRAMES,
    ZONE_ANIMATION_SPEED,
    ZONE_ANIMATION_FRAMES,
    WEBSOCKET_SERVER_TO_CLIENT_EVENTS,
    WEBSOCKET_CLIENT_TO_SERVER_EVENTS,
    DIRECTIONS
} from "../shared/constants.js"

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
        this.ws.onmessage = (event => {
            const data = JSON.parse(event.data);
            switch (data.type) {
                case WEBSOCKET_SERVER_TO_CLIENT_EVENTS.INIT:
                this.handleInit(data);
                break;
            case WEBSOCKET_SERVER_TO_CLIENT_EVENTS.PLAYER_JOIN:
                this.handlePlayerJoin(data);
                break;
            case WEBSOCKET_SERVER_TO_CLIENT_EVENTS.PLAYER_LEAVE:
                this.handlePlayerLeave(data);
                break;
            case WEBSOCKET_SERVER_TO_CLIENT_EVENTS.PLAYER_MOVE:
                this.handlePlayerMove(data);
                break;
            case WEBSOCKET_SERVER_TO_CLIENT_EVENTS.TERRAIN_UPDATE:
                this.handleTerrainUpdate(data);
                break;
            case WEBSOCKET_SERVER_TO_CLIENT_EVENTS.ZONE_UPDATE:
                this.handleZoneUpdate(data);
                break;
            case WEBSOCKET_SERVER_TO_CLIENT_EVENTS.SCORE_UPDATE:
                this.handleScoreUpdate(data);
                break;
            case WEBSOCKET_SERVER_TO_CLIENT_EVENTS.INVENTORY_UPDATE:
                this.handleInventoryUpdate(data);
                break;
            case WEBSOCKET_SERVER_TO_CLIENT_EVENTS.CHAT_UPDATE:
                this.handleChatUpdate(data);
                break;
            case WEBSOCKET_SERVER_TO_CLIENT_EVENTS.LETTER_TO_READ:
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
        this.hud.updateNumPlayers(this.players.size);
        this.hud.updateScores(this.players, this.myId);
    }

    handlePlayerJoin(data) {
        this.players.set(data.id, data.player);
        this.hud.updateNumPlayers(this.players.size);
        this.hud.updateScores(this.players, this.myId);
    }

    handlePlayerLeave(data) {
        this.players.delete(data.id)
        this.hud.updateNumPlayers(this.players.size);
        this.hud.updateScores(this.players, this.myId);
    }

    handlePlayerMove(data) {
        // we exclude the current player since we've already updated optimistically in the gameloop.
        if (this.players.has(data.id) && data.id !== this.myId) {
            const player = this.players.get(data.id);
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
        this.hud.updateScores(this.players, this.myId)
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
        const author = this.players.get(data.authorId) ? `monkey_${data.authorId}` : 'Unknown Monkey';
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
            type: WEBSOCKET_CLIENT_TO_SERVER_EVENTS.MINE,
            blockX: targetBlock.x,
            blockY: targetBlock.y
        }));
    }

    handlePickup(player) {
        const targetBlock = Game.getTargetBlock(player);
        this.ws.send(JSON.stringify({
            type: WEBSOCKET_CLIENT_TO_SERVER_EVENTS.PICKUP,
            blockX: targetBlock.x,
            blockY: targetBlock.y
        }));
    }

    handleNewLetter(player) {
        const targetBlock = Game.getTargetBlock(player);
        if (this.terrain[targetBlock.y]?.[targetBlock.x] === BLOCK_TYPE.EMPTY) {
            this.hud.displayLetterInput()
        }
    }

    handleReadLetter(player) {
        const targetBlock = Game.getTargetBlock(player);
        this.ws.send(JSON.stringify({
            type: WEBSOCKET_CLIENT_TO_SERVER_EVENTS.READ,
            blockX: targetBlock.x,
            blockY: targetBlock.y
          }));
    }

    handleChatInput(player) {
        const message = this.hud.hideChatAndReturnMessage()
        if (message) {
            this.ws.send(JSON.stringify({
                type: WEBSOCKET_CLIENT_TO_SERVER_EVENTS.CHAT,
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
                type: WEBSOCKET_CLIENT_TO_SERVER_EVENTS.PLACE_LETTER,
                message: letter,
                blockX: targetBlock.x,
                blockY: targetBlock.y
            }));
        }
    }

    handleMovement(player) {
        this.ws.send(JSON.stringify({
            type: WEBSOCKET_CLIENT_TO_SERVER_EVENTS.MOVE,
            x: player.x,
            y: player.y,
            direction: player.direction,
            moving: player.moving
        }));
    }

    isWalkableArea(blockX, blockY) {
        return this.terrain[blockY]?.[blockX] == BLOCK_TYPE.EMPTY 
            || this.terrain[blockY]?.[blockX] == BLOCK_TYPE.EMPTY_WITH_BANANA 
            || this.terrain[blockY]?.[blockX] == BLOCK_TYPE.ZONE
    }

    handlePlayerMovement(deltaTime, keys) {
        const myPlayer = this.players.get(this.myId);
        if (myPlayer) {
            const speed = BASE_SPEED * deltaTime;
            let newX = myPlayer.x;
            let newY = myPlayer.y;
            let moved = false;
            let newDirection = myPlayer.direction;
            
            if (keys.has('ArrowLeft')) {
              newX -= speed;
              newDirection = DIRECTIONS.LEFT;
            }
            if (keys.has('ArrowRight')) {
              newX += speed;
              newDirection = DIRECTIONS.RIGHT;
            }
            if (keys.has('ArrowUp')) {
              newY -= speed;
              newDirection = DIRECTIONS.UP;
            }
            if (keys.has('ArrowDown')) {
              newY += speed;
              newDirection = DIRECTIONS.DOWN;
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
    
                this.viewportX = myPlayer.x - this.canvas.width / 2;
                this.viewportY = myPlayer.y - this.canvas.height / 2;
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
    
        if (timestamp - this.lastZoneAnimationUpdate > ZONE_ANIMATION_SPEED) {
            this.currentZoneFrame = (this.currentZoneFrame + 1) % ZONE_ANIMATION_FRAMES;
            this.lastZoneAnimationUpdate = timestamp;
        }

        // HANDLE MOVEMENT
        this.handlePlayerMovement(deltaTime, keys);

        // RENDER MAP
        this.renderer.render(this);
    }
}