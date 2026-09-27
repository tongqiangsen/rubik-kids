const fs = require('fs');
const vm = require('vm');

console.log('=== 3D 奇幻大冒险 5 大关卡全链路审核与仿真测试 ===\n');

const html = fs.readFileSync('index.html', 'utf8');
const scriptMatch = html.match(/<script>([\s\S]*?)<\/script>[\s\S]*?<\/body>/);
if (!scriptMatch) {
  console.error('Failed to extract main script');
  process.exit(1);
}

// Minimal mock
global.window = {
  innerWidth: 1024,
  innerHeight: 768,
  addEventListener: () => {},
  matchMedia: () => ({ matches: false }),
  navigator: { standalone: false, userAgent: 'test' }
};
global.document = {
  getElementById: (id) => ({
    id,
    classList: { add: () => {}, remove: () => {}, contains: () => false },
    addEventListener: () => {},
    style: {},
    appendChild: () => {},
    querySelectorAll: () => [],
    querySelector: () => null,
    getContext: () => ({
      clearRect: () => {},
      fillRect: () => {},
      save: () => {},
      restore: () => {},
      translate: () => {},
      rotate: () => {}
    })
  }),
  createElement: (tag) => ({
    tagName: tag,
    classList: { add: () => {}, remove: () => {}, contains: () => false },
    style: {},
    addEventListener: () => {},
    appendChild: () => {},
    innerHTML: '',
    textContent: ''
  }),
  querySelectorAll: () => []
};
global.localStorage = { getItem: () => null, setItem: () => {} };

vm.runInThisContext(scriptMatch[1]);

// 1. Audit button coverage for each stage
console.log('--- 1. 关卡按键覆盖率 (Button Coverage Audit) ---');
let hasCoverageError = false;

ADVENTURE_LEVELS.forEach((lvl) => {
  const buttonMoves = new Set(lvl.buttons.map(b => b.move));
  const missingMoves = new Set();
  lvl.steps.forEach((st, idx) => {
    if (!buttonMoves.has(st.move)) {
      missingMoves.add(st.move);
    }
  });

  if (missingMoves.size > 0) {
    console.error(`❌ [第 ${lvl.id} 关: ${lvl.title}] 存在缺失按键: ${Array.from(missingMoves).join(', ')}`);
    console.error(`   现有按键: ${Array.from(buttonMoves).join(', ')}`);
    hasCoverageError = true;
  } else {
    console.log(`✅ [第 ${lvl.id} 关: ${lvl.title}] 按键完全覆盖所有步骤动作 (${lvl.steps.length} 步全部可点)`);
  }
});

// 2. Audit mathematical reversibility / solving logic
console.log('\n--- 2. 关卡复原数学几何校验 (Rubik Cube State Audit) ---');
ADVENTURE_LEVELS.forEach((lvl) => {
  rubik.init();
  // Apply setup
  rubik.instantMoves(lvl.setup);
  const diagBefore = diagnoseCubeState(rubik.faces);

  // Apply all steps
  lvl.steps.forEach(st => {
    rubik.instantMoves([st.move]);
  });
  const diagAfter = diagnoseCubeState(rubik.faces);

  console.log(`[第 ${lvl.id} 关: ${lvl.title}]`);
  console.log(`  - 扰乱前状态: crossDone=${diagBefore.crossDone}, firstLayerDone=${diagBefore.firstLayerDone}, f2lDone=${diagBefore.f2lDone}, yellowFaceDone=${diagBefore.yellowFaceDone}, allSolved=${diagBefore.allSolved}`);
  console.log(`  - 关卡通关后: crossDone=${diagAfter.crossDone}, firstLayerDone=${diagAfter.firstLayerDone}, f2lDone=${diagAfter.f2lDone}, yellowFaceDone=${diagAfter.yellowFaceDone}, allSolved=${diagAfter.allSolved}`);
});
