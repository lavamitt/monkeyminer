
import { BLOCK_TYPE, WORLD_SIZE, START_AREA_SIZE, GRID_SIZE, NUM_ZONES, MAX_ZONE_SIDE, MIN_ZONE_SIDE, MIN_REQUIRED_MONKEYS, MAX_REQUIRED_MONKEYS, BANANA } from '../shared/constants.js';
import { Zone } from './models/zone.js';
import { Player } from './moels/player.js';

class GameState {
    constructor() {
        this.players = new Map();
        this.messages = new Map();
        this.letters = new Map();
        this.zones = new Map();
        this.terrain = this.generateTerrain();

        // where new players spawn
        this.spawnX = Math.floor(WORLD_SIZE / 2 - START_AREA_SIZE / 2);
        this.spawnY = Math.floor(WORLD_SIZE / 2 - START_AREA_SIZE / 2);
    }

    generateTerrain() {
        const terrain = new Array(WORLD_SIZE).fill(null)
            .map(() => new Array(WORLD_SIZE).fill(BLOCK_TYPE.DIRT));

        this.setUpStartingArea(terrain);

        this.addRandomOre(terrain);

        this.addRandomZones(terrain);
    }

    setUpStartingArea(terrain) {
        const startX = this.spawnX;
        const startY = this.spawnY;
        for (let y = startY; y < startY + START_AREA_SIZE; y++) {
            for (let x = startX; x < startX + START_AREA_SIZE; x++) {
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
                        Zone.tooCloseToNearestZone(x + dx, y + dy, this.zones)) {
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
                let new_zone = new Zone(x, y, zone_width, zone_height, required_monkeys);

                zones.set(new_zone.id, new_zone);
                zones_created += 1;
            }
        }
    }

    addNewPlayer(id) {
        const new_player = new Player(id, this.spawnX, this.spawnY);
        this.players.set(id, new_player);
    }

    getPlayer(id) {
        return this.players.get(id);
    }

    movePlayer(id, x, y, direction) {
        const player = players.get(id);

        if (player) {
            player.updatePosition(x, y, direction);

            const player_block_x = Math.floor(player.x / GRID_SIZE);
            const player_block_y = Math.floor(player.y / GRID_SIZE);
            const zone_key = Zone.isInZone(player_block_x, player_block_y);

            if (zone_key && player.inventory.length > 0) {
                const zone = zones.get(zone_key);
                
                if (zone && !zone.completed) {
                    const zone_is_completed = zone.addMonkey(id);
                    if (zone_is_completed) {
                        zone.currentMonkeys.forEach(player_id => {
                            const zone_player = players.get(player_id);
                            if (zone_player) {
                                zone_player.updateScore(GAME_RULES.ZONE_COMPLETION_BASE_SCORE * zone.currentMonkeys.size);
                                zone_player.removeFromInventory(BANANA)
                            }
                        })
                    }
                }
            }
        }
    }

     /**
     * Convert gamestate data to network-safe format
     * @returns {Object} Serialized player data
     */
     toJSON() {
        return {
            players: Array.from(this.players.entries()).map(([_, player]) => player.toJSON()),
            terrain: this.terrain,
            zones: Array.from(zones.entries()).map(([_, zone]) => zone.toJSON()),
            messages: Array.from(messages.entries()).map(([_, msg]) => msg.toJSON()),
            gridSize: GRID_SIZE
        };
    }
}