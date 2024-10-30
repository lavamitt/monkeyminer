import { 
    BLOCK_TYPE,
    WORLD_SIZE,
    START_AREA_SIZE,
    GRID_SIZE,
    NUM_ZONES,
    MAX_ZONE_SIDE,
    MIN_ZONE_SIDE,
    MIN_REQUIRED_MONKEYS,
    MAX_REQUIRED_MONKEYS,
    MINEABLE_BLOCKS,
    ORE_SPAWN_CHANCE
} from '../shared/constants.js';
import { Zone } from './models/zone.js';
import { Player } from './models/player.js';
import { Message } from './models/message.js';
import { Letter } from './models/letter.js';

export class GameState {
    constructor() {
        this.players = new Map();
        this.messages = new Map();
        this.letters = new Map();
        this.zones = new Map();

        // starting area top left corner
        this.startX = Math.floor(WORLD_SIZE / 2 - START_AREA_SIZE / 2);
        this.startY = Math.floor(WORLD_SIZE / 2 - START_AREA_SIZE / 2);

        // where new players spawn
        this.spawnX = (this.startX + START_AREA_SIZE/2) * GRID_SIZE;
        this.spawnY = (this.startY + START_AREA_SIZE/2) * GRID_SIZE;

        this.terrain = this.generateTerrain();
    }

    // TERRAIN GENERATION LOGIC

    generateTerrain() {
        const terrain = new Array(WORLD_SIZE).fill(null)
            .map(() => new Array(WORLD_SIZE).fill(BLOCK_TYPE.DIRT));

        this.setUpStartingArea(terrain);

        this.addRandomOre(terrain);

        this.addRandomZones(terrain);

        return terrain;
    }

    setUpStartingArea(terrain) {
        for (let y = this.startY; y < this.startY + START_AREA_SIZE; y++) {
            for (let x = this.startX; x < this.startX + START_AREA_SIZE; x++) {
                terrain[y][x] = BLOCK_TYPE.EMPTY;
            }
        }
    }

    addRandomOre(terrain) {
        for (let y = 0; y < WORLD_SIZE; y++) {
            for (let x = 0; x < WORLD_SIZE; x++) {
                if (terrain[y][x] !== BLOCK_TYPE.EMPTY) {
                    if (Math.random() < ORE_SPAWN_CHANCE) {
                        terrain[y][x] = BLOCK_TYPE.ORE;
                    }
                }
            }
        }
    }

    addRandomZones(terrain) {
        let zonesCreated = 0;
        while (zonesCreated < NUM_ZONES) {
            const zoneWidth = Math.floor(Math.random() * (MAX_ZONE_SIDE - MIN_ZONE_SIDE) + MIN_ZONE_SIDE)
            const zoneHeight = Math.floor(Math.random() * (MAX_ZONE_SIDE - MIN_ZONE_SIDE) + MIN_ZONE_SIDE)

            const x = Math.floor(Math.random() * (WORLD_SIZE - zoneWidth));
            const y = Math.floor(Math.random() * (WORLD_SIZE - zoneHeight));

            let isValidLocation = true;
            // Check if entire zone area is empty and far from other zones
            for (let dy = 0; dy < zoneHeight; dy++) {
                for (let dx = 0; dx < zoneWidth; dx++) {
                    if (terrain[y + dy][x + dx] == BLOCK_TYPE.EMPTY || 
                        Zone.tooCloseToNearestZone(x + dx, y + dy, this.zones)) {
                            isValidLocation = false;
                            break;
                    }
                }
                if (!isValidLocation) break;
            }

            if (isValidLocation) {
                for (let dy = 0; dy < zoneHeight; dy++) {
                    for (let dx = 0; dx < zoneWidth; dx++) {
                        terrain[y + dy][x + dx] = BLOCK_TYPE.ZONE;
                    }
                }
                
                const requiredMonkeys = Math.floor(Math.random() * (MAX_REQUIRED_MONKEYS - MIN_REQUIRED_MONKEYS) + MIN_REQUIRED_MONKEYS);
                let newZone = new Zone(x, y, zoneWidth, zoneHeight, requiredMonkeys);

                this.zones.set(newZone.key, newZone);
                zonesCreated += 1;
            }
        }
    }

    // GET/SET METHODS FOR TERRAIN

    getBlock(blockX, blockY) {
        return this.terrain[blockY][blockX];
    }

    setBlock(blockX, blockY, blockType) {
        this.terrain[blockY][blockX] = blockType;
    }

    isMineableBlock(blockX, blockY) {
        if (blockX >= 0 && blockX < WORLD_SIZE 
            && blockY >= 0 && blockY < WORLD_SIZE 
            && MINEABLE_BLOCKS.includes(this.getBlock(blockX,blockY))) {
                return true;
        }
        return false;
    }

    getZone(key) {
        return this.zones.get(key);
    }

    // GET/SET METHODS FOR PLAYERS

    addNewPlayer(playerId) {
        const newPlayer = new Player(playerId, this.spawnX, this.spawnY);
        this.players.set(playerId, newPlayer);
        return newPlayer;
    }

    getPlayer(playerId) {
        return this.players.get(playerId);
    }

    removePlayer(playerId) {
        this.players.delete(playerId);
    }

    // GET/SET METHODS FOR MESSAGES AND LETTERS

    addNewMessage(playerId, content) {
        const newMessage = new Message(playerId, content);
        this.messages.set(playerId, newMessage);
        return newMessage;
    }

    addNewLetter(playerId, content, blockX, blockY) {
        if (this.getBlock(blockX, blockY) === BLOCK_TYPE.EMPTY) {
            const newLetter = new Letter(playerId, content, blockX, blockY);
            this.letters.set(newLetter.key, newLetter);
            this.setBlock(blockX, blockY, BLOCK_TYPE.EMPTY_WITH_ENVELOPE);
            return newLetter
        }
        return null;
    }

    getLetter(blockX, blockY) {
        const letterKey = `${blockX},${blockY}`;
        return this.letters.get(letterKey);
    }

     /**
     * Convert gamestate data to network-safe format
     * @returns {Object} Serialized game state data
     */
     toJSON() {
        return {
            players: Array.from(this.players.entries()).map(([_, player]) => player.toJSON()),
            terrain: this.terrain,
            zones: Array.from(this.zones.entries()).map(([_, zone]) => zone.toJSON()),
            messages: Array.from(this.messages.entries()).map(([_, msg]) => msg.toJSON()),
            gridSize: GRID_SIZE
        };
    }
}