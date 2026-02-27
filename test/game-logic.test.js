import test from "node:test";
import assert from "node:assert/strict";
import { createInitialState, createRng, queueDirection, tick, randomFreeCell } from "../src/game-logic.js";

test("moves one cell per tick", () => {
  const rng = createRng(1);
  const state = createInitialState(rng, 10);
  const next = tick(state, rng);
  assert.equal(next.snake[0].x, state.snake[0].x + 1);
  assert.equal(next.snake[0].y, state.snake[0].y);
});

test("grows and increments score when eating food", () => {
  const rng = createRng(1);
  const state = {
    ...createInitialState(rng, 10),
    snake: [{ x: 2, y: 2 }, { x: 1, y: 2 }, { x: 0, y: 2 }],
    direction: "right",
    nextDirection: "right",
    food: { x: 3, y: 2 },
    score: 0,
    alive: true,
  };
  const next = tick(state, rng);
  assert.equal(next.score, 1);
  assert.equal(next.snake.length, 4);
  assert.notDeepEqual(next.food, state.food);
});

test("dies when colliding with wall", () => {
  const rng = createRng(1);
  const state = {
    ...createInitialState(rng, 5),
    snake: [{ x: 4, y: 1 }, { x: 3, y: 1 }, { x: 2, y: 1 }],
    direction: "right",
    nextDirection: "right",
  };
  const next = tick(state, rng);
  assert.equal(next.alive, false);
});

test("dies when colliding with itself", () => {
  const rng = createRng(1);
  const state = {
    ...createInitialState(rng, 8),
    snake: [
      { x: 4, y: 4 },
      { x: 4, y: 5 },
      { x: 3, y: 5 },
      { x: 3, y: 4 },
      { x: 3, y: 3 },
      { x: 4, y: 3 },
    ],
    direction: "up",
    nextDirection: "left",
  };
  const next = tick(state, rng);
  assert.equal(next.alive, false);
});

test("prevents instant reversal", () => {
  const rng = createRng(1);
  const state = createInitialState(rng, 10);
  const queued = queueDirection(state, "left");
  assert.equal(queued.nextDirection, "right");
});

test("food never spawns on occupied cells", () => {
  const occupied = [
    { x: 0, y: 0 },
    { x: 1, y: 0 },
    { x: 2, y: 0 },
    { x: 0, y: 1 },
  ];
  const rng = () => 0;
  const cell = randomFreeCell(occupied, rng, 3);
  assert.notEqual(cell.x, 0);
  assert.notEqual(cell.y, 0);
});
