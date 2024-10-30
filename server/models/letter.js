/**
 * Represents a letter in the game
 */
export class Letter {
    /**
     * @param {string} authorId - ID of the player who wrote the letter
     * @param {string} content - Letter content
     * @param {Object} position - Letter position in the game world
     * @param {number} position.x - X coordinate
     * @param {number} position.y - Y coordinate
     */
    constructor(authorId, content, blockX, blockY) {
        this.authorId = authorId;
        this.content = content;
        this.x = blockX;
        this.y = blockY;
        this.timestamp = Date.now();
        this.key = `${blockX},${blockY}`;
    }
  
    /**
     * Check if a position matches this letter's position
     * @param {number} x - X coordinate to check
     * @param {number} y - Y coordinate to check
     * @returns {boolean}
     */
    isAtPosition(x, y) {
        return this.x === x && this.y === y;
    }
  
    /**
     * Convert letter to network-safe format for storage
     * @returns {Object} Serialized letter data
     */
    toJSON() {
        return {
            authorId: this.authorId,
            content: this.content,
            x: this.x,
            y: this.y,
            timestamp: this.timestamp
        };
    }
  }
  