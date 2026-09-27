// Exact math verification of the 5 Adventure Stages
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
    this.reset();
  }
  reset() {
    this.cubies = [];
    for (let x = -1; x <= 1; x++) {
      for (let y = -1; y <= 1; y++) {
        for (let z = -1; z <= 1; z++) {
          if (x === 0 && y === 0 && z === 0) continue;
          // Initial sticker colors on this cubie:
          // normal vector -> initial face color:
          // [0,-1,0] -> Y, [0,1,0] -> W, [0,0,1] -> R, [0,0,-1] -> O, [-1,0,0] -> B, [1,0,0] -> G
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
    if (!def) return;
    this.cubies.forEach(c => {
      if (c.pos[def.axis] === def.sliceVal) {
        c.pos = vecMul(def.mat, c.pos);
        c.mat = matMul(def.mat, c.mat);
      }
    });
  }

  moves(arr) {
    arr.forEach(m => this.move(m));
  }

  // Get current color of a sticker at world position [x,y,z] facing normal [nx,ny,nz]
  getSticker(pos, norm) {
    const c = this.cubies.find(cb => cb.pos[0] === pos[0] && cb.pos[1] === pos[1] && cb.pos[2] === pos[2]);
    if (!c) return null;
    // Find sticker whose c.mat * initNorm == norm
    for (const s of c.stickers) {
      const curNorm = vecMul(c.mat, s.initNorm);
      if (curNorm[0] === norm[0] && curNorm[1] === norm[1] && curNorm[2] === norm[2]) {
        return s.color;
      }
    }
    return null;
  }

  // Diagnosis
  diagnose() {
    // 1. Cross (D face y=1 norm [0,1,0])
    // Edges: [0,1,1] with F [0,0,1]
    const dfW = this.getSticker([0,1,1], [0,1,0]) === 'W' && this.getSticker([0,1,1], [0,0,1]) === 'R';
    const drW = this.getSticker([1,1,0], [0,1,0]) === 'W' && this.getSticker([1,1,0], [1,0,0]) === 'G';
    const dbW = this.getSticker([0,1,-1], [0,1,0]) === 'W' && this.getSticker([0,1,-1], [0,0,-1]) === 'O';
    const dlW = this.getSticker([-1,1,0], [0,1,0]) === 'W' && this.getSticker([-1,1,0], [-1,0,0]) === 'B';
    const crossDone = dfW && drW && dbW && dlW;

    // 2. First layer corners
    const dfl = this.getSticker([-1,1,1], [0,1,0]) === 'W' && this.getSticker([-1,1,1], [0,0,1]) === 'R' && this.getSticker([-1,1,1], [-1,0,0]) === 'B';
    const dfr = this.getSticker([1,1,1], [0,1,0]) === 'W' && this.getSticker([1,1,1], [0,0,1]) === 'R' && this.getSticker([1,1,1], [1,0,0]) === 'G';
    const dbr = this.getSticker([1,1,-1], [0,1,0]) === 'W' && this.getSticker([1,1,-1], [0,0,-1]) === 'O' && this.getSticker([1,1,-1], [1,0,0]) === 'G';
    const dbl = this.getSticker([-1,1,-1], [0,1,0]) === 'W' && this.getSticker([-1,1,-1], [0,0,-1]) === 'O' && this.getSticker([-1,1,-1], [-1,0,0]) === 'B';
    const firstLayerDone = crossDone && dfl && dfr && dbr && dbl;

    // 3. F2L middle edges
    const fl = this.getSticker([-1,0,1], [0,0,1]) === 'R' && this.getSticker([-1,0,1], [-1,0,0]) === 'B';
    const fr = this.getSticker([1,0,1], [0,0,1]) === 'R' && this.getSticker([1,0,1], [1,0,0]) === 'G';
    const br = this.getSticker([1,0,-1], [0,0,-1]) === 'O' && this.getSticker([1,0,-1], [1,0,0]) === 'G';
    const bl = this.getSticker([-1,0,-1], [0,0,-1]) === 'O' && this.getSticker([-1,0,-1], [-1,0,0]) === 'B';
    const f2lDone = firstLayerDone && fl && fr && br && bl;

    // 4. Yellow Face (U face y=-1 norm [0,-1,0])
    let yellowCount = 0;
    for (let x = -1; x <= 1; x++) {
      for (let z = -1; z <= 1; z++) {
        if (this.getSticker([x, -1, z], [0, -1, 0]) === 'Y') yellowCount++;
      }
    }
    const yellowFaceDone = f2lDone && (yellowCount === 9);

    // 5. All solved
    let allSolved = true;
    const faceChecks = [
      { norm: [0, -1, 0], exp: 'Y', y: -1 },
      { norm: [0, 1, 0], exp: 'W', y: 1 },
      { norm: [0, 0, 1], exp: 'R', z: 1 },
      { norm: [0, 0, -1], exp: 'O', z: -1 },
      { norm: [-1, 0, 0], exp: 'B', x: -1 },
      { norm: [1, 0, 0], exp: 'G', x: 1 }
    ];
    for (const fc of faceChecks) {
      for (let a = -1; a <= 1; a++) {
        for (let b = -1; b <= 1; b++) {
          let pos;
          if (fc.y !== undefined) pos = [a, fc.y, b];
          else if (fc.z !== undefined) pos = [a, b, fc.z];
          else pos = [fc.x, a, b];
          if (this.getSticker(pos, fc.norm) !== fc.exp) {
            allSolved = false;
          }
        }
      }
    }

    return { crossDone, firstLayerDone, f2lDone, yellowCount, yellowFaceDone, allSolved };
  }
}

const LEVELS = [
  { id: 1, name: '小黄花农场', setup: ["R2", "U'", "F2", "U'"], steps: ["U", "F2", "U", "R2"] },
  { id: 2, name: '神奇电梯楼', setup: ["U", "R", "U'", "R'"], steps: ["R", "U", "R'", "U'"] },
  { id: 3, name: '森林捉迷藏', setup: ["F'", "U'", "F", "U", "R", "U", "R'", "U'"], steps: ["U", "R", "U'", "R'", "U'", "F'", "U", "F"] },
  { id: 4, name: '金鱼跃龙门', setup: ["R", "U2", "R'", "U'", "R", "U'", "R'"], steps: ["R", "U", "R'", "U", "R", "U2", "R'"] },
  { id: 5, name: '猫头鹰守卫战', setup: ['F2', "U'", "R'", 'L', 'F2', 'R', "L'", "U'", 'F2'], steps: ['F2', 'U', 'L', "R'", 'F2', "L'", 'R', 'U', 'F2'] }
];

function runStageMathAudit() {
  console.log('--- 测试每个关卡的扰乱与复原过程 ---');
  const cube = new SimCube();
  LEVELS.forEach(lvl => {
    cube.reset();
    cube.moves(lvl.setup);
    const before = cube.diagnose();
    cube.moves(lvl.steps);
    const after = cube.diagnose();
    console.log(`第 ${lvl.id} 关【${lvl.name}】:`);
    console.log(`  - 摆局后状态: cross=${before.crossDone}, L1=${before.firstLayerDone}, F2L=${before.f2lDone}, yellow=${before.yellowCount}/9, allSolved=${before.allSolved}`);
    console.log(`  - 走完后状态: cross=${after.crossDone}, L1=${after.firstLayerDone}, F2L=${after.f2lDone}, yellow=${after.yellowCount}/9, allSolved=${after.allSolved}`);
  });
}

if (require.main === module) {
  runStageMathAudit();
}

module.exports = {
  LEVELS,
  SimCube,
  runStageMathAudit
};
