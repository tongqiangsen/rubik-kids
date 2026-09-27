const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const dir = __dirname;

// 1. Generate icon.svg
const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#1e1b4b"/>
      <stop offset="50%" stop-color="#0f172a"/>
      <stop offset="100%" stop-color="#172554"/>
    </linearGradient>
    <linearGradient id="borderGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#38bdf8" stop-opacity="0.9"/>
      <stop offset="100%" stop-color="#a855f7" stop-opacity="0.6"/>
    </linearGradient>
    <filter id="dropShadow" x="-10%" y="-10%" width="120%" height="130%">
      <feDropShadow dx="0" dy="16" stdDeviation="16" flood-color="#000000" flood-opacity="0.6"/>
    </filter>
  </defs>

  <!-- App Icon Squircle Background -->
  <rect x="16" y="16" width="480" height="480" rx="108" fill="url(#bgGrad)" stroke="url(#borderGrad)" stroke-width="6" filter="url(#dropShadow)"/>

  <!-- Star sparkles -->
  <polygon points="110,95 113,107 125,110 113,113 110,125 107,113 95,110 107,107" fill="#facc15" opacity="0.9"/>
  <polygon points="400,130 402,138 410,140 402,142 400,150 398,142 390,140 398,138" fill="#38bdf8" opacity="0.8"/>
  <polygon points="390,380 392,388 400,390 392,392 390,400 388,392 380,390 388,388" fill="#f472b6" opacity="0.7"/>

  <!-- 3D Isometric Cube Container -->
  <g transform="translate(256, 240)" filter="url(#dropShadow)">
    <!-- Top Face (Yellow dominant) -->
    <g>
      <polygon points="0,-120 40,-97 0,-74 -40,-97" fill="#facc15" stroke="#1e293b" stroke-width="4" stroke-linejoin="round"/>
      <polygon points="45,-94 85,-71 45,-48 5,-71" fill="#fde047" stroke="#1e293b" stroke-width="4" stroke-linejoin="round"/>
      <polygon points="90,-68 130,-45 90,-22 50,-45" fill="#facc15" stroke="#1e293b" stroke-width="4" stroke-linejoin="round"/>
      <polygon points="-45,-94 -5,-71 -45,-48 -85,-71" fill="#fef08a" stroke="#1e293b" stroke-width="4" stroke-linejoin="round"/>
      <polygon points="0,-68 40,-45 0,-22 -40,-45" fill="#facc15" stroke="#1e293b" stroke-width="4" stroke-linejoin="round"/>
      <polygon points="45,-42 85,-19 45,4 5,-19" fill="#fde047" stroke="#1e293b" stroke-width="4" stroke-linejoin="round"/>
      <polygon points="-90,-68 -50,-45 -90,-22 -130,-45" fill="#fde047" stroke="#1e293b" stroke-width="4" stroke-linejoin="round"/>
      <polygon points="-45,-42 -5,-19 -45,4 -85,-19" fill="#facc15" stroke="#1e293b" stroke-width="4" stroke-linejoin="round"/>
      <polygon points="0,-16 40,7 0,30 -40,7" fill="#fef08a" stroke="#1e293b" stroke-width="4" stroke-linejoin="round"/>
    </g>

    <!-- Left Face (Blue dominant) -->
    <g>
      <polygon points="-134,-41 -94,-18 -94,32 -134,9" fill="#3b82f6" stroke="#1e293b" stroke-width="4" stroke-linejoin="round"/>
      <polygon points="-134,14 -94,37 -94,87 -134,64" fill="#2563eb" stroke="#1e293b" stroke-width="4" stroke-linejoin="round"/>
      <polygon points="-134,69 -94,92 -94,142 -134,119" fill="#3b82f6" stroke="#1e293b" stroke-width="4" stroke-linejoin="round"/>
      <polygon points="-89,-15 -49,8 -49,58 -89,35" fill="#60a5fa" stroke="#1e293b" stroke-width="4" stroke-linejoin="round"/>
      <polygon points="-89,40 -49,63 -49,113 -89,90" fill="#3b82f6" stroke="#1e293b" stroke-width="4" stroke-linejoin="round"/>
      <polygon points="-89,95 -49,118 -49,168 -89,145" fill="#2563eb" stroke="#1e293b" stroke-width="4" stroke-linejoin="round"/>
      <polygon points="-44,11 -4,34 -4,84 -44,61" fill="#3b82f6" stroke="#1e293b" stroke-width="4" stroke-linejoin="round"/>
      <polygon points="-44,66 -4,89 -4,139 -44,116" fill="#1d4ed8" stroke="#1e293b" stroke-width="4" stroke-linejoin="round"/>
      <polygon points="-44,121 -4,144 -4,194 -44,171" fill="#60a5fa" stroke="#1e293b" stroke-width="4" stroke-linejoin="round"/>
    </g>

    <!-- Right Face (Red dominant) -->
    <g>
      <polygon points="4,34 44,11 44,61 4,84" fill="#ef4444" stroke="#1e293b" stroke-width="4" stroke-linejoin="round"/>
      <polygon points="4,89 44,66 44,116 4,139" fill="#dc2626" stroke="#1e293b" stroke-width="4" stroke-linejoin="round"/>
      <polygon points="4,144 44,121 44,171 4,194" fill="#f87171" stroke="#1e293b" stroke-width="4" stroke-linejoin="round"/>
      <polygon points="49,8 89,-15 89,35 49,58" fill="#f87171" stroke="#1e293b" stroke-width="4" stroke-linejoin="round"/>
      <polygon points="49,63 89,40 89,90 49,113" fill="#ef4444" stroke="#1e293b" stroke-width="4" stroke-linejoin="round"/>
      <polygon points="49,118 89,95 89,145 49,168" fill="#dc2626" stroke="#1e293b" stroke-width="4" stroke-linejoin="round"/>
      <polygon points="94,-18 134,-41 134,9 94,32" fill="#ef4444" stroke="#1e293b" stroke-width="4" stroke-linejoin="round"/>
      <polygon points="94,37 134,14 134,64 94,87" fill="#b91c1c" stroke="#1e293b" stroke-width="4" stroke-linejoin="round"/>
      <polygon points="94,92 134,69 134,119 94,142" fill="#f87171" stroke="#1e293b" stroke-width="4" stroke-linejoin="round"/>
    </g>
  </g>

  <!-- Mascot Fox Badge at bottom-right corner -->
  <g transform="translate(350, 350)" filter="url(#dropShadow)">
    <circle cx="50" cy="50" r="42" fill="#f97316" stroke="#ffffff" stroke-width="4"/>
    <polygon points="20,25 35,5 45,30" fill="#ea580c" stroke="#ffffff" stroke-width="2"/>
    <polygon points="80,25 65,5 55,30" fill="#ea580c" stroke="#ffffff" stroke-width="2"/>
    <polygon points="26,23 35,11 41,27" fill="#fed7aa"/>
    <polygon points="74,23 65,11 59,27" fill="#fed7aa"/>
    <path d="M 18,54 C 20,75 40,86 50,86 C 60,86 80,75 82,54 C 76,46 64,52 50,58 C 36,52 24,46 18,54 Z" fill="#ffffff"/>
    <ellipse cx="36" cy="46" rx="4" ry="5" fill="#1e293b"/>
    <circle cx="37.5" cy="44" r="1.5" fill="#ffffff"/>
    <ellipse cx="64" cy="46" rx="4" ry="5" fill="#1e293b"/>
    <circle cx="65.5" cy="44" r="1.5" fill="#ffffff"/>
    <polygon points="50,60 45,55 55,55" fill="#1e293b"/>
    <circle cx="27" cy="56" r="4" fill="#f43f5e" opacity="0.5"/>
    <circle cx="73" cy="56" r="4" fill="#f43f5e" opacity="0.5"/>
  </g>
</svg>`;

fs.writeFileSync(path.join(dir, 'icon.svg'), svgContent, 'utf8');
console.log('Saved icon.svg');

// 2. Pure Node PNG Generator
function createPng(width, height, pixelFn) {
  const rowBytes = 1 + width * 4;
  const raw = Buffer.alloc(height * rowBytes);
  for (let y = 0; y < height; y++) {
    raw[y * rowBytes] = 0; // Filter: none
    for (let x = 0; x < width; x++) {
      const [r, g, b, a] = pixelFn(x, y, width, height);
      const idx = y * rowBytes + 1 + x * 4;
      raw[idx] = r;
      raw[idx + 1] = g;
      raw[idx + 2] = b;
      raw[idx + 3] = a;
    }
  }
  const idatData = zlib.deflateSync(raw, { level: 9 });
  
  function crc32(buf) {
    let crc = 0xffffffff;
    for (let i = 0; i < buf.length; i++) {
      crc ^= buf[i];
      for (let j = 0; j < 8; j++) {
        crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0);
      }
    }
    return (crc ^ 0xffffffff) >>> 0;
  }
  
  function makeChunk(type, data) {
    const len = Buffer.alloc(4);
    len.writeUInt32BE(data.length, 0);
    const typeBuf = Buffer.from(type, 'ascii');
    const crcBuf = Buffer.alloc(4);
    const toCrc = Buffer.concat([typeBuf, data]);
    crcBuf.writeUInt32BE(crc32(toCrc), 0);
    return Buffer.concat([len, typeBuf, data, crcBuf]);
  }
  
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // 8-bit depth
  ihdr[9] = 6; // RGBA
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;
  
  return Buffer.concat([
    sig,
    makeChunk('IHDR', ihdr),
    makeChunk('IDAT', idatData),
    makeChunk('IEND', Buffer.alloc(0))
  ]);
}

// Check point in polygon
function pointInPoly(pt, vs) {
  let inside = false;
  for (let i = 0, j = vs.length - 1; i < vs.length; j = i++) {
    const xi = vs[i][0], yi = vs[i][1];
    const xj = vs[j][0], yj = vs[j][1];
    const intersect = ((yi > pt[1]) !== (yj > pt[1]))
        && (pt[0] < (xj - xi) * (pt[1] - yi) / (yj - yi) + xi);
    if (intersect) inside = !inside;
  }
  return inside;
}

// Hex color to [r,g,b,a]
function hexToRgba(hex, a = 255) {
  const c = parseInt(hex.replace('#', ''), 16);
  return [(c >> 16) & 255, (c >> 8) & 255, c & 255, a];
}

// Polygons in 512 coordinate space
const polygons = [
  // Top Face (Yellows)
  { poly: [[256,120],[296,143],[256,166],[216,143]], color: '#facc15' },
  { poly: [[301,146],[341,169],[301,192],[261,169]], color: '#fde047' },
  { poly: [[346,172],[386,195],[346,218],[306,195]], color: '#facc15' },
  { poly: [[211,146],[251,169],[211,192],[171,169]], color: '#fef08a' },
  { poly: [[256,172],[296,195],[256,218],[216,195]], color: '#facc15' },
  { poly: [[301,198],[341,221],[301,244],[261,221]], color: '#fde047' },
  { poly: [[166,172],[206,195],[166,218],[126,195]], color: '#fde047' },
  { poly: [[211,198],[251,221],[211,244],[171,221]], color: '#facc15' },
  { poly: [[256,224],[296,247],[256,270],[216,247]], color: '#fef08a' },

  // Left Face (Blues)
  { poly: [[122,199],[162,222],[162,272],[122,249]], color: '#3b82f6' },
  { poly: [[122,254],[162,277],[162,327],[122,304]], color: '#2563eb' },
  { poly: [[122,309],[162,332],[162,382],[122,359]], color: '#3b82f6' },
  { poly: [[167,225],[207,248],[207,298],[167,275]], color: '#60a5fa' },
  { poly: [[167,280],[207,303],[207,353],[167,330]], color: '#3b82f6' },
  { poly: [[167,335],[207,358],[207,408],[167,385]], color: '#2563eb' },
  { poly: [[212,251],[252,274],[252,324],[212,301]], color: '#3b82f6' },
  { poly: [[212,306],[252,329],[252,379],[212,356]], color: '#1d4ed8' },
  { poly: [[212,361],[252,384],[252,434],[212,411]], color: '#60a5fa' },

  // Right Face (Reds)
  { poly: [[260,274],[300,251],[300,301],[260,324]], color: '#ef4444' },
  { poly: [[260,329],[300,306],[300,356],[260,379]], color: '#dc2626' },
  { poly: [[260,384],[300,361],[300,411],[260,434]], color: '#f87171' },
  { poly: [[305,248],[345,225],[345,275],[305,298]], color: '#f87171' },
  { poly: [[305,303],[345,280],[345,330],[305,353]], color: '#ef4444' },
  { poly: [[305,358],[345,335],[345,385],[305,408]], color: '#dc2626' },
  { poly: [[350,222],[390,199],[390,249],[350,272]], color: '#ef4444' },
  { poly: [[350,277],[390,254],[390,304],[350,327]], color: '#b91c1c' },
  { poly: [[350,332],[390,309],[390,359],[350,382]], color: '#f87171' }
];

function renderPixel(x, y, w, h) {
  // Normalize to 512x512 space
  const sx = (x / w) * 512;
  const sy = (y / h) * 512;

  // Squircle background test (rounded corner r=96)
  const pad = 16;
  const r = 96;
  const inBox = (sx >= pad && sx <= 512 - pad && sy >= pad && sy <= 512 - pad);
  let insideSquircle = false;
  if (inBox) {
    const qx = Math.max(pad + r - sx, 0, sx - (512 - pad - r));
    const qy = Math.max(pad + r - sy, 0, sy - (512 - pad - r));
    insideSquircle = (qx * qx + qy * qy <= r * r);
  }

  if (!insideSquircle) {
    return [0, 0, 0, 0]; // Transparent outside
  }

  // Border glow
  const dEdge = Math.min(sx - pad, 512 - pad - sx, sy - pad, 512 - pad - sy);
  if (dEdge < 6) {
    return [56, 189, 248, 240]; // Light cyan border
  }

  // Check polygons
  const pt = [sx, sy];
  for (let i = 0; i < polygons.length; i++) {
    if (pointInPoly(pt, polygons[i].poly)) {
      return hexToRgba(polygons[i].color);
    }
  }

  // Cute Fox badge circle at bottom right
  const foxDist = Math.hypot(sx - 400, sy - 400);
  if (foxDist <= 46) {
    if (foxDist >= 42) return [255, 255, 255, 255]; // white border
    if (foxDist <= 42) return [249, 115, 22, 255]; // Orange fox face
  }

  // Background deep gradient (#1e1b4b -> #0f172a)
  const gradT = (sx + sy) / 1024;
  const bgR = Math.round(30 * (1 - gradT) + 15 * gradT);
  const bgG = Math.round(27 * (1 - gradT) + 23 * gradT);
  const bgB = Math.round(75 * (1 - gradT) + 42 * gradT);

  return [bgR, bgG, bgB, 255];
}

console.log('Generating icon-192.png...');
const png192 = createPng(192, 192, renderPixel);
fs.writeFileSync(path.join(dir, 'icon-192.png'), png192);
console.log('Saved icon-192.png, size:', png192.length);

console.log('Generating icon-512.png...');
const png512 = createPng(512, 512, renderPixel);
fs.writeFileSync(path.join(dir, 'icon-512.png'), png512);
console.log('Saved icon-512.png, size:', png512.length);

console.log('All icons generated successfully!');
