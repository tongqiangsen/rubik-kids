const fs = require('fs');
const path = require('path');

const dir = __dirname;
const htmlPath = path.join(dir, 'index.html');
const manifestPath = path.join(dir, 'manifest.json');
const swPath = path.join(dir, 'sw.js');
const svgPath = path.join(dir, 'icon.svg');
const icon192Path = path.join(dir, 'icon-192.png');
const icon512Path = path.join(dir, 'icon-512.png');
const workerPath = path.join(dir, 'worker.js');

const html = fs.readFileSync(htmlPath, 'utf8');
const manifest = fs.readFileSync(manifestPath, 'utf8');
const sw = fs.readFileSync(swPath, 'utf8');
const svg = fs.readFileSync(svgPath, 'utf8');
const icon192Base64 = fs.readFileSync(icon192Path).toString('base64');
const icon512Base64 = fs.readFileSync(icon512Path).toString('base64');

function escapeTemplate(str) {
  return str.replace(/\\/g, '\\\\').replace(/`/g, '\\`').replace(/\${/g, '\\${');
}

const workerCode = `// Generated Cloudflare Worker for Rubik Kids Adventure PWA
const HTML_CONTENT = \`${escapeTemplate(html)}\`;
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
