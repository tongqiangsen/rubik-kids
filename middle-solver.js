// Middle-layer edge search over insertion and extraction macros preserving layer one.
const MiddleSolver = (() => {
  const SolverCube = typeof module !== 'undefined' && module.exports ? require('./vendor/cubejs/cube') : Cube;
  const faces = ['U','R','F','D','L','B'];
  const target = [8,9,10,11]; // FR, FL, BL, BR.
  const ring = ['F','R','B','L'];
  const patterns = [
    ['U','R',"U'","R'","U'","F'",'U','F'],
    ["U'","L'",'U','L','U','F',"U'","F'"]
  ];
  const macros = [['U'],['U2'],["U'"]];
  for (let rotation=0;rotation<4;rotation++) for (const pattern of patterns) {
    const macro = pattern.map(move => move.replace(/[FRBL]/g,face => ring[(ring.indexOf(face) + rotation) % 4]));
    macros.push(macro, macro.slice().reverse().map(SolverCube.inverse));
  }
  const SIZE = 24 ** 4;
  const encode = codes => ((codes[0] * 24 + codes[1]) * 24 + codes[2]) * 24 + codes[3];
  const decode = number => {
    const result = [0,0,0,0];
    for (let i=3;i>=0;i--) { result[i]=number % 24; number=Math.floor(number / 24); }
    return result;
  };
  const goal = encode(target.map(position => position * 2));
  let table = null, transitions = null;

  function initialize() {
    if (table) return;
    const quarters = faces.map((face,faceIndex) => {
      const definition = SolverCube.moves[faceIndex];
      const trans = new Uint8Array(24);
      for (let newPos=0;newPos<12;newPos++) for (let flip=0;flip<2;flip++)
        trans[definition.ep[newPos] * 2 + flip] = newPos * 2 + (flip + definition.eo[newPos]) % 2;
      return trans;
    });
    const moveTransition = move => {
      const quarter = quarters[faces.indexOf(move[0])];
      const turns = move.endsWith('2') ? 2 : move.endsWith("'") ? 3 : 1;
      return Uint8Array.from({length:24},(_,original) => {
        let code = original;
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
      const key = macro.slice().reverse().map(SolverCube.inverse).join(' ');
      const index = lookup.get(key);
      if (index === undefined) throw new Error('Missing inverse middle macro');
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
    if (![4,5,6,7].every(position => cube.ep[position] === position && cube.eo[position] === 0 && cube.cp[position] === position && cube.co[position] === 0))
      throw new Error('先完成白色第一层，再练习中层棱块');
    let state = encode(target.map(edge => {
      const position = cube.ep.indexOf(edge);
      if (position < 0) throw new Error('Missing middle edge');
      return position * 2 + cube.eo[position];
    }));
    if (table[state] === 255) throw new Error('Middle edge state is unreachable');
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
if (typeof module !== 'undefined' && module.exports) module.exports = MiddleSolver;
