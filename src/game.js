import { createInitialState, createRng, queueDirection, tick, GRID_SIZE } from "./game-logic.js";

const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
const scoreEl = document.getElementById("score");
const statusEl = document.getElementById("status");
const restartBtn = document.getElementById("restart");
const controls = document.querySelector(".controls");

const CELL_SIZE = 20;
const BOARD_PX = GRID_SIZE * CELL_SIZE;
canvas.width = BOARD_PX;
canvas.height = BOARD_PX;

const TICK_MS = 120;
let rng = createRng(42);
let state = createInitialState(rng, GRID_SIZE);
let accumulator = 0;
let lastTs = 0;
let paused = false;

function reset() {
  rng = createRng(42);
  state = createInitialState(rng, GRID_SIZE);
  accumulator = 0;
  paused = false;
  statusEl.textContent = "";
  updateHud();
  render();
}

function updateHud() {
  scoreEl.textContent = String(state.score);
  if (!state.alive) statusEl.textContent = "Game over. Press R or Restart.";
  else if (paused) statusEl.textContent = "Paused";
  else statusEl.textContent = "";
}

function drawGrid() {
  ctx.fillStyle = "#f4f0e8";
  ctx.fillRect(0, 0, BOARD_PX, BOARD_PX);
  ctx.strokeStyle = "#d8d0c5";
  ctx.lineWidth = 1;
  for (let i = 0; i <= GRID_SIZE; i += 1) {
    const p = i * CELL_SIZE;
    ctx.beginPath();
    ctx.moveTo(p, 0);
    ctx.lineTo(p, BOARD_PX);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, p);
    ctx.lineTo(BOARD_PX, p);
    ctx.stroke();
  }
}

function drawFood() {
  const { x, y } = state.food;
  ctx.fillStyle = "#d13535";
  ctx.fillRect(x * CELL_SIZE + 4, y * CELL_SIZE + 4, CELL_SIZE - 8, CELL_SIZE - 8);
}

function drawTrain() {
  state.snake.forEach((cell, idx) => {
    const px = cell.x * CELL_SIZE;
    const py = cell.y * CELL_SIZE;
    if (idx === 0) {
      ctx.fillStyle = "#2f4f4f";
      ctx.fillRect(px + 2, py + 2, CELL_SIZE - 4, CELL_SIZE - 4);
      ctx.fillStyle = "#f0f7ff";
      ctx.fillRect(px + 5, py + 6, 5, 4);
      ctx.fillRect(px + 11, py + 6, 5, 4);
      ctx.fillStyle = "#111";
      ctx.fillRect(px + 4, py + CELL_SIZE - 5, CELL_SIZE - 8, 2);
    } else {
      ctx.fillStyle = idx % 2 === 0 ? "#4b6b6b" : "#5f8080";
      ctx.fillRect(px + 2, py + 4, CELL_SIZE - 4, CELL_SIZE - 8);
      ctx.fillStyle = "#263636";
      ctx.fillRect(px + 4, py + CELL_SIZE - 4, 4, 2);
      ctx.fillRect(px + CELL_SIZE - 8, py + CELL_SIZE - 4, 4, 2);
    }
  });
}

function render() {
  drawGrid();
  drawFood();
  drawTrain();
}

function step() {
  state = tick(state, rng);
  updateHud();
  render();
}

function advanceTime(ms) {
  if (paused || !state.alive) return;
  accumulator += ms;
  while (accumulator >= TICK_MS) {
    step();
    accumulator -= TICK_MS;
  }
}

function gameLoop(ts) {
  if (!lastTs) lastTs = ts;
  const dt = ts - lastTs;
  lastTs = ts;
  advanceTime(dt);
  requestAnimationFrame(gameLoop);
}

function setDirectionFromKey(key) {
  const normalized = key.toLowerCase();
  if (normalized === "arrowup" || normalized === "w") state = queueDirection(state, "up");
  if (normalized === "arrowdown" || normalized === "s") state = queueDirection(state, "down");
  if (normalized === "arrowleft" || normalized === "a") state = queueDirection(state, "left");
  if (normalized === "arrowright" || normalized === "d") state = queueDirection(state, "right");
}

window.addEventListener("keydown", (event) => {
  if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", " "].includes(event.key)) {
    event.preventDefault();
  }

  if (event.key.toLowerCase() === "r") {
    reset();
    return;
  }

  if (event.key.toLowerCase() === "p") {
    paused = !paused;
    updateHud();
    return;
  }

  setDirectionFromKey(event.key);
});

if (controls) {
  controls.addEventListener("click", (event) => {
    const btn = event.target.closest("button[data-dir]");
    if (!btn) return;
    state = queueDirection(state, btn.dataset.dir);
  });
}

restartBtn.addEventListener("click", reset);

window.render_game_to_text = () => {
  const payload = {
    coordinateSystem: "origin at top-left; +x right; +y down",
    alive: state.alive,
    paused,
    score: state.score,
    direction: state.direction,
    nextDirection: state.nextDirection,
    snake: state.snake,
    food: state.food,
  };
  return JSON.stringify(payload);
};

window.advanceTime = (ms) => {
  advanceTime(ms);
};

updateHud();
render();
requestAnimationFrame(gameLoop);
