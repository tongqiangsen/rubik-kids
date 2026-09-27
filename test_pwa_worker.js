const path = require('path');
const assert = require('assert');
const fs = require('fs');
const os = require('os');

async function testWorker() {
  console.log('--- Testing Cloudflare Worker PWA Endpoints ---');
  // Load the Cloudflare ES module worker from a temporary .mjs file while
  // keeping the project test files in CommonJS.
  const tempWorkerPath = path.join(os.tmpdir(), `rubik-kids-worker-${Date.now()}.mjs`);
  fs.copyFileSync(path.join(__dirname, 'worker.js'), tempWorkerPath);
  const workerModule = await import(`file://${tempWorkerPath}`);
  fs.unlinkSync(tempWorkerPath);
  const worker = workerModule.default;

  // 1. Test GET /
  {
    const req = new Request('https://cube.aigoz.top/');
    const res = await worker.fetch(req);
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.headers.get('content-type'), 'text/html;charset=UTF-8');
    const text = await res.text();
    assert(text.includes('rel="manifest"'), 'HTML must include rel="manifest"');
    assert(text.includes('rel="apple-touch-icon"'), 'HTML must include apple-touch-icon');
    assert(text.includes('viewport-fit=cover'), 'HTML must include viewport-fit=cover');
    assert(text.includes('modal-pwa-install'), 'HTML must include modal-pwa-install');
    assert(text.includes('src="cube-state.js"'), 'HTML must load the shared cube state');
    assert(text.includes('src="validate-facelets.js"'), 'HTML must load facelet validator');
    assert(text.includes('src="near-solver.js"'), 'HTML must load near solver');
    assert(text.includes('src="solver-bridge.js"'), 'HTML must load solver bridge');
    console.log('✓ GET / -> OK (HTML with PWA tags)');
  }

  // 2. Test GET /manifest.json
  {
    const req = new Request('https://cube.aigoz.top/manifest.json');
    const res = await worker.fetch(req);
    assert.strictEqual(res.status, 200);
    assert(res.headers.get('content-type').includes('application/manifest+json'));
    const manifest = await res.json();
    assert.strictEqual(manifest.name, '魔方小勇士：3D 奇幻大冒险');
    assert.strictEqual(manifest.display, 'standalone');
    assert(manifest.icons.length >= 2);
    console.log('✓ GET /manifest.json -> OK (valid JSON manifest, standalone display)');
  }

  // 3. Test GET /sw.js
  {
    const req = new Request('https://cube.aigoz.top/sw.js');
    const res = await worker.fetch(req);
    assert.strictEqual(res.status, 200);
    assert(res.headers.get('content-type').includes('application/javascript'));
    const text = await res.text();
    assert(text.includes('rubik-kids-v12'), 'sw.js must contain cache name');
    assert(text.includes('cube-state.js'), 'sw.js must cache the cube state script');
    assert(text.includes('validate-facelets.js'), 'sw.js must cache facelet validator');
    assert(text.includes('near-solver.js'), 'sw.js must cache near solver');
    assert(text.includes('solver-worker.js'), 'sw.js must cache solver worker');
    assert(text.includes('cross-solver.js'), 'sw.js must cache cross solver');
    assert(text.includes('layer1-solver.js'), 'sw.js must cache first-layer solver');
    assert(text.includes('middle-solver.js'), 'sw.js must cache middle-layer solver');
    assert(text.includes('yellow-cross-solver.js'), 'sw.js must cache yellow-cross solver');
    assert(text.includes('yellow-face-solver.js'), 'sw.js must cache yellow-face solver');
    assert(text.includes('top-corners-solver.js'), 'sw.js must cache top corner solver');
    assert(text.includes('top-edges-solver.js'), 'sw.js must cache top edge solver');
    assert(text.includes('vendor/cubejs/solve.js'), 'sw.js must cache offline solver');
    console.log('✓ GET /sw.js -> OK (Service Worker script)');
  }

  {
    const res = await worker.fetch(new Request('https://cube.aigoz.top/cube-state.js'));
    assert.strictEqual(res.status, 200);
    assert(res.headers.get('content-type').includes('application/javascript'));
    assert((await res.text()).includes('const CubeState ='));
    console.log('✓ GET /cube-state.js -> OK (shared cube state module)');
  }

  {
    const res = await worker.fetch(new Request('https://cube.aigoz.top/validate-facelets.js'));
    assert.strictEqual(res.status, 200);
    assert((await res.text()).includes('const FaceletValidator ='));
    console.log('✓ GET /validate-facelets.js -> OK (facelet validator)');
  }

  {
    const res = await worker.fetch(new Request('https://cube.aigoz.top/near-solver.js'));
    assert.strictEqual(res.status, 200);
    assert((await res.text()).includes('const NearSolver ='));
    console.log('✓ GET /near-solver.js -> OK (bounded solver)');
  }

  for (const path of ['/solver-bridge.js','/solver-worker.js','/cross-solver.js','/layer1-solver.js','/middle-solver.js','/yellow-cross-solver.js','/yellow-face-solver.js','/top-corners-solver.js','/top-edges-solver.js','/vendor/cubejs/cube.js','/vendor/cubejs/solve.js']) {
    const res = await worker.fetch(new Request(`https://cube.aigoz.top${path}`));
    assert.strictEqual(res.status,200,path);
    assert((await res.text()).length > 100,path);
  }
  console.log('✓ GET solver worker and dependencies -> OK (offline assets)');

  // 4. Test GET /icon.svg
  {
    const req = new Request('https://cube.aigoz.top/icon.svg');
    const res = await worker.fetch(req);
    assert.strictEqual(res.status, 200);
    assert(res.headers.get('content-type').includes('image/svg+xml'));
    const svg = await res.text();
    assert(svg.includes('<svg'), 'icon.svg must contain SVG tag');
    console.log('✓ GET /icon.svg -> OK (SVG image)');
  }

  // 5. Test GET /icon-192.png
  {
    const req = new Request('https://cube.aigoz.top/icon-192.png');
    const res = await worker.fetch(req);
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.headers.get('content-type'), 'image/png');
    const ab = await res.arrayBuffer();
    const buf = Buffer.from(ab);
    assert.strictEqual(buf[0], 0x89);
    assert.strictEqual(buf[1], 0x50); // P
    assert.strictEqual(buf[2], 0x4E); // N
    assert.strictEqual(buf[3], 0x47); // G
    console.log('✓ GET /icon-192.png -> OK (valid PNG binary, size:', buf.length, 'bytes)');
  }

  // 6. Test GET /icon-512.png
  {
    const req = new Request('https://cube.aigoz.top/icon-512.png');
    const res = await worker.fetch(req);
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.headers.get('content-type'), 'image/png');
    const ab = await res.arrayBuffer();
    const buf = Buffer.from(ab);
    assert.strictEqual(buf[0], 0x89);
    console.log('✓ GET /icon-512.png -> OK (valid PNG binary, size:', buf.length, 'bytes)');
  }

  // 7. Test GET /apple-touch-icon.png
  {
    const req = new Request('https://cube.aigoz.top/apple-touch-icon.png');
    const res = await worker.fetch(req);
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.headers.get('content-type'), 'image/png');
    const ab = await res.arrayBuffer();
    const buf = Buffer.from(ab);
    assert.strictEqual(buf[0], 0x89);
    console.log('✓ GET /apple-touch-icon.png -> OK (valid Apple touch icon)');
  }

  console.log('=== ALL 11 WORKER PWA CHECKS PASSED ===');
}

testWorker().catch(err => {
  console.error('Test failed:', err);
  process.exit(1);
});
