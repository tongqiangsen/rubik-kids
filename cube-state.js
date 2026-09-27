// Cube state shared by the lesson UI and tests. Coordinates: U=-Y, F=+Z.
const CubeState = (() => {
  const ROTATION_DEFS = {
    R: { axis: 'x', sliceVal: 1, pivotCss: 'rotateX(90deg)', mat: [[1,0,0],[0,0,-1],[0,1,0]] },
    "R'": { axis: 'x', sliceVal: 1, pivotCss: 'rotateX(-90deg)', mat: [[1,0,0],[0,0,1],[0,-1,0]] },
    L: { axis: 'x', sliceVal: -1, pivotCss: 'rotateX(-90deg)', mat: [[1,0,0],[0,0,1],[0,-1,0]] },
    "L'": { axis: 'x', sliceVal: -1, pivotCss: 'rotateX(90deg)', mat: [[1,0,0],[0,0,-1],[0,1,0]] },
    U: { axis: 'y', sliceVal: -1, pivotCss: 'rotateY(-90deg)', mat: [[0,0,-1],[0,1,0],[1,0,0]] },
    "U'": { axis: 'y', sliceVal: -1, pivotCss: 'rotateY(90deg)', mat: [[0,0,1],[0,1,0],[-1,0,0]] },
    D: { axis: 'y', sliceVal: 1, pivotCss: 'rotateY(90deg)', mat: [[0,0,1],[0,1,0],[-1,0,0]] },
    "D'": { axis: 'y', sliceVal: 1, pivotCss: 'rotateY(-90deg)', mat: [[0,0,-1],[0,1,0],[1,0,0]] },
    F: { axis: 'z', sliceVal: 1, pivotCss: 'rotateZ(90deg)', mat: [[0,-1,0],[1,0,0],[0,0,1]] },
    "F'": { axis: 'z', sliceVal: 1, pivotCss: 'rotateZ(-90deg)', mat: [[0,1,0],[-1,0,0],[0,0,1]] },
    B: { axis: 'z', sliceVal: -1, pivotCss: 'rotateZ(-90deg)', mat: [[0,1,0],[-1,0,0],[0,0,1]] },
    "B'": { axis: 'z', sliceVal: -1, pivotCss: 'rotateZ(90deg)', mat: [[0,-1,0],[1,0,0],[0,0,1]] }
  };
  const FACE_COLORS = { '0,-1,0': 'Y', '0,1,0': 'W', '0,0,1': 'R', '0,0,-1': 'O', '-1,0,0': 'B', '1,0,0': 'G' };
  const D = [0, 1, 0], U = [0, -1, 0], F = [0, 0, 1], B = [0, 0, -1], L = [-1, 0, 0], R = [1, 0, 0];

  function vecMul(m, v) {
    return [
      m[0][0]*v[0] + m[0][1]*v[1] + m[0][2]*v[2],
      m[1][0]*v[0] + m[1][1]*v[1] + m[1][2]*v[2],
      m[2][0]*v[0] + m[2][1]*v[1] + m[2][2]*v[2]
    ];
  }

  function matMul(a, b) {
    const result = [[0,0,0],[0,0,0],[0,0,0]];
    for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) {
      result[i][j] = a[i][0]*b[0][j] + a[i][1]*b[1][j] + a[i][2]*b[2][j];
    }
    return result;
  }

  function initialStickers(pos) {
    const [x, y, z] = pos;
    return [
      y === -1 && { initNorm: U, color: 'Y' },
      y === 1 && { initNorm: D, color: 'W' },
      z === 1 && { initNorm: F, color: 'R' },
      z === -1 && { initNorm: B, color: 'O' },
      x === -1 && { initNorm: L, color: 'B' },
      x === 1 && { initNorm: R, color: 'G' }
    ].filter(Boolean);
  }

  function inverseMove(move) {
    if (move.endsWith('2')) return move;
    if (!ROTATION_DEFS[move]) throw new Error(`Unknown move: ${move}`);
    return move.endsWith("'") ? move[0] : `${move}'`;
  }

  function applyMove(cubies, move) {
    if (move.endsWith('2')) {
      const base = move.slice(0, -1);
      if (!ROTATION_DEFS[base]) throw new Error(`Unknown move: ${move}`);
      applyMove(cubies, base);
      applyMove(cubies, base);
      return;
    }
    const def = ROTATION_DEFS[move];
    if (!def) throw new Error(`Unknown move: ${move}`);
    const axis = { x: 0, y: 1, z: 2 }[def.axis];
    cubies.forEach(piece => {
      if (piece.pos[axis] !== def.sliceVal) return;
      piece.pos = vecMul(def.mat, piece.pos);
      piece.mat = matMul(def.mat, piece.mat);
    });
  }

  function diagnose(cubies) {
    const stickerAt = (pos, norm) => {
      const piece = cubies.find(c => c.pos.every((value, i) => value === pos[i]));
      const sticker = piece && piece.stickers.find(s => vecMul(piece.mat, s.initNorm).every((value, i) => value === norm[i]));
      return sticker && sticker.color;
    };
    const matches = (pos, normals) => normals.every(norm => stickerAt(pos, norm) === FACE_COLORS[norm.join(',')]);
    const crossDone = matches([0, 1, 1], [D, F]) && matches([1, 1, 0], [D, R]) &&
      matches([0, 1, -1], [D, B]) && matches([-1, 1, 0], [D, L]);
    const firstLayerDone = crossDone && matches([-1, 1, 1], [D, F, L]) &&
      matches([1, 1, 1], [D, F, R]) && matches([1, 1, -1], [D, B, R]) && matches([-1, 1, -1], [D, B, L]);
    const f2lDone = firstLayerDone && matches([-1, 0, 1], [F, L]) &&
      matches([1, 0, 1], [F, R]) && matches([1, 0, -1], [B, R]) && matches([-1, 0, -1], [B, L]);
    const yellowCrossDone = f2lDone && [[0,-1,1],[1,-1,0],[0,-1,-1],[-1,-1,0]]
      .every(pos => stickerAt(pos,U) === 'Y');
    const yellowFaceDone = yellowCrossDone && [-1, 0, 1].every(x => [-1, 0, 1].every(z => stickerAt([x, -1, z], U) === 'Y'));
    const topCornersDone = yellowFaceDone && topCornerCount(cubies) === 4;
    const allSolved = cubies.every(c => c.stickers.every(s => FACE_COLORS[vecMul(c.mat, s.initNorm).join(',')] === s.color));
    return { crossDone, firstLayerDone, f2lDone, yellowCrossDone, yellowFaceDone, topCornersDone, allSolved };
  }

  function crossCount(cubies) {
    const stickerAt = (pos, norm) => {
      const piece = cubies.find(c => c.pos.every((v,i) => v === pos[i]));
      const sticker = piece && piece.stickers.find(s => vecMul(piece.mat,s.initNorm).every((v,i) => v === norm[i]));
      return sticker && sticker.color;
    };
    return [[0,1,1,F], [1,1,0,R], [0,1,-1,B], [-1,1,0,L]]
      .filter(([x,y,z,side]) => stickerAt([x,y,z],D) === 'W' && stickerAt([x,y,z],side) === FACE_COLORS[side.join(',')]).length;
  }

  function firstLayerCornerCount(cubies) {
    const stickerAt = (pos, norm) => {
      const piece = cubies.find(c => c.pos.every((v,i) => v === pos[i]));
      const sticker = piece && piece.stickers.find(s => vecMul(piece.mat,s.initNorm).every((v,i) => v === norm[i]));
      return sticker && sticker.color;
    };
    return [[-1,1,1,[D,F,L]], [1,1,1,[D,F,R]], [-1,1,-1,[D,B,L]], [1,1,-1,[D,B,R]]]
      .filter(([x,y,z,normals]) => normals.every(normal => stickerAt([x,y,z],normal) === FACE_COLORS[normal.join(',')])).length;
  }

  function middleEdgeCount(cubies) {
    const stickerAt = (pos, norm) => {
      const piece = cubies.find(c => c.pos.every((v,i) => v === pos[i]));
      const sticker = piece && piece.stickers.find(s => vecMul(piece.mat,s.initNorm).every((v,i) => v === norm[i]));
      return sticker && sticker.color;
    };
    return [[-1,0,1,[F,L]], [1,0,1,[F,R]], [-1,0,-1,[B,L]], [1,0,-1,[B,R]]]
      .filter(([x,y,z,normals]) => normals.every(normal => stickerAt([x,y,z],normal) === FACE_COLORS[normal.join(',')])).length;
  }
  function yellowEdgeCount(cubies) {
    return [[0,-1,1],[1,-1,0],[0,-1,-1],[-1,-1,0]]
      .filter(pos => {
        const piece = cubies.find(c => c.pos.every((v,i) => v === pos[i]));
        const sticker = piece && piece.stickers.find(s => vecMul(piece.mat,s.initNorm).every((v,i) => v === U[i]));
        return sticker && sticker.color === 'Y';
      }).length;
  }
  function yellowCornerCount(cubies) {
    return [[-1,-1,1],[1,-1,1],[-1,-1,-1],[1,-1,-1]]
      .filter(pos => {
        const piece = cubies.find(c => c.pos.every((v,i) => v === pos[i]));
        const sticker = piece && piece.stickers.find(s => vecMul(piece.mat,s.initNorm).every((v,i) => v === U[i]));
        return sticker && sticker.color === 'Y';
      }).length;
  }
  function topCornerCount(cubies) {
    const slots = [[-1,-1,1,[U,F,L]],[1,-1,1,[U,F,R]],[-1,-1,-1,[U,B,L]],[1,-1,-1,[U,B,R]]];
    return slots.filter(([x,y,z,normals]) => {
      const piece = cubies.find(c => c.pos.every((v,i) => v === [x,y,z][i]));
      return normals.every(normal => piece.stickers.some(s =>
        s.color === FACE_COLORS[normal.join(',')] && vecMul(piece.mat,s.initNorm).every((v,i) => v === normal[i])));
    }).length;
  }
  function topEdgeCount(cubies) {
    const slots = [[0,-1,1,[U,F]],[1,-1,0,[U,R]],[0,-1,-1,[U,B]],[-1,-1,0,[U,L]]];
    return slots.filter(([x,y,z,normals]) => {
      const piece = cubies.find(c => c.pos.every((v,i) => v === [x,y,z][i]));
      return normals.every(normal => piece.stickers.some(s =>
        s.color === FACE_COLORS[normal.join(',')] && vecMul(piece.mat,s.initNorm).every((v,i) => v === normal[i])));
    }).length;
  }

  // Map a checked set of facelets onto physical pieces, including orientation.
  function loadFacelets(cubies, facelets, faceletMap) {
    const normals = { u:U, d:D, f:F, b:B, l:L, r:R };
    const quarterTurns = [ROTATION_DEFS.R.mat, ROTATION_DEFS.U.mat, ROTATION_DEFS.F.mat];
    const identity = [[1,0,0],[0,1,0],[0,0,1]];
    const rotations = [identity];
    for (let i = 0; i < rotations.length; i++) for (const turn of quarterTurns) {
      const next = matMul(turn, rotations[i]);
      if (!rotations.some(m => JSON.stringify(m) === JSON.stringify(next))) rotations.push(next);
    }
    const slots = new Map();
    for (const [key, {pos,dir}] of Object.entries(faceletMap)) {
      const id = pos.join(',');
      if (!slots.has(id)) slots.set(id, { pos, stickers:[] });
      slots.get(id).stickers.push({ norm:normals[dir], color:facelets[key] });
    }
    const used = new Set();
    for (const slot of slots.values()) {
      const colors = slot.stickers.map(s => s.color).sort().join('');
      const piece = cubies.find(c => !used.has(c) && c.stickers.map(s => s.color).sort().join('') === colors);
      if (!piece) throw new Error('Facelets do not identify a unique piece');
      const mat = rotations.find(rotation => piece.stickers.every(sticker =>
        slot.stickers.some(target => target.color === sticker.color &&
          vecMul(rotation, sticker.initNorm).every((value,i) => value === target.norm[i]))));
      if (!mat) throw new Error('Facelets cannot orient a piece');
      piece.pos = slot.pos.slice();
      piece.mat = mat.map(row => row.slice());
      used.add(piece);
    }
    if (used.size !== cubies.length) throw new Error('Facelets are incomplete');
  }

  function faceletsFromCubies(cubies, faceletMap) {
    const normals = { u:U, d:D, f:F, b:B, l:L, r:R };
    return Object.fromEntries(Object.entries(faceletMap).map(([key, {pos,dir}]) => {
      const piece = cubies.find(c => c.pos.every((v,i) => v === pos[i]));
      const sticker = piece && piece.stickers.find(s =>
        vecMul(piece.mat,s.initNorm).every((v,i) => v === normals[dir][i]));
      if (!sticker) throw new Error(`Missing sticker at ${key}`);
      return [key, sticker.color];
    }));
  }

  return { ROTATION_DEFS, vecMul, matMul, initialStickers, inverseMove, applyMove, diagnose, crossCount, firstLayerCornerCount, middleEdgeCount, yellowEdgeCount, yellowCornerCount, topCornerCount, topEdgeCount, loadFacelets, faceletsFromCubies };
})();

if (typeof module !== 'undefined' && module.exports) module.exports = CubeState;
