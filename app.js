const WIN_SCORE = 5;
const STORAGE_KEY = "ppt-best-streak";
const SOUND_STORAGE_KEY = "ppt-sound-muted";

const state = {
  playerScore: 0,
  cpuScore: 0,
  bestStreak: 0,
  currentStreak: 0,
  isGameOver: false,
  isMuted: false,
};

const playerScoreEl = document.getElementById("player-score");
const cpuScoreEl = document.getElementById("cpu-score");
const bestStreakEl = document.getElementById("best-streak");
const roundResultEl = document.getElementById("round-result");
const roundDetailEl = document.getElementById("round-detail");
const choiceButtons = Array.from(document.querySelectorAll(".choice"));
const resetButton = document.getElementById("reset-button");
const resultSection = document.querySelector(".result");
const muteButton = document.getElementById("mute-button");

let audioContext;

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

function triggerChoiceAnimation(button) {
  button.classList.remove("choice--selected");
  // Fuerza un reflujo para reiniciar la animación cuando se elige varias veces
  void button.offsetWidth;
  button.classList.add("choice--selected");
}

function triggerLoseAnimation() {
  resultSection.classList.remove("result--shake");
  void resultSection.offsetWidth;
  resultSection.classList.add("result--shake");
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

function ensureAudioContext() {
  if (state.isMuted) {
    return null;
  }

  if (!audioContext) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) {
      console.warn("El contexto de audio no es compatible en este navegador.");
      return null;
    }
    audioContext = new AudioContextClass();
  }

  if (audioContext.state === "suspended") {
    audioContext.resume();
  }

  return audioContext;
}

function playTone({ frequencyStart, frequencyEnd, duration, type }) {
  const context = ensureAudioContext();
  if (!context) {
    return;
  }

  const oscillator = context.createOscillator();
  const gainNode = context.createGain();
  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequencyStart, context.currentTime);
  if (frequencyEnd !== frequencyStart) {
    oscillator.frequency.linearRampToValueAtTime(
      frequencyEnd,
      context.currentTime + duration
    );
  }

  gainNode.gain.setValueAtTime(0.0001, context.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.35, context.currentTime + 0.02);
  gainNode.gain.exponentialRampToValueAtTime(
    0.0001,
    context.currentTime + duration + 0.1
  );

  oscillator.connect(gainNode);
  gainNode.connect(context.destination);

  oscillator.start(context.currentTime);
  oscillator.stop(context.currentTime + duration + 0.12);
}

function playResultSound(winner) {
  if (state.isMuted) {
    return;
  }

  if (winner === "player") {
    playTone({
      frequencyStart: 660,
      frequencyEnd: 990,
      duration: 0.35,
      type: "triangle",
    });
  } else if (winner === "cpu") {
    playTone({
      frequencyStart: 220,
      frequencyEnd: 130,
      duration: 0.4,
      type: "sawtooth",
    });
  }
}

function updateMuteButton() {
  if (!muteButton) {
    return;
  }

  const text = state.isMuted ? "🔇 Sonido desactivado" : "🔊 Sonido activado";
  const ariaLabel = state.isMuted ? "Sonido desactivado" : "Sonido activado";
  muteButton.textContent = text;
  muteButton.setAttribute("aria-label", ariaLabel);
  muteButton.setAttribute("aria-pressed", String(state.isMuted));
}

function saveSoundPreference() {
  localStorage.setItem(SOUND_STORAGE_KEY, JSON.stringify(state.isMuted));
}

function loadSoundPreference() {
  const stored = localStorage.getItem(SOUND_STORAGE_KEY);
  if (!stored) {
    state.isMuted = false;
    return;
  }

  try {
    const value = JSON.parse(stored);
    state.isMuted = Boolean(value);
  } catch (error) {
    console.warn("No se pudo leer la preferencia de sonido", error);
    state.isMuted = false;
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
  resultSection.classList.remove(
    "result--win",
    "result--lose",
    "result--draw",
    "result--shake"
  );
  updateScoreBoard();
}

function handlePlayerChoice(event) {
  if (state.isGameOver) {
    return;
  }

  const button = event.currentTarget;
  triggerChoiceAnimation(button);

  const playerChoice = button.dataset.choice;
  const cpuChoice = getCpuChoice();
  const result = getRoundResult(playerChoice, cpuChoice);

  if (result.winner === "player") {
    state.playerScore += 1;
  } else if (result.winner === "cpu") {
    state.cpuScore += 1;
  }

  renderResult(result, playerChoice, cpuChoice);
  updateScoreBoard();
  playResultSound(result.winner);

  if (result.winner === "cpu") {
    triggerLoseAnimation();
  }

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
loadSoundPreference();
updateScoreBoard();
updateMuteButton();

choiceButtons.forEach((button) => {
  button.addEventListener("click", handlePlayerChoice);
});

resetButton.addEventListener("click", () => {
  resetGame();
});

if (muteButton) {
  muteButton.addEventListener("click", () => {
    state.isMuted = !state.isMuted;
    if (!state.isMuted) {
      ensureAudioContext();
    }
    updateMuteButton();
    saveSoundPreference();
  });
}

document.addEventListener("keydown", (event) => {
  if ((event.key === "Enter" || event.key === " ") && state.isGameOver) {
    resetButton.focus();
  }
});

