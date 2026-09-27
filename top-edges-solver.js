// Permute the final four edges without disturbing solved corners or lower layers.
const TopEdgesSolver = (() => {
  const SolverCube = typeof module !== 'undefined' && module.exports ? require('./vendor/cubejs/cube') : Cube;
  const ring = ['F','R','B','L'];
  const base = ['F2','U','L',"R'",'F2',"L'",'R','U','F2'];
  const macros = [];
  for (let rotation=0;rotation<4;rotation++) {
    const macro = base.map(move => move.replace(/[FRBL]/g,face => ring[(ring.indexOf(face) + rotation) % 4]));
    macros.push(macro,macro.slice().reverse().map(SolverCube.inverse));
  }
  const encode = permutation => permutation.reduce((code,piece) => code * 4 + piece,0);
  const decode = code => {
    const result = [0,0,0,0];
    for (let i=3;i>=0;i--) { result[i]=code % 4; code=Math.floor(code / 4); }
    return result;
  };
  const goal = encode([0,1,2,3]);
  let table = null, transitions = null;
  function initialize() {
    if (table) return;
    transitions = macros.map(macro => {
      const effect = new SolverCube().move(macro.join(' '));
      return Uint8Array.from({length:256},(_,code) => {
        const permutation = decode(code);
        return encode([0,1,2,3].map(position => permutation[effect.ep[position]]));
      });
    });
    const lookup = new Map(macros.map((macro,index) => [macro.join(' '),index]));
    const inverse = macros.map(macro => {
      const index = lookup.get(macro.slice().reverse().map(SolverCube.inverse).join(' '));
      if (index === undefined) throw new Error('Missing inverse edge permutation macro');
      return index;
    });
    const next = new Uint8Array(256);
    next.fill(255);
    next[goal] = 254;
    const queue = [goal];
    for (let head=0;head<queue.length;head++) for (let macro=0;macro<macros.length;macro++) {
      const neighbor = transitions[macro][queue[head]];
      if (next[neighbor] !== 255) continue;
      next[neighbor] = inverse[macro];
      queue.push(neighbor);
    }
    table = next;
  }
  function solveGroups(faceletString) {
    initialize();
    const cube = SolverCube.fromString(faceletString);
    if (![4,5,6,7,8,9,10,11].every(position => cube.ep[position] === position && cube.eo[position] === 0) ||
        ![4,5,6,7].every(position => cube.cp[position] === position && cube.co[position] === 0) ||
        !cube.eo.slice(0,4).every(orientation => orientation === 0) ||
        !cube.co.slice(0,4).every(orientation => orientation === 0) ||
        !cube.cp.slice(0,4).every((piece,position) => piece === position))
      throw new Error('先完成黄色顶角归位，再练习顶层棱块');
    let state = encode(cube.ep.slice(0,4));
    if (table[state] === 255) throw new Error('Top edge permutation is unreachable');
    const groups = [];
    while (state !== goal) {
      const macro = table[state];
      groups.push(macros[macro].slice());
      state = transitions[macro][state];
    }
    return groups;
  }
  const solve = faceletString => solveGroups(faceletString).flat();
  return { solve, solveGroups };
})();
if (typeof module !== 'undefined' && module.exports) module.exports = TopEdgesSolver;
