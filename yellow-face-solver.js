// Orient the four yellow top corners while preserving the yellow cross and lower layers.
const YellowFaceSolver = (() => {
  const SolverCube = typeof module !== 'undefined' && module.exports ? require('./vendor/cubejs/cube') : Cube;
  const ring = ['R','B','L','F'];
  const base = ['R','U',"R'",'U','R','U2',"R'"];
  const macros = [['U'],['U2'],["U'"]];
  for (let rotation=0;rotation<4;rotation++) {
    const macro = base.map(move => move.replace(/[RBLF]/g,face => ring[(ring.indexOf(face) + rotation) % 4]));
    macros.push(macro,macro.slice().reverse().map(SolverCube.inverse));
  }
  const encode = orientations => orientations.reduce((code,orientation) => code * 3 + orientation,0);
  const decode = code => {
    const result = [0,0,0,0];
    for (let i=3;i>=0;i--) { result[i]=code % 3; code=Math.floor(code / 3); }
    return result;
  };
  let table = null, transitions = null;
  function initialize() {
    if (table) return;
    transitions = macros.map(macro => {
      const effect = new SolverCube().move(macro.join(' '));
      return Uint8Array.from({length:81},(_,code) => {
        const orientations = decode(code);
        return encode([0,1,2,3].map(position =>
          (orientations[effect.cp[position]] + effect.co[position]) % 3));
      });
    });
    const lookup = new Map(macros.map((macro,index) => [macro.join(' '),index]));
    const inverse = macros.map(macro => {
      const index = lookup.get(macro.slice().reverse().map(SolverCube.inverse).join(' '));
      if (index === undefined) throw new Error('Missing inverse yellow-face macro');
      return index;
    });
    const next = new Uint8Array(81);
    next.fill(255);
    next[0] = 254;
    const queue = [0];
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
        !cube.eo.slice(0,4).every(orientation => orientation === 0))
      throw new Error('先完成黄色十字，再练习黄色整面');
    let state = encode(cube.co.slice(0,4));
    if (table[state] === 255) throw new Error('Yellow corner orientation is unreachable');
    const groups = [];
    while (state !== 0) {
      const macro = table[state];
      groups.push(macros[macro].slice());
      state = transitions[macro][state];
    }
    return groups;
  }
  const solve = faceletString => solveGroups(faceletString).flat();
  return { solve, solveGroups };
})();
if (typeof module !== 'undefined' && module.exports) module.exports = YellowFaceSolver;
