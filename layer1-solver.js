// First-layer corner search over macros that preserve a completed white cross.
const Layer1Solver = (() => {
  const SolverCube = typeof module !== 'undefined' && module.exports ? require('./vendor/cubejs/cube') : Cube;
  const faces = ['U','R','F','D','L','B'];
  const target = [4,5,6,7]; // DFR, DLF, DBL, DRB.
  const macros = [['U'],['U2'],["U'"]];
  for (const side of ['R',"R'",'F',"F'",'L',"L'",'B',"B'"])
    for (const top of ['U','U2',"U'"])
      macros.push([side,top,SolverCube.inverse(side)]);
  const SIZE = 24 ** 4;
  const encode = codes => ((codes[0] * 24 + codes[1]) * 24 + codes[2]) * 24 + codes[3];
  const decode = number => {
    const result = [0,0,0,0];
    for (let i=3;i>=0;i--) { result[i]=number % 24; number=Math.floor(number / 24); }
    return result;
  };
  const goal = encode(target.map(position => position * 3));
  let table = null;
  let transitions = null;

  function initialize() {
    if (table) return;
    const quarters = faces.map((face,faceIndex) => {
      const definition = SolverCube.moves[faceIndex];
      const trans = new Uint8Array(24);
      for (let newPos=0;newPos<8;newPos++) for (let orientation=0;orientation<3;orientation++)
        trans[definition.cp[newPos] * 3 + orientation] = newPos * 3 + (orientation + definition.co[newPos]) % 3;
      return trans;
    });
    const moveTransition = move => {
      const quarter = quarters[faces.indexOf(move[0])];
      const turns = move.endsWith('2') ? 2 : move.endsWith("'") ? 3 : 1;
      return Uint8Array.from({length:24},(_,code) => {
        for (let i=0;i<turns;i++) code=quarter[code];
        return code;
      });
    };
    transitions = macros.map(macro => {
      const steps = macro.map(moveTransition);
      return Uint8Array.from({length:24},(_,original) => steps.reduce((code,step) => step[code],original));
    });
    const lookup = new Map(macros.map((macro,index) => [macro.join(' '),index]));
    const inverse = macros.map(macro => {
      const reversed = macro.slice().reverse().map(SolverCube.inverse).join(' ');
      const index = lookup.get(reversed);
      if (index === undefined) throw new Error('Missing inverse teaching macro');
      return index;
    });
    const next = new Uint8Array(SIZE);
    next.fill(255);
    next[goal] = 254;
    const queue = new Uint32Array(SIZE);
    queue[0] = goal;
    let head=0,tail=1;
    while (head < tail) {
      const current = queue[head++];
      const codes = decode(current);
      for (let macro=0;macro<macros.length;macro++) {
        const trans = transitions[macro];
        const neighbor = encode(codes.map(code => trans[code]));
        if (next[neighbor] !== 255) continue;
        next[neighbor] = inverse[macro];
        queue[tail++] = neighbor;
      }
    }
    table = next;
  }
  function solveGroups(faceletString) {
    initialize();
    const cube = SolverCube.fromString(faceletString);
    if (![4,5,6,7].every(position => cube.ep[position] === position && cube.eo[position] === 0))
      throw new Error('先完成白十字，再练习第一层角块');
    let state = encode(target.map(corner => {
      const position = cube.cp.indexOf(corner);
      if (position < 0) throw new Error('Missing white corner');
      return position * 3 + cube.co[position];
    }));
    if (table[state] === 255) throw new Error('First-layer corner state is unreachable');
    const result = [];
    while (state !== goal) {
      const macroIndex = table[state];
      result.push(macros[macroIndex].slice());
      const trans = transitions[macroIndex];
      state = encode(decode(state).map(code => trans[code]));
    }
    return result;
  }
  const solve = faceletString => solveGroups(faceletString).flat();
  return { solve, solveGroups };
})();
if (typeof module !== 'undefined' && module.exports) module.exports = Layer1Solver;
