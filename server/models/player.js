import { DIRECTIONS } from '../shared/constants.js';

/**
 * Represents a player in the game
 */
export class Player {
      /**
     * @param {string} id - Unique identifier for the player
     * @param {number} startX - Initial X coordinate
     * @param {number} startY - Initial Y coordinate
     */
    constructor(id, startX, startY) {
        this.id = id;
        this.x = startX;
        this.y = startY;
        this.color = this.generateColor();
        this.direction = DIRECTIONS.RIGHT;
        this.score = 0;
        this.inventory = [];
        this.moving = false;
    }

    /**
     * Generate a random color for the player
     * @returns {string} Hex color code
     */
    generateColor() {
        return '#' + Math.floor(Math.random()*16777215).toString(16);
    }

    /**
     * Update player position
     * @param {number} x - New X coordinate
     * @param {number} y - New Y coordinate
     * @param {string} direction - New direction
     */
    updatePosition(x, y, direction) {
        this.x = x;
        this.y = y;
        this.direction = direction;
    }

    addToScore(new_score) {
        this.score += new_score;
    }

    updateScore(new_score) {
        this.score = new_score;
    }

    /**
     * Add item to player's inventory
     * @param {string} item - Item to add
     */
    addToInventory(item) {
        this.inventory.push(item);
    }

    /**
     * Remove item from player's inventory
     * @param {string} item - Item to remove
     * @returns {boolean} Whether item was successfully removed
     */
    removeFromInventory(item) {
        const index = this.inventory.indexOf(item);
        if (index > -1) {
            this.inventory.splice(index, 1);
            return true;
        }
        return false;
    }

      /**
     * Convert player data to network-safe format
     * @returns {Object} Serialized player data
     */
    toJSON() {
        return {
            id: this.id,
            x: this.x,
            y: this.y,
            color: this.color,
            direction: this.direction,
            score: this.score,
            inventory: this.inventory,
            moving: this.moving
        };
    }
}