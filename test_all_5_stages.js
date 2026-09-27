const fs = require('fs');
const vm = require('vm');
const assert = require('assert');
global.CubeState = require('./cube-state');
global.FaceletValidator = require('./validate-facelets');
global.NearSolver = require('./near-solver');
global.SolverBridge = require('./solver-bridge');
const { SimCube } = require('./test_stage_math');

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
const tabs = Array.from({ length: 6 }, (_, index) => ({
  dataset: { level: index === 0 ? 'custom' : String(index) },
  classList: { add: () => {}, remove: () => {}, contains: () => index === 0 },
  addEventListener(event, handler) { this[event] = handler; },
  querySelector: () => ({ textContent: '' })
}));
const mockElements = {};
global.document = {
  getElementById: (id) => id === 'tab-custom-solve' ? tabs[0] : (mockElements[id] ||= {
    id,
    classList: { add: () => {}, remove: () => {}, contains: () => false },
    addEventListener(event, handler) { this[event] = handler; },
    style: {},
    children: [],
    appendChild(child) { this.children.push(child); },
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
    addEventListener(event, handler) { this[event] = handler; },
    appendChild: () => {},
    innerHTML: '',
    textContent: ''
  }),
  querySelectorAll: selector => selector === '.level-tab-btn[data-level]' ? tabs : []
};
global.localStorage = { getItem: () => null, setItem: () => {} };

vm.runInThisContext(scriptMatch[1]);
assert.strictEqual(adventureTabs.length, 5, '实物预览标签不能计入五个关卡');
tabs[5].click();
assert.strictEqual(currentLevelIdx, 4, '第 5 关标签应打开第 5 关');
tabs[1].click();
assert.strictEqual(currentLevelIdx, 0, '第 1 关标签应打开第 1 关');

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
ADVENTURE_LEVELS.forEach((lvl, index) => {
  const sim = new SimCube();
  const shared = new SimCube();
  const snapshot = cube => JSON.stringify(cube.cubies.map(c => ({ pos: c.pos, mat: c.mat })));
  const step = move => {
    sim.move(move);
    CubeState.applyMove(shared.cubies, move);
    assert.strictEqual(snapshot(shared), snapshot(sim), `第 ${lvl.id} 关 ${move} 后页面核心与仿真状态不同`);
  };
  // Apply setup
  lvl.setup.forEach(step);
  const diagBefore = sim.diagnose();
  const pageBefore = diagnoseAdventureCube(sim.cubies);

  // Apply all steps
  lvl.steps.forEach(st => step(st.move));
  const diagAfter = sim.diagnose();
  const pageAfter = diagnoseAdventureCube(sim.cubies);
  const goal = ['crossDone', 'firstLayerDone', 'f2lDone', 'yellowFaceDone', 'allSolved'][index];
  assert.strictEqual(pageBefore[goal], false, `第 ${lvl.id} 关初始状态已经达标`);
  if (index > 0) {
    const previousGoal = ['crossDone', 'firstLayerDone', 'f2lDone', 'yellowFaceDone'][index - 1];
    assert.strictEqual(pageBefore[previousGoal], true, `第 ${lvl.id} 关示范起点未完成上一阶段`);
  }
  assert.strictEqual(pageAfter[goal], true, `第 ${lvl.id} 关动作结束后未达到 ${goal}`);
  for (const key of ['crossDone', 'firstLayerDone', 'f2lDone', 'yellowFaceDone', 'allSolved']) {
    assert.strictEqual(pageBefore[key], diagBefore[key], `第 ${lvl.id} 关初始状态 ${key} 判定不一致`);
    assert.strictEqual(pageAfter[key], diagAfter[key], `第 ${lvl.id} 关结束状态 ${key} 判定不一致`);
  }
  const lastMove = lvl.steps.at(-1).move;
  const completedState = JSON.stringify(sim.cubies.map(c => ({ pos: c.pos, mat: c.mat })));
  sim.move(CubeState.inverseMove(lastMove));
  sim.move(lastMove);
  assert.strictEqual(JSON.stringify(sim.cubies.map(c => ({ pos: c.pos, mat: c.mat }))), completedState, `第 ${lvl.id} 关撤回重做没有恢复原状态`);

  console.log(`[第 ${lvl.id} 关: ${lvl.title}]`);
  console.log(`  - 扰乱前状态: crossDone=${diagBefore.crossDone}, firstLayerDone=${diagBefore.firstLayerDone}, f2lDone=${diagBefore.f2lDone}, yellowFaceDone=${diagBefore.yellowFaceDone}, allSolved=${diagBefore.allSolved}`);
  console.log(`  - 关卡通关后: crossDone=${diagAfter.crossDone}, firstLayerDone=${diagAfter.firstLayerDone}, f2lDone=${diagAfter.f2lDone}, yellowFaceDone=${diagAfter.yellowFaceDone}, allSolved=${diagAfter.allSolved}`);
});

ADVENTURE_LEVELS.forEach((lvl, index) => {
  loadLevel(index);
  const goal = ['crossDone', 'firstLayerDone', 'f2lDone', 'yellowFaceDone', 'allSolved'][index];
  assert.strictEqual(diagnoseAdventureCube(rubik.cubies)[goal], false, `第 ${lvl.id} 关页面初始状态错误`);
  rubik.instantMoves(lvl.steps.map(step => step.move));
  assert.strictEqual(diagnoseAdventureCube(rubik.cubies)[goal], true, `第 ${lvl.id} 关页面模型未达标`);
});

const practiceGoals = ['crossDone', 'firstLayerDone', 'f2lDone', 'yellowFaceDone', 'allSolved'];
const nextGoals = ['firstLayerDone', 'f2lDone', 'yellowFaceDone', 'allSolved'];
practiceGoals.forEach((goal, index) => {
  loadLevel(index);
  switchPracticeCase();
  const practice = getLevelData();
  assert(practice.task.startsWith('练习 2'), `第 ${index + 1} 关未切换练习残局`);
  const availableButtons = new Set(practice.buttons.map(button => button.move));
  assert(practice.steps.every(step => availableButtons.has(step.move)), `第 ${index + 1} 关练习缺少动作按钮`);
  const cube = new SimCube();
  cube.moves(practice.setup);
  assert.strictEqual(cube.diagnose()[goal], false, `第 ${index + 1} 关练习起点已达标`);
  if (index > 0) assert.strictEqual(cube.diagnose()[practiceGoals[index - 1]], true, `第 ${index + 1} 关练习破坏了前一阶段`);
  assert.strictEqual(diagnoseAdventureCube(rubik.cubies)[goal], false, `第 ${index + 1} 关页面练习起点错误`);
  const moves = practice.steps.map(step => step.move);
  cube.moves(moves);
  rubik.instantMoves(moves);
  assert.strictEqual(cube.diagnose()[goal], true, `第 ${index + 1} 关练习没有完成目标`);
  if (nextGoals[index]) assert.strictEqual(cube.diagnose()[nextGoals[index]], false, `第 ${index + 1} 关练习意外完成下一阶段`);
  assert.strictEqual(diagnoseAdventureCube(rubik.cubies)[goal], true, `第 ${index + 1} 关页面练习未达标`);
  switchPracticeCase();
  assert.strictEqual(practiceIndex[index], 0);
});
loadLevel(0);
audio.muted = true;
let acceptedMoves = 0;
rubik.performMove = (move, done) => { acceptedMoves++; done(); return true; };
handleActionClick('R');
assert.strictEqual(acceptedMoves, 0, '故事模式误点不能转动魔方');
assert.strictEqual(currentStepIdx, 0, '故事模式误点不能推进步骤');
handleActionClick('U');
assert.strictEqual(acceptedMoves, 1, '当前动作应执行一次');
assert.strictEqual(currentStepIdx, 1, '当前动作应推进一步');

// 真实魔方带练：组末暂停后不能跳过核对，差异录入废弃旧计划。
currentLevelIdx = -1;
currentStepIdx = 0;
activeCustomPlan = {
  mode: 'full',
  steps: [
    { move: 'R', name: '右面顺时针', desc: '', checkpoint: true, checkpointLabel: '第一组已完成。' },
    { move: "R'", name: '右面逆时针', desc: '', checkpoint: true, checkpointLabel: '第二组已完成。' }
  ],
  buttons: []
};
renderCustomPlanUi();
handleActionClick('R');
assert.strictEqual(customAwaitingCheck, true);
handleActionClick("R'");
assert.strictEqual(currentStepIdx, 1, '暂停期间不能继续转动');
let checkpointButtons = mockElements['action-buttons-grid'].children.slice(-2);
checkpointButtons[0].click();
assert.strictEqual(customAwaitingCheck, false, '确认一致应解除暂停');
handleActionClick("R'");
assert.strictEqual(customAwaitingCheck, true, '结束时仍须核对实物');
checkpointButtons = mockElements['action-buttons-grid'].children.slice(-2);
checkpointButtons[1].click();
assert.strictEqual(activeCustomPlan.steps.length, 0, '不一致时须废弃旧计划');
assert.strictEqual(customAwaitingCheck, false);
assert.strictEqual(FaceletValidator.validate(paintedState).valid, true, '修正底稿应为有效的当前模型六面');
