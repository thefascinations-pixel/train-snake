export const GRID_SIZE = 20;

const DIRECTIONS = {
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 },
};

function hashCell(cell) {
  return `${cell.x},${cell.y}`;
}

export function createRng(seed = 123456789) {
  let state = seed >>> 0;
  return () => {
    state = (1664525 * state + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

export function randomFreeCell(occupied, rng, gridSize = GRID_SIZE) {
  const blocked = new Set(occupied.map(hashCell));
  const free = [];
  for (let y = 0; y < gridSize; y += 1) {
    for (let x = 0; x < gridSize; x += 1) {
      const key = `${x},${y}`;
      if (!blocked.has(key)) free.push({ x, y });
    }
  }
  if (free.length === 0) return null;
  const index = Math.floor(rng() * free.length);
  return free[index];
}

export function createInitialState(rng = createRng(), gridSize = GRID_SIZE) {
  const mid = Math.floor(gridSize / 2);
  const snake = [
    { x: mid, y: mid },
    { x: mid - 1, y: mid },
    { x: mid - 2, y: mid },
  ];
  return {
    gridSize,
    snake,
    direction: "right",
    nextDirection: "right",
    food: randomFreeCell(snake, rng, gridSize),
    score: 0,
    alive: true,
  };
}

export function queueDirection(state, newDirection) {
  if (!DIRECTIONS[newDirection]) return state;
  const current = DIRECTIONS[state.direction];
  const next = DIRECTIONS[newDirection];
  if (current.x + next.x === 0 && current.y + next.y === 0) return state;
  return {
    ...state,
    nextDirection: newDirection,
  };
}

function collidesWithSnake(head, snake) {
  return snake.some((cell) => cell.x === head.x && cell.y === head.y);
}

export function tick(state, rng = createRng()) {
  if (!state.alive) return state;

  const direction = state.nextDirection;
  const vec = DIRECTIONS[direction];
  const head = state.snake[0];
  const nextHead = { x: head.x + vec.x, y: head.y + vec.y };

  if (
    nextHead.x < 0 ||
    nextHead.y < 0 ||
    nextHead.x >= state.gridSize ||
    nextHead.y >= state.gridSize
  ) {
    return { ...state, alive: false, direction };
  }

  const bodyWithoutTail = state.snake.slice(0, -1);
  if (collidesWithSnake(nextHead, bodyWithoutTail)) {
    return { ...state, alive: false, direction };
  }

  const ateFood = nextHead.x === state.food.x && nextHead.y === state.food.y;
  const snake = [nextHead, ...state.snake];
  if (!ateFood) snake.pop();

  return {
    ...state,
    snake,
    direction,
    nextDirection: direction,
    score: state.score + (ateFood ? 1 : 0),
    food: ateFood ? randomFreeCell(snake, rng, state.gridSize) : state.food,
    alive: true,
  };
}
