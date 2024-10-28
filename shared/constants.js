// Game Grid & World
export const GRID_SIZE = 32;
export const WORLD_SIZE = 1000;
export const START_AREA_SIZE = 10;

// Block Types
export const BLOCK_TYPE = Object.freeze({
    EMPTY: 0,
    DIRT: 1,
    ORE: 2,
    EMPTY_WITH_BANANA: 3,
    EMPTY_WITH_ENVELOPE: 4,
    ZONE: 5
  });

// Player Movement & Animation
export const BASE_SPEED = 360; // pixels per second
export const ANIMATION_SPEED = 150; // milliseconds per frame
export const ANIMATION_FRAMES = 2; // number of frames in player animation

// Zone Configuration
export const NUM_ZONES = 1000;
export const MIN_ZONE_SIDE = 1;
export const MAX_ZONE_SIDE = 10;
export const MIN_REQUIRED_MONKEYS = 1;
export const MAX_REQUIRED_MONKEYS = 15;
export const MIN_DISTANCE_BETWEEN_ZONES = 10;

export const ZONE_ANIMATION_SPEED = 100;
export const ZONE_ANIMATION_FRAMES = 8;

// Game Generation
export const ORE_SPAWN_CHANCE = 0.1;

// Message System
export const CHAT_MESSAGE_DURATION = 5 * 1000; // 5 seconds
export const MAX_CHAT_LENGTH = 100;
export const MAX_LETTER_LENGTH = 500;

// WebSocket Events
export const WEBSOCKET_EVENTS = Object.freeze({
    INIT: 'init',
    PLAYER_JOIN: 'playerJoin',
    PLAYER_LEAVE: 'playerLeave',
    PLAYER_MOVE: 'playerMove',
    TERRAIN_UPDATE: 'terrainUpdate',
    ZONE_UPDATE: 'zoneUpdate',
    SCORE_UPDATE: 'scoreUpdate',
    INVENTORY_UPDATE: 'inventoryUpdate',
    CHAT_UPDATE: 'chatUpdate',
    LETTER_TO_READ: 'letterToRead'
});

// Server Configuration
export const SERVER_CONFIG = Object.freeze({
    PORT: 3000,
    HOST: '13.59.50.220',
    WS_URL: 'ws://13.59.50.220:3000'
  });
  
// Game Rules & Scoring
export const GAME_RULES = Object.freeze({
    MINE_ORE_SCORE: 1,
    ZONE_COMPLETION_BASE_SCORE: 10, // multiplied by number of monkeys
    BANANA_SPAWN_CHANCE: 0.05
});

// Directions
export const DIRECTIONS = Object.freeze({
    UP: 'up',
    DOWN: 'down',
    LEFT: 'left',
    RIGHT: 'right'
});