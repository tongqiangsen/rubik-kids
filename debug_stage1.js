const fs = require('fs');

const ROTATION_DEFS = {
  "R":  { axis: 0, sliceVal: 1,  mat: [[1,0,0],[0,0,-1],[0,1,0]] },
  "R'": { axis: 0, sliceVal: 1,  mat: [[1,0,0],[0,0,1],[0,-1,0]] },
  "L":  { axis: 0, sliceVal: -1, mat: [[1,0,0],[0,0,1],[0,-1,0]] },
  "L'": { axis: 0, sliceVal: -1, mat: [[1,0,0],[0,0,-1],[0,1,0]] },
  "U":  { axis: 1, sliceVal: -1, mat: [[0,0,-1],[0,1,0],[1,0,0]] },
  "U'": { axis: 1, sliceVal: -1, mat: [[0,0,1],[0,1,0],[-1,0,0]] },
  "D":  { axis: 1, sliceVal: 1,  mat: [[0,0,1],[0,1,0],[-1,0,0]] },
  "D'": { axis: 1, sliceVal: 1,  mat: [[0,0,-1],[0,1,0],[1,0,0]] },
  "F":  { axis: 2, sliceVal: 1,  mat: [[0,-1,0],[1,0,0],[0,0,1]] },
  "F'": { axis: 2, sliceVal: 1,  mat: [[0,1,0],[-1,0,0],[0,0,1]] },
  "B":  { axis: 2, sliceVal: -1, mat: [[0,1,0],[-1,0,0],[0,0,1]] },
  "B'": { axis: 2, sliceVal: -1, mat: [[0,-1,0],[1,0,0],[0,0,1]] }
};

function matMul(a, b) {
  const res = [[0,0,0],[0,0,0],[0,0,0]];
  for(let i=0; i<3; i++) for(let j=0; j<3; j++) res[i][j] = a[i][0]*b[0][j] + a[i][1]*b[1][j] + a[i][2]*b[2][j];
  return res;
}
function vecMul(m, v) {
  return [
    m[0][0]*v[0] + m[0][1]*v[1] + m[0][2]*v[2],
    m[1][0]*v[0] + m[1][1]*v[1] + m[1][2]*v[2],
    m[2][0]*v[0] + m[2][1]*v[1] + m[2][2]*v[2]
  ];
}

class SimCube {
  constructor() {
    this.cubies = [];
    for (let x = -1; x <= 1; x++) {
      for (let y = -1; y <= 1; y++) {
        for (let z = -1; z <= 1; z++) {
          if (x === 0 && y === 0 && z === 0) continue;
          const stickers = [];
          if (y === -1) stickers.push({ initNorm: [0, -1, 0], color: 'Y' });
          if (y === 1)  stickers.push({ initNorm: [0, 1, 0],  color: 'W' });
          if (z === 1)  stickers.push({ initNorm: [0, 0, 1],  color: 'R' });
          if (z === -1) stickers.push({ initNorm: [0, 0, -1], color: 'O' });
          if (x === -1) stickers.push({ initNorm: [-1, 0, 0], color: 'B' });
          if (x === 1)  stickers.push({ initNorm: [1, 0, 0],  color: 'G' });

          this.cubies.push({
            pos: [x, y, z],
            mat: [[1,0,0],[0,1,0],[0,0,1]],
            stickers
          });
        }
      }
    }
  }

  move(code) {
    if (code.endsWith('2')) {
      const b = code[0];
      this.move(b);
      this.move(b);
      return;
    }
    const def = ROTATION_DEFS[code];
    const ax = def.axis;
    this.cubies.forEach(c => {
      if (c.pos[ax] === def.sliceVal) {
        c.pos = vecMul(def.mat, c.pos);
        c.mat = matMul(def.mat, c.mat);
      }
    });
  }

  getFace(faceName) {
    const normalMap = {
      U: [0, -1, 0], D: [0, 1, 0], F: [0, 0, 1], B: [0, 0, -1], L: [-1, 0, 0], R: [1, 0, 0]
    };
    const targetNorm = normalMap[faceName];
    const grid = [];
    for (let r = -1; r <= 1; r++) {
      const row = [];
      for (let c = -1; c <= 1; c++) {
        let px, py, pz;
        if (faceName === 'U') { px = c; py = -1; pz = r; }
        else if (faceName === 'D') { px = c; py = 1; pz = -r; }
        else if (faceName === 'F') { px = c; py = r; pz = 1; }
        else if (faceName === 'B') { px = -c; py = r; pz = -1; }
        else if (faceName === 'L') { px = -1; py = r; pz = -c; }
        else if (faceName === 'R') { px = 1; py = r; pz = c; }

        if (px === 0 && py === 0 && pz === 0) {
          row.push('?');
          continue;
        }
        const cubie = this.cubies.find(cb => cb.pos[0] === px && cb.pos[1] === py && cb.pos[2] === pz);
        if (!cubie) {
          row.push('?');
          continue;
        }
        let foundColor = '?';
        cubie.stickers.forEach(st => {
          const curNorm = vecMul(cubie.mat, st.initNorm);
          if (curNorm[0] === targetNorm[0] && curNorm[1] === targetNorm[1] && curNorm[2] === targetNorm[2]) {
            foundColor = st.color;
          }
        });
        row.push(foundColor);
      }
      grid.push(row.join(' '));
    }
    return grid;
  }
}

const c = new SimCube();
console.log("=== Initial Solved State ===");

// Apply Level 1 Setup: ["R2", "U'", "F2", "U'"]
["R2", "U'", "F2", "U'"].forEach(m => c.move(m));
console.log("\n=== 0. After Setup: R2 U' F2 U' ===");
console.log("U:\n" + c.getFace('U').join('\n'));
console.log("F:\n" + c.getFace('F').join('\n'));
console.log("R:\n" + c.getFace('R').join('\n'));
console.log("D:\n" + c.getFace('D').join('\n'));

const steps = ["U", "F2", "U", "R2"];
steps.forEach((s, idx) => {
  c.move(s);
  console.log(`\n=== ${idx + 1}. After Step ${idx + 1} (${s}) ===`);
  console.log("U:\n" + c.getFace('U').join('\n'));
  console.log("F:\n" + c.getFace('F').join('\n'));
  console.log("R:\n" + c.getFace('R').join('\n'));
  console.log("D:\n" + c.getFace('D').join('\n'));
});
