class Obstacle {
    constructor(game, x) {
        this.game = game;
        this.spriteWidth = 120;
        this.spriteHeight = 120;
        this.scaledWidth = this.spriteWidth * this.game.ratio;
        this.scaledHeight = this.spriteHeight * this.game.ratio;
        this.x = x;
        this.y = Math.random() * (this.game.height - this.scaledHeight);
        this.collisionX = 0;
        this.collisionY = 0;
        this.collisionRadius = this.scaledWidth * 0.5;
        this.speedY = Math.random() < 0.5 ? -1 * this.game.ratio : 1 * this.game.ratio;
        this.markedForDeletion = false;
        this.scored = false; // ✅ New: track if this obstacle has already been scored
        this.image = document.getElementById('ketchup');
    }
    update() {
        if (!this.game.gameOver && !this.game.gameWin) {
            this.x -= this.game.speed;
            this.y += this.speedY;

            // Bounce vertically
            if (this.y <= 0 || this.y >= this.game.height - this.scaledHeight) {
                this.speedY *= -1;
            }

            // Check collision
            if (this.game.checkCollision(this, this.game.player)) {
                this.game.player.collided = true;
                this.game.player.stopCharge();
                this.game.triggerGameOver();
            }

            // Check if passed by player to increment score
            if (!this.scored && this.x + this.scaledWidth < this.game.player.x) {
                this.scored = true;
                this.game.score++;
                this.game.levelScore++;
            }
        } else if (this.game.gameOver) {
            this.speedY += 0.1; // gradual fall
        }

        this.collisionX = this.x + this.scaledWidth * 0.5;
        this.collisionY = this.y + this.scaledHeight * 0.5;

        // mark offscreen for deletion
        if (this.x + this.scaledWidth < 0) this.markedForDeletion = true;
    }

    draw() {
        if (this.image) {
            this.game.ctx.drawImage(this.image, 20, 0, 550, 550, this.x, this.y, this.scaledWidth, this.scaledHeight);
        }

        if (this.game.debug) {
            this.game.ctx.beginPath();
            this.game.ctx.arc(this.collisionX, this.collisionY, this.collisionRadius, 0, Math.PI * 2);
            this.game.ctx.stroke();
        }
    }

    resize() {
        this.scaledWidth = this.spriteWidth * this.game.ratio;
        this.scaledHeight = this.spriteHeight * this.game.ratio;
        this.collisionRadius = this.scaledWidth * 0.4;
    }

    isOffScreen() {
        return this.x < -this.scaledWidth || this.y > this.game.height;
    }
}


