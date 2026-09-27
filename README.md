# 魔方小勇士：3D 奇幻大冒险

一个面向儿童和零基础初学者的三阶魔方教学 PWA。项目使用单页 `index.html` 承载主要交互，并通过 Cloudflare Worker 发布为可安装的网页 App。

## 功能

- 3D 魔方舞台和五个剧情关卡
- 儿童化动作按钮、提示语和通关奖励
- 实物魔方填色录入与阶段诊断
- PWA 安装引导和 Service Worker 离线缓存
- Cloudflare Worker 单文件部署

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
| `manifest.json` | PWA 应用信息 |
| `sw.js` | Service Worker 缓存逻辑 |
| `build-worker.js` | 将页面和资源打包进 `worker.js` |
| `worker.js` | Cloudflare Worker 部署入口 |
| `test_*.js` | 魔方关卡、并发和 PWA Worker 测试 |
