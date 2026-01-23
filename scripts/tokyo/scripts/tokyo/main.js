class Game {
  constructor(canvas, context){
    this.canvas = canvas;
    this.ctx = context;
    this.width = this.canvas.width;
    this.height = this.canvas.height;
    this.baseHeight = 720;
    this.ratio = this.height / this.baseHeight;

    this.background = new Background(this);
    this.player = new Player(this);
    this.sound = new AudioControl();

    this.obstacles = [];
    this.numberOfObstacles = 12;

    this.gravity;
    this.speed;
    this.minSpeed;
    this.maxSpeed;

    this.startingScore = 18;
    this.score = this.startingScore;
    this.gameOver = false;
    this.gameWin = false;

    this.bottomMargin;
    this.timer = 0;

    this.message1 = "";
    this.message2 = "";

    this.smallFont;
    this.largeFont;

    this.eventTimer = 0;
    this.eventInterval = 150;
    this.eventUpdate = false;

    this.touchStartX;
    this.swipeDistance = 50;

    this.debug = false;

    this.resize(window.innerWidth, window.innerHeight);

    window.addEventListener('resize', e => {
      this.resize(e.currentTarget.innerWidth, e.currentTarget.innerHeight); 
    });

    this.canvas.addEventListener('mousedown', () => this.player.flap());
    this.canvas.addEventListener('mouseup', () => {
      setTimeout(() => this.player.wingsUp(), 50);
    });

    window.addEventListener('keydown', e => {
      if (e.key === ' ' || e.key === 'Enter') this.player.flap();
      if (e.key === 'Shift' || e.key.toLowerCase() === 'c') this.player.startCharge();
    });

    window.addEventListener('keyup', () => this.player.wingsUp());

    this.canvas.addEventListener('touchstart', e => {
      this.player.flap();
      this.touchStartX = e.changedTouches[0].pageX;
    });

    this.canvas.addEventListener('touchmove', e => e.preventDefault());

    this.canvas.addEventListener('touchend', e => {
      if (e.changedTouches[0].pageX - this.touchStartX > this.swipeDistance){
        this.player.startCharge();
      } else {
        this.player.flap();  
      }
    });
  }

  resize(width, height){
    this.canvas.width = width;
    this.canvas.height = height;

    this.ctx.textAlign = 'right';
    this.ctx.lineWidth = 1;

    this.width = this.canvas.width;
    this.height = this.canvas.height;

    this.ratio = this.height / this.baseHeight;
    this.bottomMargin = Math.floor(50 * this.ratio);

    this.smallFont = Math.ceil(20 * this.ratio);
    this.largeFont = Math.ceil(40 * this.ratio);

    this.ctx.font = this.smallFont + 'px citrus-gothic-solid';

    this.gravity = 0.15 * this.ratio;
    this.speed = 4 * this.ratio;
    this.minSpeed = this.speed;
    this.maxSpeed = this.speed * 5;

    this.background.resize();
    this.player.resize();

    this.createObstacles();

    this.score = 18;
    this.levelScore = 0;
    this.gameOver = false;
    this.gameWin = false;
    this.timer = 0;
  }

  render(deltaTime){
    this.timer += deltaTime;
    this.handlePeriodicEvents(deltaTime);

    this.background.update();
    this.background.draw();

    this.player.update();
    this.player.draw();

    // Update & draw obstacles ONLY while playing
    if (!this.gameOver && !this.gameWin) {
      this.obstacles.forEach(obstacle => {
        obstacle.update();
        obstacle.draw();
      });

      // REMOVE obstacles that passed off screen
      this.obstacles = this.obstacles.filter(
        obstacle => !obstacle.markedForDeletion
      );
    }

    // WIN CONDITION — based on score (reliable)
    
    if (
      !this.gameOver &&
      !this.gameWin &&
      this.levelScore >= this.numberOfObstacles
    ) {
      this.triggerGameWin();
    }

    this.drawStatusText();

    // End screens
    if (this.gameOver || this.gameWin) {
      this.ctx.fillStyle = 'rgba(254, 247, 233, 0.9)';
      this.ctx.fillRect(0, 0, this.width, this.height);

      this.ctx.fillStyle = 'rgba(6, 74, 118, 0.8)';
      this.ctx.textAlign = 'center';

      this.ctx.font = this.largeFont + 'px citrus-gothic-solid';
      this.ctx.fillText(this.message1, this.width * 0.5, this.height * 0.5 - this.largeFont);

      this.ctx.font = this.smallFont + 'px citrus-gothic-solid';
      this.ctx.fillText(this.message2, this.width * 0.5, this.height * 0.5 - this.smallFont + 20);
      this.ctx.fillText("REFRESH TO RESTART", this.width * 0.5, this.height * 0.5 + 40);
    }
  }

  createObstacles() {
    this.obstacles = [];
const startX = this.width + 100;
const obstacleSpacing = 600 * this.ratio;

// Use exactly numberOfObstacles
for (let i = 0; i < this.numberOfObstacles; i++) {
    this.obstacles.push(new Obstacle(this, startX + i * obstacleSpacing));
}
  }


 

  checkCollision(a, b){
    const dx = a.collisionX - b.collisionX;
    const dy = a.collisionY - b.collisionY;
    const distance = Math.hypot(dx, dy);
    const sumOfRadii = a.collisionRadius + b.collisionRadius;
    return distance <= sumOfRadii;
  }

  formatTimer(){
    return (this.timer * 0.001).toFixed(1);
  }

  handlePeriodicEvents(deltaTime){
    if (this.eventTimer < this.eventInterval){
      this.eventTimer += deltaTime;
      this.eventUpdate = false;
    } else {
      this.eventTimer = this.eventTimer % this.eventInterval;
      this.eventUpdate = true;
    }
  }

  triggerGameOver() {
    if (!this.gameOver && !this.gameWin) {
      this.gameOver = true;
      this.player.collided = true;
      this.sound.play(this.sound.lose);
      this.message1 = "NO MAYO! NO WAY!";
      this.message2 = "GET BACK IN THERE! COLLISION TIME: " + this.formatTimer() + " SECONDS";
    }
  }

  triggerGameWin() {
    if (!this.gameWin) {
      this.gameWin = true;
      this.sound.play(this.sound.win);
      this.message1 = "A TRUE HERO!";
      this.message2 = "CAN YOU DO IT FASTER THAN " + this.formatTimer() + " SECONDS?";

      // Show next world button after 2 seconds
      setTimeout(() => {
        const nextBtn = document.getElementById('nextWorldButton');
        if(nextBtn) {
          nextBtn.style.display = 'block';
        }
      }, 2000); // 2000ms = 2 seconds
    }
}


  drawStatusText(){
    this.ctx.save();

    this.ctx.fillStyle = 'rgb(254, 247, 233)';
    this.ctx.textAlign = 'right';
    this.ctx.fillText('SCORE: ' + this.score, this.width - this.smallFont , this.largeFont);

    this.ctx.textAlign = 'left';
    this.ctx.fillText('TIMER: ' + this.formatTimer(), this.smallFont, this.largeFont);

    if (this.player.energy <= 20)this.ctx.fillStyle = 'red';
        else if (this.player.energy >= this.player.maxEnergy) this.ctx.fillStyle = 'green';
        for (let i = 0; i < this.player.energy; i++){
            this.ctx.fillRect(10, this.height - 10 - 2 * i, 15, 2);
    }

    this.ctx.restore();
  }
}

window.addEventListener('load', function(){
  const canvas = document.getElementById('gameCanvas');
  const ctx = canvas.getContext('2d');

  canvas.width = 720;
  canvas.height = 720;

  const game = new Game(canvas, ctx);
  let lastTime = 0;

  function animate(timeStamp){
    const deltaTime = timeStamp - lastTime;
    lastTime = timeStamp;

    game.render(deltaTime);
    requestAnimationFrame(animate);
  }

  requestAnimationFrame(animate);
});
