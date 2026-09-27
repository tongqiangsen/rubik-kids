// Meet-in-the-middle search for short solutions; null means outside the supported range.
const NearSolver = (() => {
  const math = typeof module !== 'undefined' && module.exports ? require('./cube-state') : CubeState;
  const moves = ['U','D','F','B','L','R'].flatMap(face => [face, `${face}'`, `${face}2`]);
  const opposite = { U:'D', D:'U', F:'B', B:'F', L:'R', R:'L' };
  const clone = cubies => cubies.filter(c => c.stickers.length > 1)
    .map(c => ({ pos:c.pos.slice(), mat:c.mat.map(row => row.slice()), stickers:c.stickers }))
    .sort((a,b) => a.stickers.map(s => s.color).sort().join('').localeCompare(b.stickers.map(s => s.color).sort().join('')));
  const normCode = n => (n[0]+1)*9 + (n[1]+1)*3 + n[2]+1;
  function key(cubies) {
    return cubies.map(c => String.fromCharCode(
      65 + normCode(c.pos),
      ...c.stickers.map(s => 65 + normCode(math.vecMul(c.mat, s.initNorm)))
    )).join('');
  }
  function solvedFrom(cubies) {
    return cubies.map(c => {
      const pos = [0,0,0];
      c.stickers.forEach(s => s.initNorm.forEach((v,i) => { if (v) pos[i] = v; }));
      return { pos, mat:[[1,0,0],[0,1,0],[0,0,1]], stickers:c.stickers };
    });
  }
  function walk(state, limit, visit) {
    const path = [];
    function visitDepth(depth, previous) {
      if (visit(key(state), path)) return true;
      if (depth === limit) return false;
      for (const move of moves) {
        const face = move[0];
        // Consecutive equal faces combine; opposite faces commute in fixed order.
        if (face === previous || (opposite[face] === previous && face < previous)) continue;
        math.applyMove(state, move);
        path.push(move);
        if (visitDepth(depth + 1, face)) return true;
        path.pop();
        math.applyMove(state, math.inverseMove(move));
      }
      return false;
    }
    return visitDepth(0, '');
  }
  function solve(cubies, maxDepth = 8) {
    if (!Number.isInteger(maxDepth) || maxDepth < 0 || maxDepth > 8) throw new Error('Search depth must be 0–8');
    const start = clone(cubies);
    const goal = solvedFrom(start);
    const goalKey = key(goal);
    if (key(start) === goalKey) return [];
    const goalDepth = Math.floor(maxDepth / 2);
    const paths = new Map();
    walk(goal, goalDepth, (stateKey, path) => {
      if (!paths.has(stateKey) || paths.get(stateKey).length > path.length) paths.set(stateKey, path.slice());
      return false;
    });
    let solution = null;
    walk(start, maxDepth - goalDepth, (stateKey, path) => {
      const fromGoal = paths.get(stateKey);
      if (!fromGoal) return false;
      solution = path.concat(fromGoal.slice().reverse().map(math.inverseMove));
      return true;
    });
    return solution;
  }
  return { solve };
})();
if (typeof module !== 'undefined' && module.exports) module.exports = NearSolver;
