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
    assert(text.includes('rubik-kids-v2'), 'sw.js must contain cache name');
    console.log('✓ GET /sw.js -> OK (Service Worker script)');
  }

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

  console.log('=== ALL 7 WORKER PWA CHECKS PASSED ===');
}

testWorker().catch(err => {
  console.error('Test failed:', err);
  process.exit(1);
});
