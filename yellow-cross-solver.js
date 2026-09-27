// Orient the four yellow top edges while preserving the completed first two layers.
const YellowCrossSolver = (() => {
  const SolverCube = typeof module !== 'undefined' && module.exports ? require('./vendor/cubejs/cube') : Cube;
  const ring = ['F','R','B','L'];
  const base = ['F','R','U',"R'","U'","F'"];
  const macros = [['U'],['U2'],["U'"]];
  for (let rotation=0;rotation<4;rotation++) {
    const macro = base.map(move => move.replace(/[FRBL]/g,face => ring[(ring.indexOf(face) + rotation) % 4]));
    macros.push(macro,macro.slice().reverse().map(SolverCube.inverse));
  }
  let table = null, transitions = null;
  const maskOf = cube => cube.eo.slice(0,4).reduce((mask,orientation,index) => mask | (orientation << index),0);
  function initialize() {
    if (table) return;
    transitions = macros.map(macro => {
      const effect = new SolverCube().move(macro.join(' '));
      return Uint8Array.from({length:16},(_,mask) => {
        let next = 0;
        for (let position=0;position<4;position++) {
          const old = effect.ep[position];
          next |= (((mask >> old) & 1) ^ effect.eo[position]) << position;
        }
        return next;
      });
    });
    const lookup = new Map(macros.map((macro,index) => [macro.join(' '),index]));
    const inverse = macros.map(macro => {
      const index = lookup.get(macro.slice().reverse().map(SolverCube.inverse).join(' '));
      if (index === undefined) throw new Error('Missing inverse yellow-cross macro');
      return index;
    });
    const next = new Uint8Array(16);
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
        ![4,5,6,7].every(position => cube.cp[position] === position && cube.co[position] === 0))
      throw new Error('先完成前两层，再练习黄色十字');
    let mask = maskOf(cube);
    if (table[mask] === 255) throw new Error('Yellow cross orientation is unreachable');
    const groups = [];
    while (mask !== 0) {
      const macro = table[mask];
      groups.push(macros[macro].slice());
      mask = transitions[macro][mask];
    }
    return groups;
  }
  const solve = faceletString => solveGroups(faceletString).flat();
  return { solve, solveGroups };
})();
if (typeof module !== 'undefined' && module.exports) module.exports = YellowCrossSolver;
