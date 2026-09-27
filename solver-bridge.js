const SolverBridge = (() => {
  const faces = 'URFDLB';
  const colorToFace = { Y:'U', G:'R', R:'F', W:'D', B:'L', O:'B' };
  function toFaceletString(facelets) {
    const result = [...faces].flatMap(face => Array.from({length:9}, (_,i) => colorToFace[facelets[`${face}${i}`]])).join('');
    if (result.length !== 54 || /[^URFDLB]/.test(result)) throw new Error('Invalid facelets');
    return result;
  }
  function parseMoves(algorithm) {
    if (!algorithm.trim()) return [];
    const moves = algorithm.trim().split(/\s+/);
    if (moves.some(move => !/^[URFDLB](?:2|')?$/.test(move))) throw new Error('Unknown solver move');
    return moves;
  }
  function verify(cubies, moves, goal = 'allSolved') {
    const math = typeof module !== 'undefined' && module.exports ? require('./cube-state') : CubeState;
    const copy = cubies.map(c => ({ pos:c.pos.slice(), mat:c.mat.map(row => row.slice()), stickers:c.stickers }));
    moves.forEach(move => math.applyMove(copy, move));
    if (!['crossDone','firstLayerDone','f2lDone','yellowCrossDone','yellowFaceDone','topCornersDone','allSolved'].includes(goal)) throw new Error('Unknown verification goal');
    return math.diagnose(copy)[goal];
  }
  return { toFaceletString, parseMoves, verify };
})();
if (typeof module !== 'undefined' && module.exports) module.exports = SolverBridge;
