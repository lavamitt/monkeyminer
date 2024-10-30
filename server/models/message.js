import { CHAT_MESSAGE_DURATION } from '../../shared/constants.js';

/**
 * Represents a chat message in the game
 */
export class Message {
    /**
     * @param {string} playerId - ID of the player who sent the message
     * @param {string} content - Message content
     * @param {number} duration - How long the message should last in milliseconds
     */
    constructor(playerId, content, duration = CHAT_MESSAGE_DURATION) {
        this.playerId = playerId;
        this.content = content;
        this.timestamp = Date.now();
        this.expiration = this.timestamp + duration;
    }
  
    /**
     * Check if message has expired
     * @returns {boolean}
     */
    isExpired() {
        return Date.now() > this.expiration;
    }
  
    /**
     * Get remaining time for message
     * @returns {number} Milliseconds remaining
     */
    getRemainingTime() {
        return Math.max(0, this.expiration - Date.now());
    }
  
    /**
     * Convert message to network-safe format
     * @returns {Object} Serialized message data
     */
    toJSON() {
        return {
            playerId: this.playerId,
            message: this.content,
            expiration: this.expiration
        };
    }
}