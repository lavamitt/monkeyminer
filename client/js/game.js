
export class Game {
    constructor(canvas, ctx, ws, hud) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.ws = ws;
        this.hud = hud;

        // game state
        let players = new Map();
        let myId = null;
        let viewportX = 0;
        let viewportY = 0;
        let terrain = [];
        let zones = new Map();
        let messages = new Map();

        // animation state
        let lastFrameTime = 0;
        // general animation
        let animationFrame = 0;
        let lastAnimationUpdate = 0;
        // zone animation
        let lastZoneAnimationUpdate = 0;
        let currentZoneFrame = 0;

        // Set up WebSocket handlers
        this.setupWebSocket();
    }

    setupWebSocket() {
        this.ws.onMessage(data => {
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
    }

    handlePlayerLeave(data) {
        this.players.delete(data.id)
    }

    handlePlayerMove(data) {
        // we exclude the current player since we've already updated optimistically.
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
        // letterAuthorElement.textContent = author ? `monkey_${data.authorId}` : 'Unknown Monkey';
        // letterTimeElement.textContent = new Date(data.timestamp).toLocaleString();
        // letterTextElement.textContent = data.message;
        // letterReadingUIElement.style.display = 'block';
    }



    // SET UP KEY ACTIONS
    getTargetBlock(player) {
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

    handleKeyDownEvent(event) {
        // If chat or letter input is focused, don't handle game controls
        // if (document.activeElement.tagName === 'INPUT' || 
        //     document.activeElement.tagName === 'TEXTAREA') {
        //     return;
        // }

        const activeElementIsChatInput = document.activeElement === this.hud.elements.chatInput
        const activeElementIsLetterInput = document.activeElement === this.hud.elements.letterInput

        const player = this.players.get(this.myId);
        if (!player) return;

        const key = event.key;

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
                    e.preventDefault();
                    this.hud.displayChat()
                    // keys delete key??
                }
                break;
            case 'l':
                if (!activeElementIsChatInput && !activeElementIsLetterInput) {
                    e.preventDefault();
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
                } else if (activeElementIsLetterInput && !e.shiftKey) {
                    e.preventDefault();
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
        const targetBlock = this.getTargetBlock(player);
        this.ws.send(JSON.stringify({
            type: 'mine',
            blockX: targetBlock.x,
            blockY: targetBlock.y
        }));
    }

    handlePickup(player) {
        const targetBlock = this.getTargetBlock(player);
        this.ws.send(JSON.stringify({
            type: 'pickup',
            blockX: targetBlock.x,
            blockY: targetBlock.y
        }));
    }

    handleNewLetter(player) {
        const targetBlock = this.getTargetBlock(player);
        if (terrain[targetBlock.y]?.[targetBlock.x] === BLOCK_TYPE.EMPTY) {
            this.hud.displayLetterInput()
        }
    }

    handleReadLetter(player) {
        const targetBlock = this.getTargetBlock(player);
        this.ws.send(JSON.stringify({
            type: 'read',
            blockX: targetBlock.x,
            blockY: targetBlock.y
          }));
    }

    handleChatInput(player) {
        const message = this.hud.clearChatAndReturnMessage()
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
            const targetBlock = getTargetBlock(player);
            ws.send(JSON.stringify({
                type: 'placeLetter',
                message: letter,
                blockX: targetBlock.x,
                blockY: targetBlock.y
              }));
        }
    }
}