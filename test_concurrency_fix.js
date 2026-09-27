// Test concurrency lock on Rubik cube moves
const assert = require('assert');

class TestCube {
  constructor() {
    this.isBusy = false;
    this.queue = [];
    this._animTimer = null;
    this.history = [];
    this.init();
  }

  init() {
    if (this._animTimer) {
      clearTimeout(this._animTimer);
      this._animTimer = null;
    }
    this.queue = [];
    this.isBusy = false;
  }

  performMove(code, onEnd = null) {
    if (this.isBusy) {
      return false; // Concurrency lock!
    }
    if (code.endsWith('2')) {
      const b = code[0];
      this.enqueueMoves([b, b], onEnd);
    } else {
      this.enqueueMoves([code], onEnd);
    }
    return true;
  }

  enqueueMoves(moveList, onFinish = null) {
    const expanded = [];
    moveList.forEach(m => {
      if (m.endsWith('2')) {
        const b = m[0];
        expanded.push(b, b);
      } else {
        expanded.push(m);
      }
    });
    this.queue.push({ moves: expanded, onFinish });
    this.processQueue();
  }

  processQueue() {
    if (this.isBusy || this.queue.length === 0) return;
    this.isBusy = true;
    const item = this.queue[0];
    let idx = 0;

    const next = () => {
      if (idx < item.moves.length) {
        this._rawPerformMove(item.moves[idx++], next);
      } else {
        this.queue.shift();
        this.isBusy = false;
        if (item.onFinish) item.onFinish();
        if (this.queue.length > 0) this.processQueue();
      }
    };
    next();
  }

  _rawPerformMove(code, onEnd) {
    this.history.push(code);
    this._animTimer = setTimeout(() => {
      this._animTimer = null;
      if (onEnd) onEnd();
    }, 20); // 20ms simulation
  }
}

async function runTest() {
  const cube = new TestCube();
  
  // Test 1: Rapid single clicks should be rejected while isBusy is true
  console.log("Test 1: Rapid clicks rejection");
  const firstAccepted = cube.performMove("U", () => {});
  const secondAccepted = cube.performMove("R", () => {});
  const thirdAccepted = cube.performMove("F", () => {});

  assert.strictEqual(firstAccepted, true, "First move must be accepted");
  assert.strictEqual(secondAccepted, false, "Second move while busy must be rejected");
  assert.strictEqual(thirdAccepted, false, "Third move while busy must be rejected");
  assert.strictEqual(cube.isBusy, true, "isBusy must be true during move");

  // Wait for first move to finish
  await new Promise(r => setTimeout(r, 40));
  assert.strictEqual(cube.isBusy, false, "isBusy must be false after completion");
  assert.deepStrictEqual(cube.history, ["U"], "Only first move should have executed");

  // Test 2: Double move execution
  console.log("Test 2: Double move (U2) sequencing");
  cube.history = [];
  let doubleDone = false;
  cube.performMove("U2", () => {
    doubleDone = true;
  });
  assert.strictEqual(cube.isBusy, true, "isBusy must be true during double move");
  
  // Try to interrupt
  const rejected = cube.performMove("R", () => {});
  assert.strictEqual(rejected, false, "Move during U2 must be rejected");

  // Wait for both parts of U2 to finish (2 * 20ms = 40ms)
  await new Promise(r => setTimeout(r, 60));
  assert.strictEqual(doubleDone, true, "Double move onFinish must fire");
  assert.strictEqual(cube.isBusy, false, "isBusy must be false after double move");
  assert.deepStrictEqual(cube.history, ["U", "U"], "U2 must expand to two serial U moves");

  // Test 3: Reset clears everything safely
  console.log("Test 3: Reset (init) during move");
  cube.performMove("R", () => {});
  assert.strictEqual(cube.isBusy, true);
  cube.init();
  assert.strictEqual(cube.isBusy, false, "init must reset isBusy");
  assert.strictEqual(cube._animTimer, null, "init must clear animation timer");

  console.log("ALL CONCURRENCY TESTS PASSED SUCCESSFULLY!");
}

runTest().catch(err => {
  console.error(err);
  process.exit(1);
});
