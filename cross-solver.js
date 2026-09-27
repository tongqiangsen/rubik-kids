// Exact shortest white-cross solver. Tracks the four bottom edges only.
const CrossSolver = (() => {
  const SolverCube = typeof module !== 'undefined' && module.exports ? require('./vendor/cubejs/cube') : Cube;
  const moves = ['U','U2',"U'",'R','R2',"R'",'F','F2',"F'",'D','D2',"D'",'L','L2',"L'",'B','B2',"B'"];
  const inverse = index => index % 3 === 0 ? index + 2 : index % 3 === 2 ? index - 2 : index;
  const SIZE = 24 ** 4;
  const target = [4,5,6,7]; // DR, DF, DL, DB in cubejs's edge order.
  const encode = codes => ((codes[0] * 24 + codes[1]) * 24 + codes[2]) * 24 + codes[3];
  const decode = code => {
    const result = [0,0,0,0];
    for (let i=3;i>=0;i--) { result[i] = code % 24; code = Math.floor(code / 24); }
    return result;
  };
  const goal = encode(target.map(pos => pos * 2));
  let nextMove = null;
  let transitions = null;

  function buildTransitions() {
    transitions = [];
    for (let face=0;face<6;face++) {
      const quarter = new Uint8Array(24);
      const definition = SolverCube.moves[face];
      for (let newPos=0;newPos<12;newPos++) for (let flip=0;flip<2;flip++) {
        const oldPos = definition.ep[newPos];
        quarter[oldPos * 2 + flip] = newPos * 2 + ((flip + definition.eo[newPos]) % 2);
      }
      const half = quarter.map(code => quarter[code]);
      const reverse = half.map(code => quarter[code]);
      transitions.push(quarter, half, reverse);
    }
  }
  function moved(code, move) {
    const trans = transitions[move];
    const a = decode(code);
    return encode([trans[a[0]],trans[a[1]],trans[a[2]],trans[a[3]]]);
  }
  function initialize() {
    if (nextMove) return;
    buildTransitions();
    const table = new Uint8Array(SIZE);
    table.fill(255);
    table[goal] = 254;
    const queue = new Uint32Array(SIZE);
    queue[0] = goal;
    let head = 0, tail = 1;
    while (head < tail) {
      const current = queue[head++];
      for (let move=0;move<18;move++) {
        const neighbor = moved(current,move);
        if (table[neighbor] !== 255) continue;
        table[neighbor] = inverse(move);
        queue[tail++] = neighbor;
      }
    }
    nextMove = table;
  }
  function stateCode(cube) {
    return encode(target.map(edge => {
      const position = cube.ep.indexOf(edge);
      if (position < 0) throw new Error('Missing white edge');
      return position * 2 + cube.eo[position];
    }));
  }
  function solve(faceletString) {
    initialize();
    const cube = SolverCube.fromString(faceletString);
    let state = stateCode(cube);
    if (nextMove[state] === 255) throw new Error('White cross state is unreachable');
    const result = [];
    while (state !== goal) {
      const move = nextMove[state];
      result.push(moves[move]);
      state = moved(state,move);
    }
    return result;
  }
  return { solve };
})();
if (typeof module !== 'undefined' && module.exports) module.exports = CrossSolver;
