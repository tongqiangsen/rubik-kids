// Standard 3x3 facelet ordering, expressed in the site's face-grid coordinates.
const FaceletValidator = (() => {
  const corners = [
    ['U8','R0','F2'], ['U6','F0','L2'], ['U0','L0','B2'], ['U2','B0','R2'],
    ['D2','F8','R6'], ['D0','L8','F6'], ['D6','B8','L6'], ['D8','R8','B6']
  ];
  const edges = [
    ['U5','R1'], ['U7','F1'], ['U3','L1'], ['U1','B1'],
    ['D5','R7'], ['D1','F7'], ['D3','L7'], ['D7','B7'],
    ['F5','R3'], ['F3','L5'], ['B5','L3'], ['B3','R5']
  ];
  const centers = { U:'Y', D:'W', F:'R', B:'O', L:'B', R:'G' };
  const expected = slots => slots.map(slot => slot.map(key => centers[key[0]]));
  const cornerColors = expected(corners);
  const edgeColors = expected(edges);
  const parity = perm => perm.reduce((count, value, i) =>
    count + perm.slice(i + 1).filter(other => value > other).length, 0) % 2;

  function validate(facelets) {
    for (const [face, color] of Object.entries(centers)) {
      if (facelets[`${face}4`] !== color) return { valid:false, reason:`${face} 面中心颜色应为 ${color}` };
    }
    const counts = Object.fromEntries(Object.values(centers).map(c => [c,0]));
    for (const face of Object.keys(centers)) for (let i = 0; i < 9; i++) {
      const color = facelets[`${face}${i}`];
      if (!(color in counts)) return { valid:false, reason:'仍有未填写或未知颜色的格子' };
      counts[color]++;
    }
    if (Object.values(counts).some(n => n !== 9)) return { valid:false, reason:'每种颜色都需要正好 9 格' };

    const cp = [], co = [], ep = [], eo = [];
    for (const slot of corners) {
      const colors = slot.map(key => facelets[key]);
      const orientation = colors.findIndex(c => c === 'Y' || c === 'W');
      const piece = cornerColors.findIndex(c => c[1] === colors[(orientation + 1) % 3] && c[2] === colors[(orientation + 2) % 3]);
      if (orientation < 0 || piece < 0) return { valid:false, reason:'角块颜色组合不可能，请检查相邻三面' };
      cp.push(piece); co.push(orientation);
    }
    if (new Set(cp).size !== 8) return { valid:false, reason:'出现重复或缺失的角块' };
    if (co.reduce((a,b) => a+b, 0) % 3) return { valid:false, reason:'角块朝向不可能：请检查顶角的三张贴纸' };

    for (const slot of edges) {
      const colors = slot.map(key => facelets[key]);
      const piece = edgeColors.findIndex(c => c[0] === colors[0] && c[1] === colors[1]);
      const flipped = piece < 0 ? edgeColors.findIndex(c => c[0] === colors[1] && c[1] === colors[0]) : -1;
      if (piece < 0 && flipped < 0) return { valid:false, reason:'棱块颜色组合不可能，请检查相邻两面' };
      ep.push(piece < 0 ? flipped : piece); eo.push(piece < 0 ? 1 : 0);
    }
    if (new Set(ep).size !== 12) return { valid:false, reason:'出现重复或缺失的棱块' };
    if (eo.reduce((a,b) => a+b, 0) % 2) return { valid:false, reason:'棱块朝向不可能：有单独翻转的棱块' };
    if (parity(cp) !== parity(ep)) return { valid:false, reason:'角块与棱块位置不匹配，可能有两块被互换' };
    return { valid:true, reason:'颜色、块组合和魔方状态均通过检查' };
  }
  return { validate };
})();
if (typeof module !== 'undefined' && module.exports) module.exports = FaceletValidator;
