const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const dir = 'C:/Users/Administrator/.gemini/antigravity/scratch/rubik-kids';
const msg = process.argv[2] || 'feat: update rubik kids 3D adventure web app';

console.log('🚀 [1/3] Compiling worker.js from index.html...');
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
try {
  execSync('npx wrangler deploy', { cwd: dir, stdio: 'inherit' });
  console.log('🎉 Successfully deployed to Cloudflare Edge: https://cube.aigoz.top/');
} catch (err) {
  console.error('⚠️ Wrangler deploy error:', err.message);
}
