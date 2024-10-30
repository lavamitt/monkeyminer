import { MIN_DISTANCE_BETWEEN_ZONES } from '../shared/constants.js';

/**
 * Represents a zone in the game
 */
class Zone {
    /**
     * @param {number} x - Zone's top-left X coordinate
     * @param {number} y - Zone's top-left Y coordinate
     * @param {number} width - Zone width
     * @param {number} height - Zone height
     * @param {number} requiredMonkeys - Number of monkeys needed to complete the zone
     */
    constructor(x, y, width, height, requiredMonkeys) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.requiredMonkeys = requiredMonkeys;
        this.currentMonkeys = new Set();
        this.completed = false;
        this.key = `${x},${y}`;
    }

    static tooCloseToNearestZone(blockX, blockY, zones) {
        for (let [_, zone] of zones) {
            // Find closest x and y points on the zone
            const closestX = Math.max(zone.x, Math.min(blockX, zone.x + zone.width - 1));
            const closestY = Math.max(zone.y, Math.min(blockY, zone.y + zone.height - 1));
            
            // Calculate distance to closest point
            const distance = Math.sqrt(
                Math.pow(x - closestX, 2) + 
                Math.pow(y - closestY, 2)
            );
            
            if (distance < MIN_DISTANCE_BETWEEN_ZONES) {
                return true;
            }
        }
        return false;
    }

    static isInZone(blockX, blockY, zones) {
        for (let [_, zone] of zones) {
            if (blockX >= zone.x && blockX < zone.x + zone.width &&
                blockY >= zone.y && blockY < zone.y + zone.height) {
                return zone.key;
            }
        }
        return null;
    }

    hasMonkey(monkeyId) {
        this.currentMonkeys.has(monkeyId);
    }
  
    /**
     * Add a monkey to the zone
     * @param {string} monkeyId - ID of the monkey to add
     * @returns {boolean} Whether zone is now completed
     */
    addMonkey(monkeyId) {
        this.currentMonkeys.add(monkeyId);
        if (this.currentMonkeys.size >= this.requiredMonkeys && !this.completed) {
            this.completed = true;
            return true;
        }
        return false;
    }
  
    /**
     * Remove a monkey from the zone
     * @param {string} monkeyId - ID of the monkey to remove
     */
    removeMonkey(monkeyId) {
        this.currentMonkeys.delete(monkeyId);
    }
  
    /**
     * Check if a position is within this zone
     * @param {number} x - X coordinate to check
     * @param {number} y - Y coordinate to check
     * @returns {boolean}
     */
    containsPosition(x, y) {
        return x >= this.x && x < this.x + this.width &&
            y >= this.y && y < this.y + this.height;
    }
  
    /**
     * Convert zone to network-safe format
     * @returns {Object} Serialized zone data
     */
    toJSON() {
        return {
            key: this.key,
            x: this.x,
            y: this.y,
            width: this.width,
            height: this.height,
            requiredMonkeys: this.requiredMonkeys,
            currentMonkeys: Array.from(this.currentMonkeys),
            completed: this.completed
        };
    }
}