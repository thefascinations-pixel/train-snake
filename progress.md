Original prompt: Build a classic Snake game in this repo.

- Initialized project as a minimal dependency-free web app because repo was empty.
- Plan: implement deterministic core logic, then canvas rendering/controls, then tests.
- Added deterministic core logic module in src/game-logic.js (seeded RNG, movement, collision, growth, food spawn).
- Implemented UI in index.html/styles.css/src/game.js with train visuals, keyboard + touch controls, pause/restart, and deterministic hooks.
- Added Node test scaffolding and initial core logic tests.
- Ran npm test: 6/6 tests passed.
- Attempted skill Playwright client run; blocked because 'playwright' package is not installed in this environment.
