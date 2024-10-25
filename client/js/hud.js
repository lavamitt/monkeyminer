export class HeadsUpDisplay {

    constructor(elements) {
        this.elements = {
            playerCount: elements.playerCount,
            position: elements.position,
            score: elements.score,
            monkeyId: elements.monkeyId,
            topScores: elements.topScores,
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

    clearChatAndReturnMessage() {
        const message = this.hud.elements.chatInput.value;
        this.hud.elements.chatInput.style.display = "none";
        this.hud.elements.chatInput.value = "";
        return message;
    }

    displayLetter(author, date, message) {
        this.elements.letterAuthor.textContent = author;
        this.elements.letterTime.textContent = date;
        this.elements.letterText.textContent = message;
        this.elements.letterReadingUI.style.display = 'block'
    }








}