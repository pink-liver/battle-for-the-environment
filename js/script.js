// Initialize the Game when the page loads
document.addEventListener("DOMContentLoaded", () => {
  initTheme();
  window.gameInstance = new Game();
  window.leaderboardInstance = new Leaderboard();
});
