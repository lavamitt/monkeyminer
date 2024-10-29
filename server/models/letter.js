/**
 * Represents a letter in the game
 */
class Letter {
    /**
     * @param {string} authorId - ID of the player who wrote the letter
     * @param {string} content - Letter content
     * @param {Object} position - Letter position in the game world
     * @param {number} position.x - X coordinate
     * @param {number} position.y - Y coordinate
     */
    constructor(authorId, content, position) {
        this.authorId = authorId;
        this.content = content;
        this.position = position;
        this.timestamp = Date.now();
        this.id = `${position.x},${position.y}`;
    }
  
    /**
     * Check if a position matches this letter's position
     * @param {number} x - X coordinate to check
     * @param {number} y - Y coordinate to check
     * @returns {boolean}
     */
    isAtPosition(x, y) {
        return this.position.x === x && this.position.y === y;
    }
  
    /**
     * Convert letter to network-safe format for reading
     * @returns {Object} Serialized letter data
     */
    toReadFormat() {
        return {
            authorId: this.authorId,
            message: this.content,
            timestamp: this.timestamp
        };
    }
  
    /**
     * Convert letter to network-safe format for storage
     * @returns {Object} Serialized letter data
     */
    toJSON() {
        return {
            id: this.id,
            authorId: this.authorId,
            content: this.content,
            position: this.position,
            timestamp: this.timestamp
        };
    }
  }
  