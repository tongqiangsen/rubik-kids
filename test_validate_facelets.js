const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const CubeState = require('./cube-state');
const { validate } = require('./validate-facelets');
const { solve } = require('./near-solver');

const html = fs.readFileSync('index.html', 'utf8');
const map = vm.runInNewContext(`(${html.match(/const FACELET_MAP = (\{[\s\S]*?\n    \});/)[1]})`);
const normals = { u:[0,-1,0], d:[0,1,0], f:[0,0,1], b:[0,0,-1], l:[-1,0,0], r:[1,0,0] };
function freshCube() {
  const cubies = [];
  for (let x=-1; x<=1; x++) for (let y=-1; y<=1; y++) for (let z=-1; z<=1; z++) {
    if (x === 0 && y === 0 && z === 0) continue;
    cubies.push({ pos:[x,y,z], mat:[[1,0,0],[0,1,0],[0,0,1]], stickers:CubeState.initialStickers([x,y,z]) });
  }
  return cubies;
}
function facelets(cubies) {
  return Object.fromEntries(Object.entries(map).map(([key, {pos,dir}]) => {
    const piece = cubies.find(c => c.pos.every((n,i) => n === pos[i]));
    const sticker = piece.stickers.find(s => CubeState.vecMul(piece.mat,s.initNorm).every((n,i) => n === normals[dir][i]));
    return [key, sticker.color];
  }));
}
const solved = facelets(freshCube());
assert.equal(validate(solved).valid, true);
const moves = ['U','D','F','B','L','R',"U'","D'","F'","B'","L'","R'"];
const cube = freshCube();
for (let i=0; i<300; i++) {
  CubeState.applyMove(cube, moves[(i * 7 + Math.floor(i / 12)) % moves.length]);
  const state = facelets(cube);
  assert.equal(validate(state).valid, true, `legal turn ${i}`);
  if (i % 19 === 0) {
    const loaded = freshCube();
    CubeState.loadFacelets(loaded, state, map);
    assert.deepEqual(facelets(loaded), state, `3D reconstruction ${i}`);
    CubeState.applyMove(loaded, 'F');
    CubeState.applyMove(cube, 'F');
    assert.deepEqual(facelets(loaded), facelets(cube), `3D turn after reconstruction ${i}`);
    CubeState.applyMove(loaded, CubeState.inverseMove('F'));
    assert.deepEqual(facelets(loaded), state, `undo after reconstruction ${i}`);
  }
}
function altered(entries) {
  const state = { ...solved };
  for (const [key,color] of entries) state[key]=color;
  return state;
}
assert.equal(validate(altered([['U5','G'],['R1','Y']])).valid, false, 'single flipped edge');
assert.equal(validate(altered([['U8','G'],['R0','R'],['F2','Y']])).valid, false, 'single twisted corner');
assert.equal(validate(altered([['U5','Y'],['R1','R'],['U7','Y'],['F1','G']])).valid, false, 'invalid edge colors');
assert.equal(validate(altered([['R1','R'],['F1','G']])).valid, false, 'two swapped edges');
assert.equal(validate(altered([['U5','W'],['D5','Y']])).valid, false, 'invalid count or combination');
assert.equal(validate(altered([['U4','W'],['D4','Y']])).valid, false, 'wrong centers');
for (const scramble of [[], ['U'], ['R','U'], ['F2',"L'",'U'], ['U','R','F',"D'"], ['U','R','F','D','L','B','U','F']]) {
  const state = freshCube();
  scramble.forEach(move => CubeState.applyMove(state, move));
  const before = facelets(state);
  const solution = solve(state);
  assert(solution && solution.length <= 8, `find a short solution for ${scramble}`);
  assert.deepEqual(facelets(state), before, 'search must leave original state untouched');
  solution.forEach(move => CubeState.applyMove(state, move));
  assert.equal(CubeState.diagnose(state).allSolved, true, `solve ${scramble}`);
}
const distant = freshCube();
['U','R','F','D','L','B','U','F','R','D','B','L'].forEach(move => CubeState.applyMove(distant, move));
assert.equal(solve(distant), null, 'outside the eight-move range');
console.log('Facelet validation: legal turns and impossible states passed');
