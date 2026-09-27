const fs = require('fs');
const path = require('path');

const dir = __dirname;
const htmlPath = path.join(dir, 'index.html');
const cubeStatePath = path.join(dir, 'cube-state.js');
const validatorPath = path.join(dir, 'validate-facelets.js');
const nearSolverPath = path.join(dir, 'near-solver.js');
const solverBridgePath = path.join(dir, 'solver-bridge.js');
const solverWorkerPath = path.join(dir, 'solver-worker.js');
const crossSolverPath = path.join(dir, 'cross-solver.js');
const layer1SolverPath = path.join(dir, 'layer1-solver.js');
const middleSolverPath = path.join(dir, 'middle-solver.js');
const yellowCrossSolverPath = path.join(dir, 'yellow-cross-solver.js');
const yellowFaceSolverPath = path.join(dir, 'yellow-face-solver.js');
const topCornersSolverPath = path.join(dir, 'top-corners-solver.js');
const topEdgesSolverPath = path.join(dir, 'top-edges-solver.js');
const vendorCubePath = path.join(dir, 'vendor/cubejs/cube.js');
const vendorSolvePath = path.join(dir, 'vendor/cubejs/solve.js');
const manifestPath = path.join(dir, 'manifest.json');
const swPath = path.join(dir, 'sw.js');
const svgPath = path.join(dir, 'icon.svg');
const icon192Path = path.join(dir, 'icon-192.png');
const icon512Path = path.join(dir, 'icon-512.png');
const workerPath = path.join(dir, 'worker.js');

const html = fs.readFileSync(htmlPath, 'utf8');
const cubeState = fs.readFileSync(cubeStatePath, 'utf8');
const validator = fs.readFileSync(validatorPath, 'utf8');
const nearSolver = fs.readFileSync(nearSolverPath, 'utf8');
const solverBridge = fs.readFileSync(solverBridgePath, 'utf8');
const solverWorker = fs.readFileSync(solverWorkerPath, 'utf8');
const crossSolver = fs.readFileSync(crossSolverPath, 'utf8');
const layer1Solver = fs.readFileSync(layer1SolverPath, 'utf8');
const middleSolver = fs.readFileSync(middleSolverPath, 'utf8');
const yellowCrossSolver = fs.readFileSync(yellowCrossSolverPath, 'utf8');
const yellowFaceSolver = fs.readFileSync(yellowFaceSolverPath, 'utf8');
const topCornersSolver = fs.readFileSync(topCornersSolverPath, 'utf8');
const topEdgesSolver = fs.readFileSync(topEdgesSolverPath, 'utf8');
const vendorCube = fs.readFileSync(vendorCubePath, 'utf8');
const vendorSolve = fs.readFileSync(vendorSolvePath, 'utf8');
const manifest = fs.readFileSync(manifestPath, 'utf8');
const sw = fs.readFileSync(swPath, 'utf8');
const svg = fs.readFileSync(svgPath, 'utf8');
const icon192Base64 = fs.readFileSync(icon192Path).toString('base64');
const icon512Base64 = fs.readFileSync(icon512Path).toString('base64');

function escapeTemplate(str) {
  return str.replace(/[ \t]+$/gm, '').replace(/\\/g, '\\\\').replace(/`/g, '\\`').replace(/\${/g, '\\${');
}

const workerCode = `// Generated Cloudflare Worker for Rubik Kids Adventure PWA
const HTML_CONTENT = \`${escapeTemplate(html)}\`;
const CUBE_STATE_CONTENT = \`${escapeTemplate(cubeState)}\`;
const VALIDATOR_CONTENT = \`${escapeTemplate(validator)}\`;
const NEAR_SOLVER_CONTENT = \`${escapeTemplate(nearSolver)}\`;
const SOLVER_BRIDGE_CONTENT = \`${escapeTemplate(solverBridge)}\`;
const SOLVER_WORKER_CONTENT = \`${escapeTemplate(solverWorker)}\`;
const CROSS_SOLVER_CONTENT = \`${escapeTemplate(crossSolver)}\`;
const LAYER1_SOLVER_CONTENT = \`${escapeTemplate(layer1Solver)}\`;
const MIDDLE_SOLVER_CONTENT = \`${escapeTemplate(middleSolver)}\`;
const YELLOW_CROSS_SOLVER_CONTENT = \`${escapeTemplate(yellowCrossSolver)}\`;
const YELLOW_FACE_SOLVER_CONTENT = \`${escapeTemplate(yellowFaceSolver)}\`;
const TOP_CORNERS_SOLVER_CONTENT = \`${escapeTemplate(topCornersSolver)}\`;
const TOP_EDGES_SOLVER_CONTENT = \`${escapeTemplate(topEdgesSolver)}\`;
const VENDOR_CUBE_CONTENT = \`${escapeTemplate(vendorCube)}\`;
const VENDOR_SOLVE_CONTENT = \`${escapeTemplate(vendorSolve)}\`;
const MANIFEST_CONTENT = \`${escapeTemplate(manifest)}\`;
const SW_CONTENT = \`${escapeTemplate(sw)}\`;
const SVG_ICON = \`${escapeTemplate(svg)}\`;
const PNG_192_B64 = '${icon192Base64}';
const PNG_512_B64 = '${icon512Base64}';

function base64ToUint8(b64) {
  const bin = atob(b64);
  const len = bin.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = bin.charCodeAt(i);
  }
  return bytes;
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;

    if (path === '/cube-state.js') {
      return new Response(CUBE_STATE_CONTENT, {
        headers: {
          'content-type': 'application/javascript;charset=UTF-8',
          'cache-control': 'public, max-age=0, must-revalidate'
        }
      });
    }

    if (path === '/validate-facelets.js') {
      return new Response(VALIDATOR_CONTENT, {
        headers: {
          'content-type': 'application/javascript;charset=UTF-8',
          'cache-control': 'public, max-age=0, must-revalidate'
        }
      });
    }

    if (path === '/near-solver.js') {
      return new Response(NEAR_SOLVER_CONTENT, {
        headers: {
          'content-type': 'application/javascript;charset=UTF-8',
          'cache-control': 'public, max-age=0, must-revalidate'
        }
      });
    }

    const solverAssets = {
      '/solver-bridge.js': SOLVER_BRIDGE_CONTENT,
      '/solver-worker.js': SOLVER_WORKER_CONTENT,
      '/cross-solver.js': CROSS_SOLVER_CONTENT,
      '/layer1-solver.js': LAYER1_SOLVER_CONTENT,
      '/middle-solver.js': MIDDLE_SOLVER_CONTENT,
      '/yellow-cross-solver.js': YELLOW_CROSS_SOLVER_CONTENT,
      '/yellow-face-solver.js': YELLOW_FACE_SOLVER_CONTENT,
      '/top-corners-solver.js': TOP_CORNERS_SOLVER_CONTENT,
      '/top-edges-solver.js': TOP_EDGES_SOLVER_CONTENT,
      '/vendor/cubejs/cube.js': VENDOR_CUBE_CONTENT,
      '/vendor/cubejs/solve.js': VENDOR_SOLVE_CONTENT
    };
    if (Object.prototype.hasOwnProperty.call(solverAssets, path)) {
      return new Response(solverAssets[path], {
        headers: {
          'content-type': 'application/javascript;charset=UTF-8',
          'cache-control': 'public, max-age=0, must-revalidate'
        }
      });
    }

    if (path === '/manifest.json') {
      return new Response(MANIFEST_CONTENT, {
        headers: {
          'content-type': 'application/manifest+json;charset=UTF-8',
          'cache-control': 'public, max-age=3600'
        }
      });
    }

    if (path === '/sw.js') {
      return new Response(SW_CONTENT, {
        headers: {
          'content-type': 'application/javascript;charset=UTF-8',
          'cache-control': 'public, max-age=0, must-revalidate'
        }
      });
    }

    if (path === '/icon.svg') {
      return new Response(SVG_ICON, {
        headers: {
          'content-type': 'image/svg+xml;charset=UTF-8',
          'cache-control': 'public, max-age=86400'
        }
      });
    }

    if (path === '/icon-192.png' || path === '/apple-touch-icon.png' || path === '/apple-touch-icon-precomposed.png') {
      return new Response(base64ToUint8(PNG_192_B64), {
        headers: {
          'content-type': 'image/png',
          'cache-control': 'public, max-age=86400'
        }
      });
    }

    if (path === '/icon-512.png') {
      return new Response(base64ToUint8(PNG_512_B64), {
        headers: {
          'content-type': 'image/png',
          'cache-control': 'public, max-age=86400'
        }
      });
    }

    // Default: Return the HTML page
    return new Response(HTML_CONTENT, {
      headers: {
        'content-type': 'text/html;charset=UTF-8',
        'cache-control': 'public, max-age=0, must-revalidate'
      }
    });
  }
};
`;

fs.writeFileSync(workerPath, workerCode, 'utf8');
console.log('Successfully built worker.js with PWA support! File size:', Buffer.byteLength(workerCode, 'utf8'), 'bytes');
