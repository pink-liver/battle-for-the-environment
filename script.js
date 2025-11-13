// Clinic Maze game
// Grid / maze generation using recursive backtracker

class Game {
  constructor() {
    // Settings
    this.FLOOR_COLOR = getComputedStyle(document.documentElement)
      .getPropertyValue("--dark-floor")
      .trim();
    this.WALL_COLOR = getComputedStyle(document.documentElement)
      .getPropertyValue("--dark-wall")
      .trim();
    this.TIME_LEFT = 30;
    this.TARGET_CELL_SIZE = 30; // Target size for each cell in pixels

    // Character images
    this.characterImages = {
      dog: new Image(),
      cat: new Image(),
      seal: new Image(),
      ghost: new Image(),
    };

    // Load character images
    Object.keys(this.characterImages).forEach((char) => {
      this.characterImages[char].src = `public/player-${char}.png`;
    });

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
    // Character selection
    this.selectedCharacter = null;
    this.characterBtns = document.querySelectorAll(".character-btn");
    this.characterBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        this.characterBtns.forEach((b) => b.classList.remove("selected"));
        btn.classList.add("selected");
        this.selectedCharacter = btn.dataset.char;
        this.startBtn.disabled = false;
      });
    });
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
    window.addEventListener("keydown", (e) => {
      const k = e.key;
      if (!this.running) return;
      if (k === "ArrowUp" || k === "w" || k === "W") {
        this.tryMove("N");
        e.preventDefault();
      }
      if (k === "ArrowDown" || k === "s" || k === "S") {
        this.tryMove("S");
        e.preventDefault();
      }
      if (k === "ArrowLeft" || k === "a" || k === "A") {
        this.tryMove("W");
        e.preventDefault();
      }
      if (k === "ArrowRight" || k === "d" || k === "D") {
        this.tryMove("E");
        e.preventDefault();
      }
    });

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
    this.ctx.fillStyle = this.FLOOR_COLOR;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.strokeStyle = this.WALL_COLOR;
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
    this.ctx.font = `${this.CELL_SIZE * 0.5}px Arial`;
    this.ctx.textAlign = "center";
    this.ctx.textBaseline = "middle";

    for (const p of this.pills) {
      const { x, y } = this.cellToPixel(p.r, p.c);
      const cx = x + this.CELL_SIZE / 2;
      const cy = y + this.CELL_SIZE / 2;
      this.ctx.fillText("💊", cx, cy);
    }
  }

  drawPlayer() {
    const { x, y } = this.cellToPixel(this.player.r, this.player.c);
    const pad = this.CELL_SIZE * 0.1;
    const size = this.CELL_SIZE - pad * 2;

    if (
      this.selectedCharacter &&
      this.characterImages[this.selectedCharacter]
    ) {
      const image = this.characterImages[this.selectedCharacter];
      if (image.complete) {
        this.ctx.drawImage(image, x + pad, y + pad, size, size);
      }
    }
  }

  cellToPixel(r, c) {
    return { x: c * this.CELL_SIZE, y: r * this.CELL_SIZE };
  }

  tryMove(dir) {
    if (!this.running) return;
    const cur = this.maze[this.player.r][this.player.c];
    let nr = this.player.r,
      nc = this.player.c;
    if (dir === "N") {
      if (!cur.walls.N) nr--;
    }
    if (dir === "S") {
      if (!cur.walls.S) nr++;
    }
    if (dir === "W") {
      if (!cur.walls.W) nc--;
    }
    if (dir === "E") {
      if (!cur.walls.E) nc++;
    }
    if (nr === this.player.r && nc === this.player.c) return; // blocked
    if (this.canMoveTo(nr, nc)) {
      this.player.r = nr;
      this.player.c = nc;
      this.checkPill();
      this.render();
    }
  }

  canMoveTo(r, c) {
    if (r < 0 || c < 0 || r >= this.maze.length || c >= this.maze[0].length)
      return false;
    return true;
  }

  checkPill() {
    for (let i = 0; i < this.pills.length; i++) {
      const p = this.pills[i];
      if (p.r === this.player.r && p.c === this.player.c) {
        this.pills.splice(i, 1);
        this.score += 10;
        this.scoreEl.textContent = this.score;
        break;
      }
    }
  }

  startGame() {
    if (!this.selectedCharacter) {
      return;
    }
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

// Theme handling
function initTheme() {
  const themeToggle = document.getElementById("themeToggle");

  // Function to toggle theme
  function toggleTheme() {
    const body = document.body;
    const isLightTheme = body.classList.contains("light-theme");

    body.classList.toggle("light-theme");
    themeToggle.innerHTML = isLightTheme ? "🌙" : "☀️";

    // If we have an active game instance, update its colors and re-render
    if (isLightTheme) {
      window.gameInstance.FLOOR_COLOR = getComputedStyle(
        document.documentElement
      )
        .getPropertyValue("--dark-floor")
        .trim();
      window.gameInstance.WALL_COLOR = getComputedStyle(
        document.documentElement
      )
        .getPropertyValue("--dark-wall")
        .trim();
      window.gameInstance.render();
    } else {
      window.gameInstance.FLOOR_COLOR = getComputedStyle(
        document.documentElement
      )
        .getPropertyValue("--light-floor")
        .trim();
      window.gameInstance.WALL_COLOR = getComputedStyle(
        document.documentElement
      )
        .getPropertyValue("--light-wall")
        .trim();
      window.gameInstance.render();
    }
  }

  // Add click event listener to theme toggle button
  themeToggle.addEventListener("click", toggleTheme);
}

// Initialize the Game when the page loads
document.addEventListener("DOMContentLoaded", () => {
  initTheme();
  window.gameInstance = new Game();
  window.leaderboardInstance = new Leaderboard();
});
