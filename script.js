// Clinic Maze game
// Grid / maze generation using recursive backtracker

class Game {
  constructor() {
    // Settings
    this.PLAYER_COLOR = "#2c3e50";
    this.PILL_COLOR = "#d9534f";
    this.TIME_LEFT = 5;

    // Game state
    this.score = 0;
    this.timeLeft = this.TIME_LEFT;
    this.running = false;
    this.timerInterval = null;

    this.initializeElements();
    this.bindEvents();
    this.initializeGame();
  }

  initializeElements() {
    this.canvas = document.getElementById("game");
    this.startBtn = document.getElementById("startBtn");
    this.restartBtn = document.getElementById("restartBtn");

    this.scoreEl = document.getElementById("score");
    this.timeEl = document.getElementById("time");
    this.finalScoreEl = document.getElementById("finalScore");
  }

  bindEvents() {
    this.startBtn.addEventListener("click", () => this.startGame());
    this.restartBtn.addEventListener("click", () => this.startGame());
  }

  initializeGame() {
    this.score = 0;
    this.scoreEl.textContent = this.score;
    this.timeLeft = this.TIME_LEFT;
    this.timeEl.textContent = this.timeLeft;
  }

  startGame() {
    this.initializeGame();
    this.running = true;

    // Hide all popups when game starts
    document.getElementById("instructionsPopup").style.display = "none";

    if (this.timerInterval) clearInterval(this.timerInterval);
    this.timerInterval = setInterval(() => {
      this.timeLeft--;
      this.timeEl.textContent = this.timeLeft;
      if (this.timeLeft <= 0) {
        this.endGame();
      }
    }, 1000);
  }

  endGame() {
    this.running = false;
    clearInterval(this.timerInterval);
    this.finalScoreEl.textContent = this.score;
  }
}

// Initialize the Game when the page loads
document.addEventListener("DOMContentLoaded", () => {
  const game = new Game();
});
