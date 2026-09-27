const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const CubeState = require('./cube-state');
const Cube = require('./vendor/cubejs/cube');
require('./vendor/cubejs/solve');
const Bridge = require('./solver-bridge');
const CrossSolver = require('./cross-solver');
const Layer1Solver = require('./layer1-solver');
const MiddleSolver = require('./middle-solver');
const YellowCrossSolver = require('./yellow-cross-solver');
const YellowFaceSolver = require('./yellow-face-solver');
const TopCornersSolver = require('./top-corners-solver');
const TopEdgesSolver = require('./top-edges-solver');
const Validator = require('./validate-facelets');

const html = fs.readFileSync('index.html','utf8');
const map = vm.runInNewContext(`(${html.match(/const FACELET_MAP = (\{[\s\S]*?\n    \});/)[1]})`);
const fresh = () => {
  const cubies = [];
  for (let x=-1;x<=1;x++) for (let y=-1;y<=1;y++) for (let z=-1;z<=1;z++) {
    if (!x && !y && !z) continue;
    cubies.push({pos:[x,y,z],mat:[[1,0,0],[0,1,0],[0,0,1]],stickers:CubeState.initialStickers([x,y,z])});
  }
  return cubies;
};
const cases = [
  ['U','R','F','D','L','B','U','F','R','D','B','L'],
  ["F'",'R2','B',"U'",'D2',"L'",'F2','U','R',"B'",'D','L','F','R2','U2','B2','L2','D','F2','U'],
  ['R','U',"R'","U'",'F','D2','B2','L','U2','F2','R',"D'",'B',"L'",'U',"F'",'R2','D','L2',"B'"]
];
let seed = 1729;
const choices = ['U',"U'",'U2','R',"R'",'R2','F',"F'",'F2','D',"D'",'D2','L',"L'",'L2','B',"B'",'B2'];
for (let sample=0;sample<8;sample++) {
  const scramble = [];
  while (scramble.length < 25) {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    const move = choices[seed % choices.length];
    if (scramble.length && move[0] === scramble[scramble.length - 1][0]) continue;
    scramble.push(move);
  }
  cases.push(scramble);
}
Cube.initSolver();
assert.throws(() => Layer1Solver.solve(new Cube().move('R').asString()), /白十字/);
assert.throws(() => MiddleSolver.solve(new Cube().move('R').asString()), /第一层/);
assert.throws(() => YellowCrossSolver.solve(new Cube().move('R').asString()), /前两层/);
assert.throws(() => YellowFaceSolver.solve(new Cube().move('R').asString()), /黄色十字/);
assert.throws(() => TopCornersSolver.solve(new Cube().move('R').asString()), /黄色整面/);
assert.throws(() => TopEdgesSolver.solve(new Cube().move('R').asString()), /顶角归位/);
for (const scramble of cases) {
  const cubies = fresh();
  const expected = new Cube();
  for (const move of scramble) {
    CubeState.applyMove(cubies,move);
    expected.move(move);
  }
  const facelets = Bridge.toFaceletString(CubeState.faceletsFromCubies(cubies,map));
  assert.equal(facelets,expected.asString(), 'facelets and solver notation must agree');
  const whiteCross = CrossSolver.solve(facelets);
  assert(Bridge.verify(cubies,whiteCross,'crossDone'), 'cross guide must match the 3D model');
  const crossPreview = fresh();
  CubeState.loadFacelets(crossPreview,CubeState.faceletsFromCubies(cubies,map),map);
  whiteCross.forEach(move => CubeState.applyMove(crossPreview,move));
  assert.equal(CubeState.crossCount(crossPreview),4);
  const crossFacelets = Bridge.toFaceletString(CubeState.faceletsFromCubies(crossPreview,map));
  const corners = Layer1Solver.solve(crossFacelets);
  const groups = Layer1Solver.solveGroups(crossFacelets);
  assert.deepEqual(groups.flat(),corners);
  assert(Bridge.verify(crossPreview,corners,'firstLayerDone'),'first-layer guide must preserve white cross');
  for (const group of groups) {
    group.forEach(move => CubeState.applyMove(crossPreview,move));
    assert.equal(CubeState.diagnose(crossPreview).crossDone,true,'each teaching group preserves white cross');
  }
  assert.equal(CubeState.firstLayerCornerCount(crossPreview),4);
  const middleGroups = MiddleSolver.solveGroups(Bridge.toFaceletString(CubeState.faceletsFromCubies(crossPreview,map)));
  for (const group of middleGroups) {
    group.forEach(move => CubeState.applyMove(crossPreview,move));
    assert(CubeState.diagnose(crossPreview).firstLayerDone,'each middle group preserves the first layer');
  }
  assert.equal(CubeState.middleEdgeCount(crossPreview),4);
  const yellowGroups = YellowCrossSolver.solveGroups(Bridge.toFaceletString(CubeState.faceletsFromCubies(crossPreview,map)));
  for (const group of yellowGroups) {
    group.forEach(move => CubeState.applyMove(crossPreview,move));
    assert(CubeState.diagnose(crossPreview).f2lDone,'each yellow-cross group preserves two layers');
  }
  assert.equal(CubeState.yellowEdgeCount(crossPreview),4);
  const yellowFaceGroups = YellowFaceSolver.solveGroups(Bridge.toFaceletString(CubeState.faceletsFromCubies(crossPreview,map)));
  for (const group of yellowFaceGroups) {
    group.forEach(move => CubeState.applyMove(crossPreview,move));
    assert(CubeState.diagnose(crossPreview).yellowCrossDone,'each yellow-face group preserves yellow cross');
  }
  assert.equal(CubeState.yellowCornerCount(crossPreview),4);
  const topCornerGroups = TopCornersSolver.solveGroups(Bridge.toFaceletString(CubeState.faceletsFromCubies(crossPreview,map)));
  for (const group of topCornerGroups) {
    group.forEach(move => CubeState.applyMove(crossPreview,move));
    assert(CubeState.diagnose(crossPreview).yellowFaceDone,'each top-corner group preserves yellow face');
  }
  assert.equal(CubeState.topCornerCount(crossPreview),4);
  const topEdgeGroups = TopEdgesSolver.solveGroups(Bridge.toFaceletString(CubeState.faceletsFromCubies(crossPreview,map)));
  for (const group of topEdgeGroups) {
    group.forEach(move => CubeState.applyMove(crossPreview,move));
    assert(CubeState.diagnose(crossPreview).topCornersDone,'each top-edge group preserves corners');
  }
  assert(CubeState.diagnose(crossPreview).allSolved,'staged teaching must solve whole cube');
  const algorithm = Cube.fromString(facelets).solve();
  const solution = Bridge.parseMoves(algorithm);
  assert(Bridge.verify(cubies,solution), 'solution must solve the 3D model');
  assert.equal(Cube.fromString(facelets).move(algorithm).isSolved(),true);
  assert.equal(Bridge.toFaceletString(CubeState.faceletsFromCubies(cubies,map)),facelets,'solver must not mutate the model');
}
const faceColors = {U:'Y',R:'G',F:'R',D:'W',L:'B',B:'O'};
for (let i=0;i<25;i++) {
  const randomFacelets = Cube.random().asString();
  const painted = Object.fromEntries([...'URFDLB'].flatMap((face,faceIndex) =>
    Array.from({length:9},(_,index) => [`${face}${index}`,faceColors[randomFacelets[faceIndex * 9 + index]]])));
  assert.equal(Validator.validate(painted).valid,true,'random cube must pass input validation');
  const cubies = fresh();
  CubeState.loadFacelets(cubies,painted,map);
  const solution = CrossSolver.solve(randomFacelets);
  assert(Bridge.verify(cubies,solution,'crossDone'),`random cross ${i}`);
  solution.forEach(move => CubeState.applyMove(cubies,move));
  const corners = Layer1Solver.solve(Bridge.toFaceletString(CubeState.faceletsFromCubies(cubies,map)));
  assert(Bridge.verify(cubies,corners,'firstLayerDone'),`random first layer ${i}`);
  corners.forEach(move => CubeState.applyMove(cubies,move));
  const middle = MiddleSolver.solve(Bridge.toFaceletString(CubeState.faceletsFromCubies(cubies,map)));
  assert(Bridge.verify(cubies,middle,'f2lDone'),`random middle layer ${i}`);
  middle.forEach(move => CubeState.applyMove(cubies,move));
  const yellow = YellowCrossSolver.solve(Bridge.toFaceletString(CubeState.faceletsFromCubies(cubies,map)));
  assert(Bridge.verify(cubies,yellow,'yellowCrossDone'),`random yellow cross ${i}`);
  yellow.forEach(move => CubeState.applyMove(cubies,move));
  const yellowFace = YellowFaceSolver.solve(Bridge.toFaceletString(CubeState.faceletsFromCubies(cubies,map)));
  assert(Bridge.verify(cubies,yellowFace,'yellowFaceDone'),`random yellow face ${i}`);
  yellowFace.forEach(move => CubeState.applyMove(cubies,move));
  const topCorners = TopCornersSolver.solve(Bridge.toFaceletString(CubeState.faceletsFromCubies(cubies,map)));
  assert(Bridge.verify(cubies,topCorners,'topCornersDone'),`random top corners ${i}`);
  topCorners.forEach(move => CubeState.applyMove(cubies,move));
  const topEdges = TopEdgesSolver.solve(Bridge.toFaceletString(CubeState.faceletsFromCubies(cubies,map)));
  assert(Bridge.verify(cubies,topEdges,'allSolved'),`random top edges ${i}`);
}
const workerMessages = [];
const context = vm.createContext({
  self:{ postMessage: message => workerMessages.push(message) },
  importScripts(...paths) {
    for (const path of paths) vm.runInContext(fs.readFileSync(path,'utf8'),context,{filename:path});
  }
});
vm.runInContext(fs.readFileSync('solver-worker.js','utf8'),context,{filename:'solver-worker.js'});
const workerScramble = cases[1];
const workerCube = fresh();
workerScramble.forEach(move => CubeState.applyMove(workerCube,move));
const workerFacelets = Bridge.toFaceletString(CubeState.faceletsFromCubies(workerCube,map));
context.self.onmessage({data:{id:41,facelets:workerFacelets,mode:'cross'}});
assert.equal(workerMessages[0].id,41);
assert.equal(workerMessages[0].error,undefined);
assert(Bridge.verify(workerCube,Bridge.parseMoves(workerMessages[0].algorithm),'crossDone'));
const crossWorkerCube = fresh();
CubeState.loadFacelets(crossWorkerCube,CubeState.faceletsFromCubies(workerCube,map),map);
Bridge.parseMoves(workerMessages[0].algorithm).forEach(move => CubeState.applyMove(crossWorkerCube,move));
context.self.onmessage({data:{id:43,facelets:Bridge.toFaceletString(CubeState.faceletsFromCubies(crossWorkerCube,map)),mode:'layer1'}});
assert.equal(workerMessages[1].error,undefined);
assert.deepEqual(Array.from(workerMessages[1].groups.flat()),Bridge.parseMoves(workerMessages[1].algorithm));
assert(Bridge.verify(crossWorkerCube,Bridge.parseMoves(workerMessages[1].algorithm),'firstLayerDone'));
Bridge.parseMoves(workerMessages[1].algorithm).forEach(move => CubeState.applyMove(crossWorkerCube,move));
context.self.onmessage({data:{id:44,facelets:Bridge.toFaceletString(CubeState.faceletsFromCubies(crossWorkerCube,map)),mode:'middle'}});
assert.equal(workerMessages[2].error,undefined);
assert(Bridge.verify(crossWorkerCube,Bridge.parseMoves(workerMessages[2].algorithm),'f2lDone'));
Bridge.parseMoves(workerMessages[2].algorithm).forEach(move => CubeState.applyMove(crossWorkerCube,move));
context.self.onmessage({data:{id:45,facelets:Bridge.toFaceletString(CubeState.faceletsFromCubies(crossWorkerCube,map)),mode:'yellowCross'}});
assert.equal(workerMessages[3].error,undefined);
assert(Bridge.verify(crossWorkerCube,Bridge.parseMoves(workerMessages[3].algorithm),'yellowCrossDone'));
Bridge.parseMoves(workerMessages[3].algorithm).forEach(move => CubeState.applyMove(crossWorkerCube,move));
context.self.onmessage({data:{id:46,facelets:Bridge.toFaceletString(CubeState.faceletsFromCubies(crossWorkerCube,map)),mode:'yellowFace'}});
assert.equal(workerMessages[4].error,undefined);
assert(Bridge.verify(crossWorkerCube,Bridge.parseMoves(workerMessages[4].algorithm),'yellowFaceDone'));
Bridge.parseMoves(workerMessages[4].algorithm).forEach(move => CubeState.applyMove(crossWorkerCube,move));
context.self.onmessage({data:{id:47,facelets:Bridge.toFaceletString(CubeState.faceletsFromCubies(crossWorkerCube,map)),mode:'topCorners'}});
assert.equal(workerMessages[5].error,undefined);
assert(Bridge.verify(crossWorkerCube,Bridge.parseMoves(workerMessages[5].algorithm),'topCornersDone'));
Bridge.parseMoves(workerMessages[5].algorithm).forEach(move => CubeState.applyMove(crossWorkerCube,move));
context.self.onmessage({data:{id:48,facelets:Bridge.toFaceletString(CubeState.faceletsFromCubies(crossWorkerCube,map)),mode:'topEdges'}});
assert.equal(workerMessages[6].error,undefined);
assert(Bridge.verify(crossWorkerCube,Bridge.parseMoves(workerMessages[6].algorithm),'allSolved'));
context.self.onmessage({data:{id:42,facelets:workerFacelets,mode:'full'}});
assert.equal(workerMessages[7].id,42);
assert.equal(workerMessages[7].error,undefined);
assert(Bridge.verify(workerCube,Bridge.parseMoves(workerMessages[7].algorithm)));
console.log(`Full solver: ${cases.length} legal scrambles and browser worker simulation passed`);
