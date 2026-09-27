const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const dir = __dirname;
const msg = process.argv[2] || 'feat: update rubik kids 3D adventure web app';

// Optional: Load .env if present
const envPath = path.join(dir, '.env');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    const [k, v] = line.trim().split('=');
    if (k && v && !process.env[k]) {
      process.env[k] = v;
    }
  });
}

console.log('🚀 [1/3] Compiling worker.js from index.html & PWA assets...');
require('./build-worker.js');

console.log('📦 [2/3] Syncing source code to GitHub repository...');
try {
  execSync('git add .', { cwd: dir, stdio: 'inherit' });
  try {
    execSync(`git commit -m "${msg}"`, { cwd: dir, stdio: 'inherit' });
  } catch (e) {
    console.log('No new git changes to commit.');
  }
  execSync('git push origin main', { cwd: dir, stdio: 'inherit' });
  console.log('✅ GitHub sync complete: https://github.com/tongqiangsen/rubik-kids');
} catch (err) {
  console.error('⚠️ Git push error:', err.message);
}

console.log('⚡ [3/3] Deploying to Cloudflare Worker (https://cube.aigoz.top/)...');
if (process.env.CLOUDFLARE_API_TOKEN) {
  try {
    execSync('npx wrangler deploy', { cwd: dir, stdio: 'inherit', env: process.env });
    console.log('🎉 Successfully deployed to Cloudflare Edge: https://cube.aigoz.top/');
  } catch (err) {
    console.error('⚠️ Wrangler deploy error:', err.message);
  }
} else {
  console.log('ℹ️ Tip: Set CLOUDFLARE_API_TOKEN in .env or run "npx wrangler login" to deploy automatically via CLI.');
}
