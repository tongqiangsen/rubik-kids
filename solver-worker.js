// Runs only in a Web Worker so table initialization and search do not block the page.
importScripts('vendor/cubejs/cube.js', 'vendor/cubejs/solve.js', 'cross-solver.js', 'layer1-solver.js', 'middle-solver.js', 'yellow-cross-solver.js', 'yellow-face-solver.js', 'top-corners-solver.js', 'top-edges-solver.js');
let ready = false;
self.onmessage = ({data}) => {
  const {id, facelets, mode} = data;
  try {
    if (mode === 'cross') {
      const algorithm = CrossSolver.solve(facelets).join(' ');
      const cube = Cube.fromString(facelets).move(algorithm);
      if (![4,5,6,7].every(index => cube.ep[index] === index && cube.eo[index] === 0)) throw new Error('Cross result failed verification');
      self.postMessage({id, algorithm});
    } else if (mode === 'layer1') {
      const groups = Layer1Solver.solveGroups(facelets);
      const algorithm = groups.flat().join(' ');
      const cube = Cube.fromString(facelets).move(algorithm);
      if (![4,5,6,7].every(index => cube.ep[index] === index && cube.eo[index] === 0 && cube.cp[index] === index && cube.co[index] === 0))
        throw new Error('First-layer result failed verification');
      self.postMessage({id, algorithm, groups});
    } else if (mode === 'middle') {
      const groups = MiddleSolver.solveGroups(facelets);
      const algorithm = groups.flat().join(' ');
      const cube = Cube.fromString(facelets).move(algorithm);
      if (![4,5,6,7,8,9,10,11].every(index => cube.ep[index] === index && cube.eo[index] === 0) ||
          ![4,5,6,7].every(index => cube.cp[index] === index && cube.co[index] === 0))
        throw new Error('Middle-layer result failed verification');
      self.postMessage({id, algorithm, groups});
    } else if (mode === 'yellowCross') {
      const groups = YellowCrossSolver.solveGroups(facelets);
      const algorithm = groups.flat().join(' ');
      const cube = Cube.fromString(facelets).move(algorithm);
      if (![4,5,6,7,8,9,10,11].every(index => cube.ep[index] === index && cube.eo[index] === 0) ||
          ![4,5,6,7].every(index => cube.cp[index] === index && cube.co[index] === 0) ||
          !cube.eo.slice(0,4).every(orientation => orientation === 0))
        throw new Error('Yellow-cross result failed verification');
      self.postMessage({id, algorithm, groups});
    } else if (mode === 'yellowFace') {
      const groups = YellowFaceSolver.solveGroups(facelets);
      const algorithm = groups.flat().join(' ');
      const cube = Cube.fromString(facelets).move(algorithm);
      if (![4,5,6,7,8,9,10,11].every(index => cube.ep[index] === index && cube.eo[index] === 0) ||
          ![4,5,6,7].every(index => cube.cp[index] === index && cube.co[index] === 0) ||
          !cube.eo.slice(0,4).every(orientation => orientation === 0) ||
          !cube.co.slice(0,4).every(orientation => orientation === 0))
        throw new Error('Yellow-face result failed verification');
      self.postMessage({id, algorithm, groups});
    } else if (mode === 'topCorners') {
      const groups = TopCornersSolver.solveGroups(facelets);
      const algorithm = groups.flat().join(' ');
      const cube = Cube.fromString(facelets).move(algorithm);
      if (![4,5,6,7,8,9,10,11].every(index => cube.ep[index] === index && cube.eo[index] === 0) ||
          ![4,5,6,7].every(index => cube.cp[index] === index && cube.co[index] === 0) ||
          !cube.eo.slice(0,4).every(orientation => orientation === 0) ||
          !cube.co.slice(0,4).every(orientation => orientation === 0) ||
          !cube.cp.slice(0,4).every((piece,index) => piece === index))
        throw new Error('Top-corners result failed verification');
      self.postMessage({id, algorithm, groups});
    } else if (mode === 'topEdges') {
      const groups = TopEdgesSolver.solveGroups(facelets);
      const algorithm = groups.flat().join(' ');
      if (!Cube.fromString(facelets).move(algorithm).isSolved()) throw new Error('Top-edges result failed verification');
      self.postMessage({id, algorithm, groups});
    } else if (mode === 'full') {
      if (!ready) {
        Cube.initSolver();
        ready = true;
      }
      const cube = Cube.fromString(facelets);
      const algorithm = cube.solve();
      if (!Cube.fromString(facelets).move(algorithm).isSolved()) throw new Error('Solver result failed verification');
      self.postMessage({id, algorithm});
    } else {
      throw new Error('Unknown solve mode');
    }
  } catch (error) {
    self.postMessage({id, error:String(error.message || error)});
  }
};
