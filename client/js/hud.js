export class HeadsUpDisplay {

    constructor(elements) {
        this.elements = {
            playerCount: elements.playerCount,
            position: elements.position,
            score: elements.score,
            topScores: elements.topScores,
            monkeyId: elements.monkeyId,
            inventorySlot: elements.inventorySlot,
            chatInput: elements.chatInput,
            
            // for letter writing
            letterWritingUI: elements.letterWritingUI,
            letterInput: elements.letterInput,

            // for letter reading
            letterReadingUI: elements.letterReadingUI,
            letterAuthor: elements.letterAuthor,
            letterTime: elements.letterTime,
            letterText: elements.letterText,
            closeLetterButton: elements.closeLetterButton,
        };

        // Get 2D context for inventory canvas
        this.inventoryCtx = this.elements.inventorySlot.getContext('2d');

        // set up button to close
        this.elements.closeLetterButton.addEventListener('click', () => {
            letterReadingUI.style.display = 'none';
        });
    }


    updateMonkeyId(id) {
        this.elements.monkeyId.textContent = "monkey_" + id;
    }

    displayChat() {
        this.elements.chatInput.style.display = "block";
        this.elements.chatInput.focus();
    }

    hideChatAndReturnMessage() {
        const message = this.elements.chatInput.value;
        this.elements.chatInput.style.display = "none";
        this.elements.chatInput.value = "";
        return message;
    }

    displayLetterInput() {
        this.elements.letterWritingUI.style.display = "block";
        this.elements.letterInput.focus();
    }

    hideLetterAndReturnMessage() {
        const letter = this.elements.letterInput.value;
        this.elements.letterWritingUI.style.display = "none";
        this.elements.letterInput.value = "";
        return letter;
    }

    displayLetter(author, date, message) {
        this.elements.letterAuthor.textContent = author;
        this.elements.letterTime.textContent = date;
        this.elements.letterText.textContent = message;
        this.elements.letterReadingUI.style.display = 'block'
    }

    updatePosition(blockX, blockY) {
        this.elements.position.textContent = `${blockX}, ${blockY}`;
    }

    updateNumPlayers(num) {
        this.elements.playerCount.textContent = num;
    }

    updateScores(players, myId) {
        const current_players = Array.from(players.values());
        current_players.sort((a, b) => b.score - a.score);
        this.elements.topScores.innerHTML = current_players.map((player) => "monkey_" + player.id + ": " + player.score).join('<br>');

        const myPlayer = players.get(myId);
        if (myPlayer) {
            this.elements.score.textContent = myPlayer.score
        }
    }
}