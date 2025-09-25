const WIN_SCORE = 5;
const STORAGE_KEY = "ppt-best-streak";

const state = {
  playerScore: 0,
  cpuScore: 0,
  bestStreak: 0,
  currentStreak: 0,
  isGameOver: false,
};

const playerScoreEl = document.getElementById("player-score");
const cpuScoreEl = document.getElementById("cpu-score");
const bestStreakEl = document.getElementById("best-streak");
const roundResultEl = document.getElementById("round-result");
const roundDetailEl = document.getElementById("round-detail");
const choiceButtons = Array.from(document.querySelectorAll(".choice"));
const resetButton = document.getElementById("reset-button");
const resultSection = document.querySelector(".result");

function getCpuChoice() {
  const options = ["piedra", "papel", "tijera"];
  const index = Math.floor(Math.random() * options.length);
  return options[index];
}

function getRoundResult(playerChoice, cpuChoice) {
  if (playerChoice === cpuChoice) {
    return { winner: "draw", message: "Empate" };
  }

  const winsAgainst = {
    piedra: "tijera",
    papel: "piedra",
    tijera: "papel",
  };

  if (winsAgainst[playerChoice] === cpuChoice) {
    return { winner: "player", message: "¡Ganaste la ronda!" };
  }

  return { winner: "cpu", message: "Perdiste la ronda" };
}

function updateScoreBoard() {
  playerScoreEl.textContent = state.playerScore;
  cpuScoreEl.textContent = state.cpuScore;
  bestStreakEl.textContent = `Mejor racha: ${state.bestStreak}`;
}

function renderResult({ winner, message }, playerChoice, cpuChoice) {
  roundResultEl.textContent = message;
  const detailMessage = `Tú elegiste ${playerChoice} y la CPU eligió ${cpuChoice}.`;
  roundDetailEl.textContent = detailMessage;

  resultSection.classList.remove("result--win", "result--lose", "result--draw");
  if (winner === "player") {
    resultSection.classList.add("result--win");
  } else if (winner === "cpu") {
    resultSection.classList.add("result--lose");
  } else {
    resultSection.classList.add("result--draw");
  }
}

function saveBestStreak() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state.bestStreak));
}

function loadBestStreak() {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    state.bestStreak = 0;
    return;
  }

  try {
    const value = JSON.parse(stored);
    if (Number.isInteger(value) && value >= 0) {
      state.bestStreak = value;
    }
  } catch (error) {
    console.warn("No se pudo leer la mejor racha guardada", error);
    state.bestStreak = 0;
  }
}

function finishMatch(playerWon) {
  state.isGameOver = true;
  choiceButtons.forEach((button) => {
    button.disabled = true;
  });
  resetButton.hidden = false;

  if (playerWon) {
    state.currentStreak += 1;
    if (state.currentStreak > state.bestStreak) {
      state.bestStreak = state.currentStreak;
      saveBestStreak();
    }
  } else {
    state.currentStreak = 0;
  }

  updateScoreBoard();
}

function resetGame() {
  state.playerScore = 0;
  state.cpuScore = 0;
  state.isGameOver = false;
  choiceButtons.forEach((button) => {
    button.disabled = false;
  });
  resetButton.hidden = true;

  roundResultEl.textContent = "Haz tu elección";
  roundDetailEl.textContent = "";
  resultSection.classList.remove("result--win", "result--lose", "result--draw");
  updateScoreBoard();
}

function handlePlayerChoice(event) {
  if (state.isGameOver) {
    return;
  }

  const playerChoice = event.currentTarget.dataset.choice;
  const cpuChoice = getCpuChoice();
  const result = getRoundResult(playerChoice, cpuChoice);

  if (result.winner === "player") {
    state.playerScore += 1;
  } else if (result.winner === "cpu") {
    state.cpuScore += 1;
  }

  renderResult(result, playerChoice, cpuChoice);
  updateScoreBoard();

  if (state.playerScore === WIN_SCORE || state.cpuScore === WIN_SCORE) {
    const playerWon = state.playerScore === WIN_SCORE;
    const endMessage = playerWon
      ? "¡Ganaste la partida!"
      : "La CPU ganó la partida";
    roundResultEl.textContent = endMessage;
    finishMatch(playerWon);
  }
}

loadBestStreak();
updateScoreBoard();

choiceButtons.forEach((button) => {
  button.addEventListener("click", handlePlayerChoice);
});

resetButton.addEventListener("click", () => {
  resetGame();
});

document.addEventListener("keydown", (event) => {
  if ((event.key === "Enter" || event.key === " ") && state.isGameOver) {
    resetButton.focus();
  }
});

