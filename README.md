# 魔方小勇士：3D 奇幻大冒险

一个面向儿童和零基础初学者的三阶魔方教学 PWA。项目使用单页 `index.html` 承载主要交互，并通过 Cloudflare Worker 发布为可安装的网页 App。

## 功能

- 3D 魔方舞台和五个剧情关卡，每关有示范残局及一个阶段练习残局
- 儿童化动作按钮、提示语和通关奖励
- 实物魔方填色录入、状态合法性检查、3D 手动同步及完整复原动作计算
- PWA 安装引导和 Service Worker 离线缓存
- Cloudflare Worker 单文件部署

练习残局从合法魔方状态出发，前四关只完成当前阶段目标；第 5 关从黄色顶面已完成的状态练习最后的角块或棱块归位。它们用于学习典型情况，尚不支持任意打乱状态的自动教学。
录入模式可计算任意合法状态的复原动作，并在播放前由 3D 状态引擎再次核验。计算在浏览器 Worker 中运行，首次使用需初始化求解表；完整复原模式仍是动作序列，尚未按儿童入门阶段组织成讲解。页面资源随 PWA 缓存供离线使用。
七个阶段可依次练习：白十字、白色第一层角块、中层棱块、黄色十字、黄色整面、顶角归位和顶棱归位。每组动作结束时保留已完成的阶段。带练会在每组结束后暂停，请保持黄色朝上、红色朝前，对照实物与 3D 模型六面；确认一致才能继续。不一致时可用当前模型作为底稿，修正实物六面录入并重新诊断、计算。白十字和完整复原模式每步暂停。此确认由用户目视完成，网页不会自动识别实物。完整复原动作按钮是单独的快捷求解模式，可能暂时拆开已完成的阶段。当前阶段引导仍以动作和状态核对为主，实物操作与儿童理解度尚需测试，动作长度也需优化。

## 本地使用

直接用浏览器打开 `index.html` 即可预览静态页面。

生成 Cloudflare Worker：

```bash
npm run build
```

运行测试：

```bash
npm test
```

## 部署

仓库包含 `wrangler.toml` 和生成后的 `worker.js`。如需自动部署到 Cloudflare Workers：

```bash
npm run deploy
```

如使用 API Token，请在本地 `.env` 中配置：

```bash
CLOUDFLARE_API_TOKEN=your_token_here
```

`.env` 已加入 `.gitignore`，不要提交真实密钥。

## 目录说明

| 文件 | 说明 |
| --- | --- |
| `index.html` | 主页面、样式和交互逻辑 |
| `cube-state.js` | 魔方动作、贴纸状态和关卡目标的共享逻辑 |
| `solver-bridge.js`、`solver-worker.js` | 状态转换、解法验证与后台计算 |
| `cross-solver.js` | 独立的白十字状态搜索与动作生成 |
| `layer1-solver.js` | 保持白十字的第一层角块搜索 |
| `middle-solver.js` | 保持第一层的中层棱块搜索 |
| `yellow-cross-solver.js` | 保持前两层的黄色十字搜索 |
| `yellow-face-solver.js` | 保持黄色十字的顶角翻色搜索 |
| `top-corners-solver.js`、`top-edges-solver.js` | 顶层角块及棱块归位搜索 |
| `vendor/cubejs/` | cubejs 1.3.2 求解器及 MIT 许可证 |
| `manifest.json` | PWA 应用信息 |
| `sw.js` | Service Worker 缓存逻辑 |
| `build-worker.js` | 将页面和资源打包进 `worker.js` |
| `worker.js` | Cloudflare Worker 部署入口 |
| `test_*.js` | 魔方关卡、并发和 PWA Worker 测试 |
