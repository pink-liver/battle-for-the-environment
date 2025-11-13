class Leaderboard {
  constructor() {
    this.apiHost =
      "https://drlifesucks-backend-515395033792.asia-east1.run.app";
    this.loading = document.getElementById("leaderboardLoading");
    this.list = document.getElementById("leaderboardList");
    this.error = document.getElementById("leaderboardError");
    this.refreshBtn = document.getElementById("refreshLeaderboard");

    this.refreshBtn.addEventListener("click", () => this.loadLeaderboard());
    this.loadLeaderboard();
  }

  async loadLeaderboard() {
    this.showLoading();

    try {
      const response = await fetch(
        this.apiHost + "/api/game/environment/ranks"
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      this.displayLeaderboard(data);
    } catch (error) {
      console.error("Error loading leaderboard:", error);
      this.showError();
    }
  }

  displayLeaderboard(data) {
    this.hideAll();
    this.list.style.display = "block";

    // Clear existing content
    this.list.innerHTML = "";

    // Handle different possible data structures
    let ranks = [];
    if (Array.isArray(data)) {
      ranks = data;
    } else if (data.ranks && Array.isArray(data.ranks)) {
      ranks = data.ranks;
    } else if (data.data && Array.isArray(data.data)) {
      ranks = data.data;
    } else {
      console.warn("Unexpected data structure:", data);
      this.showError();
      return;
    }

    if (ranks.length === 0) {
      this.list.innerHTML =
        '<div class="loading">暫無排行榜資料！<br>快來成為第一位玩家吧！</div>';
      return;
    }

    // Sort by score (descending) and display top 10
    ranks.sort(
      (a, b) => (b.score || b.finalScore || 0) - (a.score || a.finalScore || 0)
    );
    const top10 = ranks.slice(0, 10);

    top10.forEach((player, index) => {
      const item = document.createElement("div");
      item.className = "leaderboard-item";

      const rank = document.createElement("div");
      rank.className = "leaderboard-rank";
      rank.textContent = `#${index + 1}`;

      const name = document.createElement("div");
      name.className = "leaderboard-name";
      name.textContent = player.playerName || player.name || `玩家${index + 1}`;

      const score = document.createElement("div");
      score.className = "leaderboard-score";
      score.textContent = player.score || player.finalScore || 0;

      item.appendChild(rank);
      item.appendChild(name);
      item.appendChild(score);

      this.list.appendChild(item);
    });
  }

  showLoading() {
    this.hideAll();
    this.loading.style.display = "block";
  }

  showError() {
    this.hideAll();
    this.error.style.display = "block";
  }

  hideAll() {
    this.loading.style.display = "none";
    this.list.style.display = "none";
    this.error.style.display = "none";
  }
}
