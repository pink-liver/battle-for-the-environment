// Clinic Maze game
// Grid / maze generation using recursive backtracker

class Game {
  constructor() {
    // Settings
    this.PLAYER_COLOR = "#2c3e50";
    this.PILL_COLOR = "#d9534f";
    this.TIME_LEFT = 5;
    this.TARGET_CELL_SIZE = 30; // Target size for each cell in pixels

    // Game state
    this.maze = null;
    this.player = null;
    this.pills = null;
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
    this.ctx = this.canvas.getContext("2d");
    this.startBtn = document.getElementById("startBtn");
    this.restartBtn = document.getElementById("restartBtn");

    this.instructionsPopup = document.getElementById("instructionsPopup");
    this.gameOverPopup = document.getElementById("gameOverPopup");

    this.scoreEl = document.getElementById("score");
    this.timeEl = document.getElementById("time");
    this.finalScoreEl = document.getElementById("finalScore");

    // Calculate grid dimensions based on canvas size
    this.TILE_COUNT_X = Math.floor(this.canvas.width / this.TARGET_CELL_SIZE);
    this.TILE_COUNT_Y = Math.floor(this.canvas.height / this.TARGET_CELL_SIZE);

    // Adjust cell size to fit canvas perfectly
    this.CELL_SIZE = Math.min(
      Math.floor(this.canvas.width / this.TILE_COUNT_X),
      Math.floor(this.canvas.height / this.TILE_COUNT_Y)
    );
  }

  bindEvents() {
    this.startBtn.addEventListener("click", () => this.startGame());
    this.restartBtn.addEventListener("click", () => this.startGame());
  }

  initializeGame() {
    this.maze = this.generateMaze(this.TILE_COUNT_Y, this.TILE_COUNT_X);
    this.player = { r: 0, c: 0 };
    this.pills = this.placePills(
      this.maze,
      Math.max(6, Math.floor(this.TILE_COUNT_X + this.TILE_COUNT_Y))
    );
    this.score = 0;
    this.scoreEl.textContent = this.score;
    this.timeLeft = this.TIME_LEFT;
    this.timeEl.textContent = this.timeLeft;
    this.render();
  }

  generateMaze(rows, cols) {
    const grid = this.buildGrid(rows, cols);
    const stack = [];
    const start = grid[0][0];
    start.visited = true;
    stack.push(start);

    while (stack.length) {
      const current = stack[stack.length - 1];
      const neighbors = [];
      const { r, c } = current;
      const pushIf = (rr, cc, dir, opp) => {
        if (
          rr >= 0 &&
          rr < rows &&
          cc >= 0 &&
          cc < cols &&
          !grid[rr][cc].visited
        )
          neighbors.push({ cell: grid[rr][cc], dir, opp });
      };
      pushIf(r - 1, c, "N", "S");
      pushIf(r + 1, c, "S", "N");
      pushIf(r, c + 1, "E", "W");
      pushIf(r, c - 1, "W", "E");
      if (neighbors.length) {
        const pick = neighbors[Math.floor(Math.random() * neighbors.length)];
        current.walls[pick.dir] = false;
        pick.cell.walls[pick.opp] = false;
        pick.cell.visited = true;
        stack.push(pick.cell);
      } else {
        stack.pop();
      }
    }
    return grid;
  }

  buildGrid(rows, cols) {
    const g = [];
    for (let r = 0; r < rows; r++) {
      const row = [];
      for (let c = 0; c < cols; c++) row.push(new Cell(r, c));
      g.push(row);
    }
    return g;
  }

  placePills(grid, count) {
    console.log(`Placing ${count} pills`);
    const spots = [];
    for (let r = 0; r < grid.length; r++) {
      for (let c = 0; c < grid[0].length; c++) {
        spots.push({ r, c });
      }
    }
    // exclude start cell (0,0)
    const filtered = spots.filter((s) => !(s.r === 0 && s.c === 0));
    const chosen = [];
    while (chosen.length < count && filtered.length) {
      const i = Math.floor(Math.random() * filtered.length);
      chosen.push(filtered.splice(i, 1)[0]);
    }
    return chosen;
  }

  render() {
    this.drawMaze(this.maze);
    this.drawPills();
    this.drawPlayer();
  }

  drawMaze(grid) {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.fillStyle = "#fff";
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.strokeStyle = "#2c3e50";
    this.ctx.lineWidth = 3;

    for (let r = 0; r < grid.length; r++) {
      for (let c = 0; c < grid[0].length; c++) {
        const cell = grid[r][c];
        const { x, y } = this.cellToPixel(r, c);
        // walls
        this.ctx.beginPath();
        if (cell.walls.N) {
          this.ctx.moveTo(x, y);
          this.ctx.lineTo(x + this.CELL_SIZE, y);
        }
        if (cell.walls.S) {
          this.ctx.moveTo(x, y + this.CELL_SIZE);
          this.ctx.lineTo(x + this.CELL_SIZE, y + this.CELL_SIZE);
        }
        if (cell.walls.W) {
          this.ctx.moveTo(x, y);
          this.ctx.lineTo(x, y + this.CELL_SIZE);
        }
        if (cell.walls.E) {
          this.ctx.moveTo(x + this.CELL_SIZE, y);
          this.ctx.lineTo(x + this.CELL_SIZE, y + this.CELL_SIZE);
        }
        this.ctx.stroke();
      }
    }
  }

  drawPills() {
    this.ctx.fillStyle = this.PILL_COLOR;
    for (const p of this.pills) {
      const { x, y } = this.cellToPixel(p.r, p.c);
      const cx = x + this.CELL_SIZE / 2;
      const cy = y + this.CELL_SIZE / 2;
      const r = this.CELL_SIZE * 0.22;
      // pill circle
      this.ctx.beginPath();
      this.ctx.arc(cx, cy, r, 0, Math.PI * 2);
      this.ctx.fill();
      // white plus to look like medicine cross
      this.ctx.fillStyle = "#fff";
      this.ctx.fillRect(cx - r * 0.25, cy - r * 0.6, r * 0.5, r * 1.2);
      this.ctx.fillRect(cx - r * 0.6, cy - r * 0.25, r * 1.2, r * 0.5);
      this.ctx.fillStyle = this.PILL_COLOR;
    }
  }

  drawPlayer() {
    const { x, y } = this.cellToPixel(this.player.r, this.player.c);
    const pad = this.CELL_SIZE * 0.18;
    const size = this.CELL_SIZE - pad * 2;
    this.ctx.fillStyle = this.PLAYER_COLOR;
    this.ctx.fillRect(x + pad, y + pad, size, size);
    // small white cross to indicate clinic worker
    this.ctx.fillStyle = "#fff";
    const cx = x + this.CELL_SIZE / 2;
    const cy = y + this.CELL_SIZE / 2;
    const l = this.CELL_SIZE * 0.12;
    this.ctx.fillRect(cx - l / 2, cy - l * 1.5, l, l * 3);
    this.ctx.fillRect(cx - l * 1.5, cy - l / 2, l * 3, l);
  }

  cellToPixel(r, c) {
    return { x: c * this.CELL_SIZE, y: r * this.CELL_SIZE };
  }

  startGame() {
    this.initializeGame();
    this.running = true;

    // Hide all popups when game starts
    this.instructionsPopup.style.display = "none";
    this.gameOverPopup.style.display = "none";

    this.render();

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
    this.gameOverPopup.style.display = "flex";
  }
}

// Define Cell class outside Game
class Cell {
  constructor(r, c) {
    this.r = r;
    this.c = c;
    this.walls = { N: true, S: true, E: true, W: true };
    this.visited = false;
  }
}

// Initialize the Game when the page loads
document.addEventListener("DOMContentLoaded", () => {
  const game = new Game();
});
