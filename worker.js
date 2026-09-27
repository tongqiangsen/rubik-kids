// Generated Cloudflare Worker for Rubik Kids Adventure PWA
const HTML_CONTENT = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover">
  <title>魔方小勇士：3D 奇幻大冒险</title>
  <link rel="manifest" href="manifest.json">
  <link rel="icon" type="image/svg+xml" href="icon.svg">
  <link rel="apple-touch-icon" href="icon-192.png">
  <meta name="mobile-web-app-capable" content="yes">
  <meta name="apple-mobile-web-app-capable" content="yes">
  <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
  <meta name="apple-mobile-web-app-title" content="魔方小勇士">
  <meta name="theme-color" content="#0f172a">
  <meta name="application-name" content="魔方小勇士">
  <!-- cf-build-probe: 20260927-probe2-pwa -->
  <script src="https://www.gstatic.com/antigravity/web/dev/tailwindcss.min.js"></script>
  <style>
    /* iOS Safe Area Insets for standalone mode */
    body {
      padding-top: max(0.5rem, env(safe-area-inset-top));
      padding-bottom: max(0.5rem, env(safe-area-inset-bottom));
      padding-left: max(0.5rem, env(safe-area-inset-left));
      padding-right: max(0.5rem, env(safe-area-inset-right));
    }
    /* 3D 舞台与渲染引擎 */
    .scene-viewport {
      perspective: 850px;
      user-select: none;
      -webkit-user-select: none;
      touch-action: none;
    }
    .cube-world {
      width: 0;
      height: 0;
      position: relative;
      transform-style: preserve-3d;
      transition: transform 0.08s ease-out;
    }
    .pivot-group, .cubie-layer {
      position: absolute;
      transform-style: preserve-3d;
      left: 0;
      top: 0;
    }
    .cubie {
      position: absolute;
      width: 58px;
      height: 58px;
      margin-left: -29px;
      margin-top: -29px;
      transform-style: preserve-3d;
      background: #0f172a;
      border-radius: 8px;
      box-shadow: inset 0 0 5px rgba(0,0,0,0.8);
      transition: none;
    }
    .face {
      position: absolute;
      width: 58px;
      height: 58px;
      box-sizing: border-box;
      padding: 4px;
      background: #0f172a;
      border-radius: 8px;
      backface-visibility: hidden;
    }
    .sticker {
      width: 100%;
      height: 100%;
      border-radius: 6px;
      box-shadow: inset 0 2px 3px rgba(255,255,255,0.45), inset 0 -3px 4px rgba(0,0,0,0.3);
      transition: opacity 0.2s, filter 0.2s;
    }
    /* 3D 面物理朝向校准 (Y轴朝下) */
    .face-u { transform: rotateX(90deg) translateZ(29px); }
    .face-d { transform: rotateX(-90deg) translateZ(29px); }
    .face-f { transform: translateZ(29px); }
    .face-b { transform: rotateY(180deg) translateZ(29px); }
    .face-l { transform: rotateY(-90deg) translateZ(29px); }
    .face-r { transform: rotateY(90deg) translateZ(29px); }

    /* 贴纸糖果高亮配色 */
    .sticker-u { background: #facc15; } /* 金黄顶面 */
    .sticker-d { background: #ffffff; } /* 纯白底面 */
    .sticker-f { background: #ef4444; } /* 鲜红前面 */
    .sticker-b { background: #f97316; } /* 活力橙后面 */
    .sticker-l { background: #3b82f6; } /* 天空蓝左面 */
    .sticker-r { background: #10b981; } /* 翡翠绿右面 */
    .sticker-none { background: #1e293b; box-shadow: none; opacity: 0.06; }

    /* 儿童卡片呼吸动效与弹跳 */
    @keyframes bounce-subtle {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-4px); }
    }
    .animate-float {
      animation: bounce-subtle 2.4s ease-in-out infinite;
    }

    @keyframes pulse-btn {
      0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(245, 158, 11, 0.7); }
      70% { transform: scale(1.05); box-shadow: 0 0 0 10px rgba(245, 158, 11, 0); }
      100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(245, 158, 11, 0); }
    }
    .guide-pulse {
      animation: pulse-btn 1.4s infinite ease-in-out;
      border-color: #f59e0b !important;
    }

    /* 滚动条美化 */
    ::-webkit-scrollbar { width: 5px; height: 5px; }
    ::-webkit-scrollbar-thumb { background: rgba(148, 163, 184, 0.4); border-radius: 4px; }
  </style>
</head>
<body class="bg-slate-900 text-slate-100 antialiased p-2 sm:p-4 min-h-screen flex flex-col justify-between selection:bg-amber-500 selection:text-white">
  
  <!-- 全屏礼花庆祝 Canvas (通关时爆发) -->
  <canvas id="confetti-canvas" class="fixed inset-0 pointer-events-none z-50 w-full h-full"></canvas>

  <div class="max-w-5xl mx-auto w-full space-y-3">
    
    <!-- 顶部导航与小勇士成就栏 -->
    <header class="bg-slate-800/90 border border-slate-700/80 rounded-3xl p-3 sm:p-4 shadow-lg backdrop-blur-md flex flex-wrap items-center justify-between gap-3">
      <div class="flex items-center gap-3">
        <div class="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-500 to-rose-500 flex items-center justify-center text-2xl shadow-md animate-float">
          🦁
        </div>
        <div>
          <h1 class="text-base sm:text-xl font-black tracking-wide text-amber-400 flex items-center gap-2">
            <span>魔方小勇士：3D 奇幻大冒险</span>
            <span class="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/40">儿童趣味版</span>
          </h1>
          <p class="text-xs text-slate-400 font-medium">
            告别枯燥字母 • 乘电梯 • 捉迷藏 • 变小金鱼
          </p>
        </div>
      </div>

      <!-- 快捷工具与星星奖励 -->
      <div class="flex items-center gap-2">
        <div class="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 font-bold text-xs sm:text-sm">
          <span>⭐</span>
          <span id="total-stars-count">0</span>
          <span class="text-xs text-amber-500/80">/ 15 星</span>
        </div>
        
        <button id="btn-sound-toggle" class="p-2 rounded-2xl bg-slate-700 hover:bg-slate-600 text-sm transition" title="开关音效">
          🔊
        </button>

        <button id="btn-pwa-install" class="px-2.5 py-1.5 rounded-2xl bg-sky-500/20 hover:bg-sky-500/30 border border-sky-500/40 text-sky-300 text-xs font-bold transition flex items-center gap-1 shadow-sm active:scale-95" title="添加到手机桌面">
          📱 <span class="hidden sm:inline">装到手机</span><span class="sm:hidden">App</span>
        </button>

        <button id="btn-open-tools" class="px-3 py-1.5 rounded-2xl bg-indigo-500/20 hover:bg-indigo-500/30 border border-indigo-500/40 text-indigo-300 text-xs font-bold transition flex items-center gap-1">
          🪄 魔法玩具箱
        </button>

        <button id="btn-open-color-input" class="px-3.5 py-1.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 text-xs font-black transition flex items-center gap-1.5 shadow-md active:scale-95">
          🎨 实物魔方求助
        </button>
      </div>
    </header>

    <!-- 关卡地图导航胶囊 (5大冒险岛 + 定制实物带练) -->
    <nav class="bg-slate-800/80 border border-slate-700/70 rounded-3xl p-2 shadow-sm flex items-center gap-1.5 overflow-x-auto text-xs font-bold">
      <button id="tab-custom-solve" class="level-tab-btn hidden min-w-[130px] py-2 px-3 rounded-2xl transition flex items-center justify-center gap-1.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-black shadow-md" data-level="custom">
        <span>🎯</span>
        <span>手里的魔方定制带练</span>
        <span class="text-[9px] px-1.5 py-0.5 rounded-full bg-black/20 text-slate-950 font-mono">实物</span>
      </button>
      <button class="level-tab-btn flex-1 min-w-[120px] py-2 px-3 rounded-2xl transition flex items-center justify-center gap-1.5 bg-amber-500 text-slate-950 shadow-md" data-level="1">
        <span>🌼</span>
        <span>1. 小黄花农场</span>
        <span class="level-star-badge text-[10px]">⭐⭐⭐</span>
      </button>
      <button class="level-tab-btn flex-1 min-w-[120px] py-2 px-3 rounded-2xl transition flex items-center justify-center gap-1.5 text-slate-300 hover:bg-slate-700/60" data-level="2">
        <span>🛗</span>
        <span>2. 神奇电梯楼</span>
        <span class="level-star-badge text-[10px]"></span>
      </button>
      <button class="level-tab-btn flex-1 min-w-[120px] py-2 px-3 rounded-2xl transition flex items-center justify-center gap-1.5 text-slate-300 hover:bg-slate-700/60" data-level="3">
        <span>🐿️</span>
        <span>3. 森林捉迷藏</span>
        <span class="level-star-badge text-[10px]"></span>
      </button>
      <button class="level-tab-btn flex-1 min-w-[120px] py-2 px-3 rounded-2xl transition flex items-center justify-center gap-1.5 text-slate-300 hover:bg-slate-700/60" data-level="4">
        <span>🐟</span>
        <span>4. 金鱼跃龙门</span>
        <span class="level-star-badge text-[10px]"></span>
      </button>
      <button class="level-tab-btn flex-1 min-w-[120px] py-2 px-3 rounded-2xl transition flex items-center justify-center gap-1.5 text-slate-300 hover:bg-slate-700/60" data-level="5">
        <span>🦉</span>
        <span>5. 猫头鹰守卫</span>
        <span class="level-star-badge text-[10px]"></span>
      </button>
    </nav>

    <!-- 主交互舞台区：左侧 3D 萌化魔方，右侧趣味剧情与大按键操作盘 -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-3.5 items-stretch">
      
      <!-- 左侧：3D 魔方视口 (占 7 列) -->
      <div class="lg:col-span-7 bg-slate-800/90 border border-slate-700/80 rounded-3xl p-4 flex flex-col justify-between relative overflow-hidden min-h-[390px] sm:min-h-[440px] shadow-md">
        
        <!-- 顶部快捷辅助按钮 -->
        <div class="w-full flex items-center justify-between z-10">
          <div class="flex items-center gap-2">
            <span class="text-xs px-3 py-1 rounded-xl bg-slate-900/80 border border-slate-700 text-slate-300 flex items-center gap-1.5">
              <span>🎯 目标：</span>
              <strong id="stage-task-text" class="text-amber-400">把花瓣送回土壤</strong>
            </span>
          </div>

          <div class="flex items-center gap-1.5">
            <button id="btn-cam-reset" class="px-2.5 py-1 rounded-xl bg-slate-700 hover:bg-slate-600 text-xs font-bold transition flex items-center gap-1">
              🔄 视角回正
            </button>
            <button id="btn-zoom-in" class="w-7 h-7 flex items-center justify-center rounded-xl bg-slate-700 hover:bg-slate-600 text-sm font-bold">+</button>
            <button id="btn-zoom-out" class="w-7 h-7 flex items-center justify-center rounded-xl bg-slate-700 hover:bg-slate-600 text-sm font-bold">-</button>
          </div>
        </div>

        <!-- 3D 魔方世界 -->
        <div id="scene-viewport" class="scene-viewport w-full flex-1 flex items-center justify-center cursor-grab active:cursor-grabbing my-2">
          <div id="cube-world" class="cube-world" style="transform: rotateX(-24deg) rotateY(-34deg) scale3d(1, 1, 1);">
            <div id="pivot" class="pivot-group"></div>
            <div id="cube" class="cubie-layer"></div>
          </div>
        </div>

        <!-- 角色剧情对话气泡 (皮皮狐导师指导语) -->
        <div class="w-full z-10 bg-slate-900/90 border border-amber-500/40 rounded-2xl p-3 flex items-start gap-2.5 shadow-lg">
          <div class="text-2xl animate-float flex-shrink-0">🦊</div>
          <div class="flex-1 space-y-0.5">
            <div class="flex items-center justify-between">
              <span class="text-xs font-bold text-amber-400">皮皮狐导师：</span>
              <span id="step-hint-badge" class="text-[10px] px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 font-mono">第 1/4 步</span>
            </div>
            <p id="dialog-bubble-text" class="text-xs text-slate-200 leading-relaxed font-medium">
              哈喽小勇士！白色花瓣已经在顶层啦，先转动顶层找找好朋友吧！
            </p>
          </div>
        </div>

      </div>

      <!-- 右侧：关卡交互与大按键操作盘 (占 5 列) -->
      <div class="lg:col-span-5 flex flex-col gap-3">
        
        <!-- 闯关面板 -->
        <div class="bg-slate-800/90 border border-slate-700/80 rounded-3xl p-4 shadow-md flex-1 flex flex-col justify-between space-y-3">
          
          <!-- 关卡模式切换与重置 -->
          <div class="flex items-center justify-between border-b border-slate-700/80 pb-3">
            <div class="flex items-center gap-1.5 bg-slate-900/80 p-1 rounded-2xl text-xs font-bold">
              <button id="mode-btn-story" class="px-3 py-1.5 rounded-xl bg-amber-500 text-slate-950 shadow-sm transition">
                📖 听故事演示
              </button>
              <button id="mode-btn-play" class="px-3 py-1.5 rounded-xl text-slate-400 hover:text-white transition">
                🎮 小勇士挑战
              </button>
            </div>

            <button id="btn-restart-level" class="px-3 py-1.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-xs font-bold transition flex items-center gap-1">
              🔄 重新摆局
            </button>
          </div>

          <!-- 关卡故事儿歌口诀 -->
          <div class="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-xs space-y-1">
            <div class="flex items-center gap-1.5 font-bold text-amber-400">
              <span>🎶 动作魔法儿歌：</span>
            </div>
            <div id="level-rhyme-text" class="font-bold text-slate-100 text-xs tracking-wide">
              转转顶层对颜色，前门翻滚进土壤！
            </div>
          </div>

          <!-- 核心拟人化动作大按键区 (彻底消除抽象字母代号) -->
          <div class="space-y-2 flex-1 flex flex-col justify-center">
            <span class="text-xs font-bold text-slate-400">✨ 点击魔法动作盘（跟着发光的按键点）：</span>
            
            <div id="action-buttons-grid" class="grid grid-cols-2 gap-2.5">
              <!-- 由 JS 根据当前关卡动态填充大号图标按钮 -->
            </div>
          </div>

          <!-- 关卡动作节拍进度点 -->
          <div class="pt-2 border-t border-slate-700/80 flex items-center justify-between">
            <div class="flex items-center gap-2">
              <span class="text-xs text-slate-400 font-medium">通关进度：</span>
              <div id="action-dots-bar" class="flex items-center gap-1.5">
                <!-- 节拍圆点 -->
              </div>
            </div>

            <button id="btn-auto-step" class="px-3 py-1.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-black text-xs transition shadow-md flex items-center gap-1">
              <span>▶ 走一步</span>
            </button>
          </div>

        </div>

      </div>

    </div>

    <!-- 底部：魔法玩具箱弹窗 (模态框) -->
    <div id="modal-magic-tools" class="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-40 hidden flex items-center justify-center p-4">
      <div class="bg-slate-900 border border-slate-700 rounded-3xl p-5 max-w-lg w-full space-y-4 shadow-2xl relative">
        <div class="flex items-center justify-between border-b border-slate-800 pb-3">
          <div class="flex items-center gap-2">
            <span class="text-2xl">🪄</span>
            <h3 class="font-black text-lg text-amber-400">魔法玩具箱与测速仪</h3>
          </div>
          <button id="btn-close-tools" class="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 font-bold">✕</button>
        </div>

        <!-- 玩具 1: 6次神迹探索 -->
        <div class="p-3.5 rounded-2xl bg-slate-800/80 border border-slate-700 space-y-2">
          <div class="flex justify-between items-center">
            <span class="font-bold text-sm text-slate-200">🪞 6次魔法镜 (连续做6次自动复原)</span>
            <button id="btn-magic-six" class="px-3 py-1.5 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-slate-950 font-black text-xs transition">
              施展 6 次魔法！
            </button>
          </div>
          <p class="text-xs text-slate-400">
            带女儿见证奇迹：连续做 6 次“电梯接人”，魔方会像施了魔法一样自动全复原！
          </p>
        </div>

        <!-- 玩具 2: 儿童拍击计时器 -->
        <div class="p-3.5 rounded-2xl bg-slate-800/80 border border-slate-700 space-y-2 text-center">
          <div class="text-xs font-bold text-slate-400">⏱️ 儿童拍击大计时器</div>
          <div id="timer-display" class="font-mono text-3xl font-black text-amber-400 tracking-wider">00.00 秒</div>
          <button id="btn-timer-trigger" class="w-full py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-sm shadow-lg active:scale-95 transition">
        <!-- 玩具 3: 自由打乱与一键复原 -->
        <div class="p-3.5 rounded-2xl bg-slate-800/80 border border-slate-700 flex items-center justify-between">
          <div>
            <div class="font-bold text-sm text-slate-200">🎲 随心打乱 / 瞬时复原</div>
            <div class="text-xs text-slate-400">用来做手速练习前的任意打乱</div>
          </div>
          <div class="flex items-center gap-2">
            <button id="btn-sandbox-scramble" class="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition">🎲 随机打乱</button>
            <button id="btn-sandbox-solve" class="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition">✨ 瞬间复原</button>
          </div>
        </div>

      </div>
    </div>

    <!-- 实物魔方涂色录入大弹窗 -->
    <div id="modal-color-input" class="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-50 hidden flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div class="bg-slate-900 border border-slate-700 rounded-3xl p-4 sm:p-5 max-w-2xl w-full space-y-3.5 shadow-2xl relative my-auto">
        
        <!-- 弹窗头部 -->
        <div class="flex items-center justify-between border-b border-slate-800 pb-2.5">
          <div class="flex items-center gap-2">
            <span class="text-2xl">🎨</span>
            <div>
              <h3 class="font-black text-sm sm:text-base text-emerald-400">实物魔方填色录入与智能体检</h3>
              <p class="text-[11px] text-slate-400 font-medium">手拿魔方：<strong>黄色中心朝上，红色中心正对你</strong>。按顺序点出颜色！</p>
            </div>
          </div>
          <button id="btn-close-color-modal" class="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 font-bold flex items-center justify-center">✕</button>
        </div>

        <!-- 实物进度极速对齐模板 (根据魔方规则一键填好大半) -->
        <div class="bg-slate-800/80 p-2.5 rounded-2xl border border-slate-700/80 space-y-1.5 shadow-sm">
          <div class="flex flex-wrap items-center justify-between text-xs gap-1">
            <span class="text-amber-400 font-bold flex items-center gap-1.5">
              <span>⚡ 常见阶段一键套用（秒省 80% 逐格点涂）：</span>
            </span>
            <span class="text-[11px] text-slate-400">选择最接近手里的状态 ➔ 只需微调剩余色块</span>
          </div>
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-1.5 text-xs font-bold">
            <button id="btn-preset-cross" class="py-1.5 px-2 rounded-xl bg-slate-700/70 hover:bg-slate-600 text-slate-200 border border-slate-600/70 transition flex items-center justify-center gap-1 hover:border-amber-400/50 active:scale-95">
              <span>🌼 底十字已好</span>
            </button>
            <button id="btn-preset-layer1" class="py-1.5 px-2 rounded-xl bg-slate-700/70 hover:bg-slate-600 text-sky-300 border border-slate-600/70 transition flex items-center justify-center gap-1 hover:border-sky-400/50 active:scale-95">
              <span>🏢 第一层已好</span>
            </button>
            <button id="btn-preset-f2l" class="py-1.5 px-2 rounded-xl bg-slate-700/70 hover:bg-slate-600 text-emerald-300 border border-slate-600/70 transition flex items-center justify-center gap-1 hover:border-emerald-400/50 active:scale-95">
              <span>🌲 前两层已好</span>
            </button>
            <button id="btn-preset-fish" class="py-1.5 px-2 rounded-xl bg-slate-700/70 hover:bg-slate-600 text-amber-300 border border-slate-600/70 transition flex items-center justify-center gap-1 hover:border-amber-400/50 active:scale-95">
              <span>🐟 顶面小鱼形态</span>
            </button>
          </div>
        </div>

        <!-- 2D 十字展开图涂色区 (4列网格) -->
        <div class="flex flex-col items-center justify-center py-1">
          <div class="inline-grid grid-cols-4 gap-2 sm:gap-3 text-center text-[10px] font-bold select-none">
            
            <!-- Row 1: 空白, U (顶黄), 空白, 空白 -->
            <div class="invisible w-[90px] sm:w-[104px] h-[90px] sm:h-[104px]"></div>
            <div class="flex flex-col items-center">
              <span class="text-amber-400 text-xs mb-1 font-black">顶面 (U 黄)</span>
              <div id="face-grid-u" class="grid grid-cols-3 gap-1.5 p-1.5 bg-slate-950/80 rounded-2xl border border-slate-800 shadow-inner"></div>
            </div>
            <div class="invisible w-[90px] sm:w-[104px] h-[90px] sm:h-[104px]"></div>
            <div class="invisible w-[90px] sm:w-[104px] h-[90px] sm:h-[104px]"></div>

            <!-- Row 2: L (左蓝), F (前红), R (右绿), B (后橙) -->
            <div class="flex flex-col items-center">
              <span class="text-blue-400 text-xs mb-1 font-black">左面 (L 蓝)</span>
              <div id="face-grid-l" class="grid grid-cols-3 gap-1.5 p-1.5 bg-slate-950/80 rounded-2xl border border-slate-800 shadow-inner"></div>
            </div>
            <div class="flex flex-col items-center">
              <span class="text-rose-400 text-xs mb-1 font-black">前面 (F 红)</span>
              <div id="face-grid-f" class="grid grid-cols-3 gap-1.5 p-1.5 bg-slate-950/80 rounded-2xl border border-slate-800 shadow-inner"></div>
            </div>
            <div class="flex flex-col items-center">
              <span class="text-emerald-400 text-xs mb-1 font-black">右面 (R 绿)</span>
              <div id="face-grid-r" class="grid grid-cols-3 gap-1.5 p-1.5 bg-slate-950/80 rounded-2xl border border-slate-800 shadow-inner"></div>
            </div>
            <div class="flex flex-col items-center">
              <span class="text-orange-400 text-xs mb-1 font-black">后面 (B 橙)</span>
              <div id="face-grid-b" class="grid grid-cols-3 gap-1.5 p-1.5 bg-slate-950/80 rounded-2xl border border-slate-800 shadow-inner"></div>
            </div>

            <!-- Row 3: 空白, D (底白), 空白, 空白 -->
            <div class="invisible w-[90px] sm:w-[104px] h-[90px] sm:h-[104px]"></div>
            <div class="flex flex-col items-center">
              <span class="text-slate-200 text-xs mb-1 font-black">底面 (D 白)</span>
              <div id="face-grid-d" class="grid grid-cols-3 gap-1.5 p-1.5 bg-slate-950/80 rounded-2xl border border-slate-800 shadow-inner"></div>
            </div>
            <div class="invisible w-[90px] sm:w-[104px] h-[90px] sm:h-[104px]"></div>
            <div class="invisible w-[90px] sm:w-[104px] h-[90px] sm:h-[104px]"></div>

          </div>
        </div>

        <!-- 选色控制台与快捷拾色器 -->
        <div class="bg-slate-800/90 p-3 rounded-2xl border border-slate-700/80 space-y-2 shadow-lg">
          <div class="flex flex-wrap items-center justify-between gap-1 text-xs">
            <div class="flex items-center gap-2">
              <span class="text-slate-300 font-bold">🎯 操作目标：</span>
              <span id="selected-tile-badge" class="px-2.5 py-1 rounded-xl bg-amber-400/20 text-amber-300 font-bold border border-amber-400/40 text-xs">
                👉 点选上方任意色块
              </span>
            </div>
            <span class="text-[11px] text-slate-400">💡 提示：点击色块可<strong>直接循环换色</strong>，同块边缘同步发光</span>
          </div>

          <!-- 6色快速直选大按钮 -->
          <div class="grid grid-cols-6 gap-1.5 sm:gap-2 text-center text-xs font-bold">
            <button class="palette-btn p-2 rounded-xl border-2 border-amber-400 bg-yellow-400 text-slate-950 flex flex-col items-center shadow-md active:scale-95 transition hover:brightness-105" data-color="Y">
              <span class="text-sm">🟡</span>
              <span class="font-black text-xs">黄色</span>
              <span id="count-Y" class="text-[10px] font-mono opacity-80">9/9</span>
            </button>
            <button class="palette-btn p-2 rounded-xl border-2 border-transparent bg-white text-slate-950 flex flex-col items-center shadow-md active:scale-95 transition hover:brightness-105" data-color="W">
              <span class="text-sm">⚪</span>
              <span class="font-black text-xs">白色</span>
              <span id="count-W" class="text-[10px] font-mono opacity-80">9/9</span>
            </button>
            <button class="palette-btn p-2 rounded-xl border-2 border-transparent bg-red-500 text-white flex flex-col items-center shadow-md active:scale-95 transition hover:brightness-105" data-color="R">
              <span class="text-sm">🔴</span>
              <span class="font-black text-xs">红色</span>
              <span id="count-R" class="text-[10px] font-mono opacity-80">9/9</span>
            </button>
            <button class="palette-btn p-2 rounded-xl border-2 border-transparent bg-orange-500 text-white flex flex-col items-center shadow-md active:scale-95 transition hover:brightness-105" data-color="O">
              <span class="text-sm">🟠</span>
              <span class="font-black text-xs">橙色</span>
              <span id="count-O" class="text-[10px] font-mono opacity-80">9/9</span>
            </button>
            <button class="palette-btn p-2 rounded-xl border-2 border-transparent bg-blue-500 text-white flex flex-col items-center shadow-md active:scale-95 transition hover:brightness-105" data-color="B">
              <span class="text-sm">🔵</span>
              <span class="font-black text-xs">蓝色</span>
              <span id="count-B" class="text-[10px] font-mono opacity-80">9/9</span>
            </button>
            <button class="palette-btn p-2 rounded-xl border-2 border-transparent bg-emerald-500 text-white flex flex-col items-center shadow-md active:scale-95 transition hover:brightness-105" data-color="G">
              <span class="text-sm">🟢</span>
              <span class="font-black text-xs">绿色</span>
              <span id="count-G" class="text-[10px] font-mono opacity-80">9/9</span>
            </button>
          </div>
        </div>

        <!-- 弹窗底部操作按钮 -->
        <div class="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-800">
          <div class="flex items-center gap-1.5">
            <button id="btn-color-reset-solved" class="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition">
              🔄 填满已复原
            </button>
            <button id="btn-color-clear" class="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-rose-400 text-xs font-bold transition">
              🗑️ 全清空重新涂
            </button>
          </div>

          <div class="flex items-center gap-2">
            <button id="btn-auto-complete" class="px-3.5 py-2 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-xs sm:text-sm shadow-md transition flex items-center gap-1.5 active:scale-95">
              <span>✨ 物理规则智能补全</span>
            </button>
            <button id="btn-run-diagnostic" class="px-4 py-2 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs sm:text-sm shadow-lg active:scale-95 transition flex items-center gap-1.5">
              <span>🔍 智能体检并生成带练</span>
            </button>
          </div>
        </div>

      </div>
    </div>

    <!-- 智能体检报告大弹窗 -->
    <div id="modal-diagnostic-report" class="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-50 hidden flex items-center justify-center p-3 sm:p-4">
      <div class="bg-slate-900 border border-slate-700 rounded-3xl p-5 max-w-md w-full space-y-4 shadow-2xl relative animate-float">
        <div class="flex items-center justify-between border-b border-slate-800 pb-2.5">
          <div class="flex items-center gap-2">
            <span class="text-3xl">🩺</span>
            <div>
              <h3 class="font-black text-base text-amber-400">皮皮狐的魔方体检报告</h3>
              <p class="text-[11px] text-slate-400">已成功识别并诊断手里的真实魔方状态</p>
            </div>
          </div>
          <button id="btn-close-diagnostic" class="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 font-bold">✕</button>
        </div>

        <!-- 5 个关卡状态清单 -->
        <div id="diagnostic-checklist" class="space-y-2 text-xs">
          <!-- JS 动态填充清单 -->
        </div>

        <!-- 当前核心诊断总结卡片 -->
        <div class="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-xs space-y-1">
          <div class="font-bold text-amber-400">🎯 突破卡点行动指南：</div>
          <p id="diagnostic-summary-text" class="text-slate-200 leading-relaxed font-medium">
            正在分析中...
          </p>
        </div>

        <button id="btn-start-custom-guidance" class="w-full py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 text-slate-950 font-black text-sm shadow-xl active:scale-95 transition flex items-center justify-center gap-2">
          <span>🚀 开启 3D 定制带练（照着魔方一步步转）</span>
        </button>
      </div>
    </div>

    <!-- 通关结算大弹窗 -->
    <div id="modal-level-complete" class="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-50 hidden flex items-center justify-center p-4">
      <div class="bg-gradient-to-b from-slate-900 to-slate-950 border-2 border-amber-500/60 rounded-3xl p-6 max-w-sm w-full text-center space-y-4 shadow-2xl relative animate-float">
        <div class="text-5xl">🏆</div>
        <div class="space-y-1">
          <h2 class="text-xl font-black text-amber-400">太棒啦！关卡大获全胜！</h2>
          <p id="victory-stage-name" class="text-xs text-slate-300 font-medium">你成功征服了【神奇电梯楼】！</p>
        </div>

        <div class="flex justify-center items-center gap-2 text-3xl py-2">
          <span class="animate-bounce" style="animation-delay: 0.1s">⭐</span>
          <span class="animate-bounce" style="animation-delay: 0.25s">⭐</span>
          <span class="animate-bounce" style="animation-delay: 0.4s">⭐</span>
        </div>

        <div class="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-300 font-bold">
          🏅 解锁荣誉勋章：<span id="victory-badge-name">电梯调度大宗师</span>
        </div>

        <div class="flex items-center gap-2 pt-2">
          <button id="btn-replay-stage" class="flex-1 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 transition">
            再玩一次 🔄
          </button>
          <button id="btn-next-stage" class="flex-1 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-xs font-black text-slate-950 transition shadow-lg">
            挑战下一关 ➔
          </button>
        </div>
      </div>
    </div>

    <!-- PWA 手机安装引导弹窗 -->
    <div id="modal-pwa-install" class="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-50 hidden flex items-center justify-center p-4">
      <div class="bg-gradient-to-b from-slate-900 to-slate-950 border-2 border-sky-500/60 rounded-3xl p-5 max-w-md w-full space-y-4 shadow-2xl relative">
        <div class="flex items-center justify-between border-b border-slate-800 pb-3">
          <div class="flex items-center gap-2">
            <span class="text-2xl">📱</span>
            <div>
              <h2 class="text-base font-black text-sky-400">安装为手机桌面 App</h2>
              <p class="text-[11px] text-slate-400">无地址栏 • 全屏沉浸 • 离线秒开</p>
            </div>
          </div>
          <button id="btn-close-pwa-modal" class="text-slate-400 hover:text-white p-1 rounded-xl text-lg font-bold">✕</button>
        </div>

        <div class="space-y-3 text-xs text-slate-300">
          <!-- 苹果手机教程 -->
          <div class="p-3 rounded-2xl bg-slate-800/80 border border-slate-700 space-y-2">
            <div class="flex items-center gap-1.5 font-bold text-amber-300 text-sm">
              <span>🍎</span>
              <span>苹果 iPhone / iPad (Safari 浏览器)</span>
            </div>
            <ol class="list-decimal list-inside space-y-1.5 text-slate-300 text-[11px] leading-relaxed">
              <li>用 Safari 打开网页，点击底部或顶部的<strong>分享按钮</strong>（<span class="px-1.5 py-0.5 rounded bg-slate-700 font-mono">⎋ 分享</span>）</li>
              <li>在菜单中向下滑动，找到并点击 <strong>“添加到主屏幕”</strong></li>
              <li>点击右上角 <strong>“添加”</strong>，桌面即可生成“魔方小勇士”专属图标！</li>
            </ol>
          </div>

          <!-- 安卓手机教程 -->
          <div class="p-3 rounded-2xl bg-slate-800/80 border border-slate-700 space-y-2">
            <div class="flex items-center gap-1.5 font-bold text-emerald-300 text-sm">
              <span>🤖</span>
              <span>安卓手机 (Chrome / 华为/小米自带浏览器)</span>
            </div>
            <ol class="list-decimal list-inside space-y-1.5 text-slate-300 text-[11px] leading-relaxed">
              <li>点击浏览器右上角或底部的菜单按钮（<span class="px-1.5 py-0.5 rounded bg-slate-700 font-mono">⋮ 菜单</span>）</li>
              <li>点击 <strong>“添加到主屏幕”</strong> 或 <strong>“安装应用”</strong></li>
              <li>桌面即可生成全屏游戏图标，无需重复输入网址！</li>
            </ol>
          </div>
        </div>

        <div id="pwa-native-install-box" class="hidden">
          <button id="btn-pwa-trigger-install" class="w-full py-3 rounded-2xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-slate-950 font-black text-sm transition shadow-lg flex items-center justify-center gap-2 active:scale-95">
            <span>✨</span>
            <span>检测到支持直接安装：点此一键安装</span>
          </button>
        </div>

        <button id="btn-pwa-know" class="w-full py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs transition">
          我知道啦，继续玩 🚀
        </button>
      </div>
    </div>

  </div>

  <script>
    /* =====================================================================
       1. 纯 Web Audio 游戏音效合成引擎 (零外部音频文件，免加载)
       ===================================================================== */
    class GameAudioEngine {
      constructor() {
        this.ctx = null;
        this.muted = false;
      }
      init() {
        if (!this.ctx) {
          const AudioContext = window.AudioContext || window.webkitAudioContext;
          this.ctx = new AudioContext();
        }
        if (this.ctx && this.ctx.state === 'suspended') {
          this.ctx.resume();
        }
      }
      playTone(freq, type = 'sine', duration = 0.1, gainVal = 0.12) {
        if (this.muted) return;
        this.init();
        if (!this.ctx) return;
        try {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = type;
          osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
          gain.gain.setValueAtTime(gainVal, this.ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);
          osc.connect(gain);
          gain.connect(this.ctx.destination);
          osc.start();
          osc.stop(this.ctx.currentTime + duration);
        } catch(e) {}
      }
      // 电梯上楼音 (上升滑音)
      playElevatorUp() {
        if (this.muted) return;
        this.init();
        try {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(260, this.ctx.currentTime);
          osc.frequency.exponentialRampToValueAtTime(520, this.ctx.currentTime + 0.18);
          gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
          gain.gain.linearRampToValueAtTime(0.01, this.ctx.currentTime + 0.18);
          osc.connect(gain);
          gain.connect(this.ctx.destination);
          osc.start();
          osc.stop(this.ctx.currentTime + 0.18);
        } catch(e) {}
      }
      // 电梯下楼音 (平稳下降音)
      playElevatorDown() {
        if (this.muted) return;
        this.init();
        try {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(520, this.ctx.currentTime);
          osc.frequency.exponentialRampToValueAtTime(260, this.ctx.currentTime + 0.18);
          gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
          gain.gain.linearRampToValueAtTime(0.01, this.ctx.currentTime + 0.18);
          osc.connect(gain);
          gain.connect(this.ctx.destination);
          osc.start();
          osc.stop(this.ctx.currentTime + 0.18);
        } catch(e) {}
      }
      // 成功叮咚音
      playDing() {
        this.playTone(523.25, 'sine', 0.12, 0.2); // C5
        setTimeout(() => this.playTone(659.25, 'sine', 0.18, 0.2), 100); // E5
      }
      // 错误啵啵音
      playWrong() {
        this.playTone(200, 'sawtooth', 0.15, 0.1);
      }
      // 通关大号角
      playVictory() {
        if (this.muted) return;
        const notes = [261.63, 329.63, 392.00, 523.25];
        notes.forEach((freq, idx) => {
          setTimeout(() => this.playTone(freq, 'triangle', 0.25, 0.2), idx * 110);
        });
      }
    }
    const audio = new GameAudioEngine();

    /* =====================================================================
       2. 纯原生 Canvas 彩带礼花粒子系统 (Confetti)
       ===================================================================== */
    const canvas = document.getElementById('confetti-canvas');
    const ctx = canvas.getContext('2d');
    let particles = [];
    let confettiAnimation = null;

    function resizeCanvas() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    function launchConfetti() {
      particles = [];
      const colors = ['#f59e0b', '#ef4444', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899'];
      for (let i = 0; i < 90; i++) {
        particles.push({
          x: canvas.width / 2,
          y: canvas.height / 2,
          vx: (Math.random() - 0.5) * 18,
          vy: (Math.random() - 0.7) * 18,
          size: Math.random() * 8 + 4,
          color: colors[Math.floor(Math.random() * colors.length)],
          rotation: Math.random() * 360,
          vRot: (Math.random() - 0.5) * 12,
          life: 1.0
        });
      }
      if (confettiAnimation) cancelAnimationFrame(confettiAnimation);
      animateConfetti();
    }

    function animateConfetti() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      let alive = false;
      particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.35; // 重力
        p.vx *= 0.98;
        p.rotation += p.vRot;
        p.life -= 0.012;

        if (p.life > 0) {
          alive = true;
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate((p.rotation * Math.PI) / 180);
          ctx.fillStyle = p.color;
          ctx.globalAlpha = Math.max(0, p.life);
          ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.7);
          ctx.restore();
        }
      });
      if (alive) {
        confettiAnimation = requestAnimationFrame(animateConfetti);
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    }

    /* =====================================================================
       3. 3D 魔方核心数学引擎 (无漂移、方向绝对精准)
       ===================================================================== */
    const CUBIE_SIZE = 58;
    const MOVE_DURATION = 210;

    const ROTATION_DEFS = {
      "R":  { axis: 'x', sliceVal: 1,  pivotCss: 'rotateX(90deg)',  mat: [[1,0,0],[0,0,-1],[0,1,0]] },
      "R'": { axis: 'x', sliceVal: 1,  pivotCss: 'rotateX(-90deg)', mat: [[1,0,0],[0,0,1],[0,-1,0]] },
      "L":  { axis: 'x', sliceVal: -1, pivotCss: 'rotateX(-90deg)', mat: [[1,0,0],[0,0,1],[0,-1,0]] },
      "L'": { axis: 'x', sliceVal: -1, pivotCss: 'rotateX(90deg)',  mat: [[1,0,0],[0,0,-1],[0,1,0]] },
      "U":  { axis: 'y', sliceVal: -1, pivotCss: 'rotateY(-90deg)', mat: [[0,0,-1],[0,1,0],[1,0,0]] },
      "U'": { axis: 'y', sliceVal: -1, pivotCss: 'rotateY(90deg)',  mat: [[0,0,1],[0,1,0],[-1,0,0]] },
      "D":  { axis: 'y', sliceVal: 1,  pivotCss: 'rotateY(90deg)',  mat: [[0,0,1],[0,1,0],[-1,0,0]] },
      "D'": { axis: 'y', sliceVal: 1,  pivotCss: 'rotateY(-90deg)', mat: [[0,0,-1],[0,1,0],[1,0,0]] },
      "F":  { axis: 'z', sliceVal: 1,  pivotCss: 'rotateZ(90deg)',  mat: [[0,-1,0],[1,0,0],[0,0,1]] },
      "F'": { axis: 'z', sliceVal: 1,  pivotCss: 'rotateZ(-90deg)', mat: [[0,1,0],[-1,0,0],[0,0,1]] },
      "B":  { axis: 'z', sliceVal: -1, pivotCss: 'rotateZ(-90deg)', mat: [[0,1,0],[-1,0,0],[0,0,1]] },
      "B'": { axis: 'z', sliceVal: -1, pivotCss: 'rotateZ(90deg)',  mat: [[0,-1,0],[1,0,0],[0,0,1]] }
    };

    function matMul(a, b) {
      const res = [[0,0,0],[0,0,0],[0,0,0]];
      for(let i=0; i<3; i++) for(let j=0; j<3; j++) res[i][j] = a[i][0]*b[0][j] + a[i][1]*b[1][j] + a[i][2]*b[2][j];
      return res;
    }
    function vecMul(m, v) {
      return [
        m[0][0]*v[0] + m[0][1]*v[1] + m[0][2]*v[2],
        m[1][0]*v[0] + m[1][1]*v[1] + m[1][2]*v[2],
        m[2][0]*v[0] + m[2][1]*v[1] + m[2][2]*v[2]
      ];
    }

    class RubiksCube {
      constructor(cubeEl, pivotEl) {
        this.cubeEl = cubeEl;
        this.pivotEl = pivotEl;
        this.cubies = [];
        this.isBusy = false;
        this.queue = [];
        this._animTimer = null;
        this.init();
      }

      init() {
        if (this._animTimer) {
          clearTimeout(this._animTimer);
          this._animTimer = null;
        }
        this.queue = [];
        this.isBusy = false;
        this.pivotEl.style.transition = 'none';
        this.pivotEl.style.transform = 'none';
        this.cubeEl.innerHTML = '';
        this.pivotEl.innerHTML = '';
        this.cubies = [];

        let id = 0;
        for (let x = -1; x <= 1; x++) {
          for (let y = -1; y <= 1; y++) {
            for (let z = -1; z <= 1; z++) {
              if (x === 0 && y === 0 && z === 0) continue;
              
              const el = document.createElement('div');
              el.className = 'cubie';
              el.id = \`cubie-\${id++}\`;

              const faces = [
                { dir: 'u', sticker: (y === -1 ? 'sticker-u' : 'sticker-none') },
                { dir: 'd', sticker: (y === 1  ? 'sticker-d' : 'sticker-none') },
                { dir: 'f', sticker: (z === 1  ? 'sticker-f' : 'sticker-none') },
                { dir: 'b', sticker: (z === -1 ? 'sticker-b' : 'sticker-none') },
                { dir: 'l', sticker: (x === -1 ? 'sticker-l' : 'sticker-none') },
                { dir: 'r', sticker: (x === 1  ? 'sticker-r' : 'sticker-none') }
              ];

              faces.forEach(f => {
                const faceDiv = document.createElement('div');
                faceDiv.className = \`face face-\${f.dir}\`;
                const st = document.createElement('div');
                st.className = \`sticker \${f.sticker}\`;
                faceDiv.appendChild(st);
                el.appendChild(faceDiv);
              });

              const cData = {
                id: el.id,
                el: el,
                pos: [x, y, z],
                mat: [[1, 0, 0], [0, 1, 0], [0, 0, 1]]
              };

              this.cubies.push(cData);
              this.updateStyle(cData);
              this.cubeEl.appendChild(el);
            }
          }
        }
      }

      updateStyle(c) {
        const [x, y, z] = c.pos;
        const [m00, m01, m02] = c.mat[0];
        const [m10, m11, m12] = c.mat[1];
        const [m20, m21, m22] = c.mat[2];

        const tx = x * CUBIE_SIZE;
        const ty = y * CUBIE_SIZE;
        const tz = z * CUBIE_SIZE;

        c.el.style.transform = \`translate3d(\${tx}px, \${ty}px, \${tz}px) matrix3d(
          \${m00}, \${m10}, \${m20}, 0,
          \${m01}, \${m11}, \${m21}, 0,
          \${m02}, \${m12}, \${m22}, 0,
          0, 0, 0, 1
        )\`;
      }

      instantMove(code) {
        if (code.endsWith('2')) {
          const b = code[0];
          this.instantMove(b);
          this.instantMove(b);
          return;
        }
        const def = ROTATION_DEFS[code];
        if (!def) return;
        const ax = def.axis === 'x' ? 0 : (def.axis === 'y' ? 1 : 2);
        this.cubies.forEach(c => {
          if (c.pos[ax] === def.sliceVal) {
            c.pos = vecMul(def.mat, c.pos);
            c.mat = matMul(def.mat, c.mat);
            this.updateStyle(c);
          }
        });
      }

      instantMoves(moves) {
        moves.forEach(m => this.instantMove(m));
      }

      performMove(code, onEnd = null) {
        if (this.isBusy) return false;
        if (code.endsWith('2')) {
          const b = code[0];
          this.enqueueMoves([b, b], onEnd);
        } else {
          this.enqueueMoves([code], onEnd);
        }
        return true;
      }

      enqueueMoves(moveList, onFinish = null) {
        const expanded = [];
        moveList.forEach(m => {
          if (m.endsWith('2')) {
            const b = m[0];
            expanded.push(b, b);
          } else {
            expanded.push(m);
          }
        });
        this.queue.push({ moves: expanded, onFinish });
        this.processQueue();
      }

      processQueue() {
        if (this.isBusy || this.queue.length === 0) return;
        this.isBusy = true;
        const item = this.queue[0];
        let idx = 0;

        const next = () => {
          if (idx < item.moves.length) {
            this._rawPerformMove(item.moves[idx++], next);
          } else {
            this.queue.shift();
            this.isBusy = false;
            if (item.onFinish) item.onFinish();
            if (this.queue.length > 0) this.processQueue();
          }
        };
        next();
      }

      _rawPerformMove(code, onEnd) {
        const def = ROTATION_DEFS[code];
        if (!def) {
          if (onEnd) onEnd();
          return;
        }

        // 音效触发
        if (code === 'R') audio.playElevatorUp();
        else if (code === "R'") audio.playElevatorDown();
        else audio.playDing();

        const ax = def.axis === 'x' ? 0 : (def.axis === 'y' ? 1 : 2);
        const targetCubies = this.cubies.filter(c => c.pos[ax] === def.sliceVal);

        targetCubies.forEach(c => this.pivotEl.appendChild(c.el));

        this.pivotEl.style.transition = \`transform \${MOVE_DURATION}ms cubic-bezier(0.2, 0.85, 0.35, 1)\`;
        this.pivotEl.style.transform = def.pivotCss;

        this._animTimer = setTimeout(() => {
          this._animTimer = null;
          targetCubies.forEach(c => {
            c.pos = vecMul(def.mat, c.pos);
            c.mat = matMul(def.mat, c.mat);
            this.cubeEl.appendChild(c.el);
            this.updateStyle(c);
          });
          this.pivotEl.style.transition = 'none';
          this.pivotEl.style.transform = 'none';
          if (onEnd) onEnd();
        }, MOVE_DURATION + 15);
      }
    }

    const cubeEl = document.getElementById('cube');
    const pivotEl = document.getElementById('pivot');
    const rubik = new RubiksCube(cubeEl, pivotEl);

    /* =====================================================================
       4. 3D 摄像机与全景手势旋转 (Orbit Controls)
       ===================================================================== */
    const viewport = document.getElementById('scene-viewport');
    const world = document.getElementById('cube-world');

    let isDrag = false;
    let sX = 0, sY = 0;
    let rX = -24, rY = -34, scale = 1.0;

    function renderCamera(smooth = false) {
      if (smooth) {
        world.style.transition = 'transform 0.35s cubic-bezier(0.2, 0.8, 0.3, 1)';
        setTimeout(() => { world.style.transition = 'transform 0.08s ease-out'; }, 380);
      }
      world.style.transform = \`rotateX(\${rX}deg) rotateY(\${rY}deg) scale3d(\${scale}, \${scale}, \${scale})\`;
    }

    viewport.addEventListener('pointerdown', (e) => {
      if (e.button !== 0) return;
      isDrag = true;
      sX = e.clientX;
      sY = e.clientY;
      viewport.setPointerCapture(e.pointerId);
    });

    viewport.addEventListener('pointermove', (e) => {
      if (!isDrag) return;
      const dx = e.clientX - sX;
      const dy = e.clientY - sY;
      sX = e.clientX;
      sY = e.clientY;
      rY += dx * 0.65;
      rX -= dy * 0.65;
      rX = Math.max(-85, Math.min(85, rX));
      renderCamera(false);
    });

    viewport.addEventListener('pointerup', (e) => {
      isDrag = false;
      try { viewport.releasePointerCapture(e.pointerId); } catch(err) {}
    });

    viewport.addEventListener('wheel', (e) => {
      e.preventDefault();
      scale += e.deltaY * -0.0012;
      scale = Math.max(0.7, Math.min(1.4, scale));
      renderCamera(false);
    }, { passive: false });

    document.getElementById('btn-cam-reset').addEventListener('click', () => {
      rX = -24; rY = -34; scale = 1.0;
      renderCamera(true);
    });
    document.getElementById('btn-zoom-in').addEventListener('click', () => {
      scale = Math.min(1.4, scale + 0.12);
      renderCamera(true);
    });
    document.getElementById('btn-zoom-out').addEventListener('click', () => {
      scale = Math.max(0.7, scale - 0.12);
      renderCamera(true);
    });

    /* =====================================================================
       5. 五大关卡冒险数据 (儿童拟人化动作盘与故事)
       ===================================================================== */
    const ADVENTURE_LEVELS = [
      {
        id: 1,
        title: "小黄花农场",
        icon: "🌼",
        badge: "小园丁勋章",
        task: "拼出白色小十字地基",
        rhyme: "转转顶层对颜色，前门翻滚进土壤！",
        cam: { rX: -26, rY: -34 },
        setup: ["R2", "U'", "F2", "U'"],
        steps: [
          { move: "U", name: "转顶层找朋友", icon: "🌸", desc: "转动顶层，把白色花瓣带到侧面的绿色好朋友旁边！" },
          { move: "F2", name: "翻进土壤 (前门半圈)", icon: "🌱", desc: "前门转两圈（180度）！花瓣一跃落入白色的土地，长出第1根十字臂！" },
          { move: "U", name: "再转顶层找朋友", icon: "🌸", desc: "继续转动顶层，寻找另一个红色好朋友！" },
          { move: "R2", name: "翻进土壤 (右门半圈)", icon: "🌱", desc: "右门转两圈！两片花瓣都回到底层，白色十字地基大功告成！" }
        ],
        buttons: [
          { move: "U", label: "转顶层找朋友", icon: "🌸", color: "bg-amber-500 hover:bg-amber-400" },
          { move: "F2", label: "前门翻入土壤", icon: "🌱", color: "bg-emerald-500 hover:bg-emerald-400" },
          { move: "R2", label: "右门翻入土壤", icon: "🌱", color: "bg-emerald-500 hover:bg-emerald-400" },
          { move: "U'", label: "反向回拨顶层", icon: "↩️", color: "bg-slate-700 hover:bg-slate-600" }
        ]
      },
      {
        id: 2,
        title: "神奇电梯楼",
        icon: "🛗",
        badge: "电梯调度大师",
        task: "接白色小人回到一楼",
        rhyme: "电梯上楼接小人，走进电梯降一楼！",
        cam: { rX: -20, rY: -38 },
        setup: ["U", "R", "U'", "R'"],
        steps: [
          { move: "R", name: "电梯上楼 ⬆️", icon: "🛗", desc: "【电梯上楼】叮咚！右边的电梯升到楼顶接白色小人啦！" },
          { move: "U", name: "走进电梯 ◀️", icon: "🚶", desc: "【走进电梯】白色小人迈开小步，稳稳走进电梯间！" },
          { move: "R'", name: "降回一楼 🔽", icon: "🛗", desc: "【降回一楼】电梯下楼，把小人安全送回一楼房间，地基完好无损！" },
          { move: "U'", name: "门口整理 ▶️", icon: "🚪", desc: "【关门整理】楼上整理好，第一层多了一个快乐的小伙伴！" }
        ],
        buttons: [
          { move: "R", label: "电梯上楼 ⬆️", icon: "🛗", color: "bg-amber-500 hover:bg-amber-400" },
          { move: "U", label: "走进电梯 ◀️", icon: "🚶", color: "bg-sky-500 hover:bg-sky-400" },
          { move: "R'", label: "降回一楼 🔽", icon: "🛗", color: "bg-emerald-500 hover:bg-emerald-400" },
          { move: "U'", label: "门口整理 ▶️", icon: "🚪", color: "bg-slate-700 hover:bg-slate-600" }
        ]
      },
      {
        id: 3,
        title: "森林捉迷藏",
        icon: "🐿️",
        badge: "森林寻宝猎人",
        task: "盖好二楼，完成前两层",
        rhyme: "想去右边往左躲，右手电梯接松鼠！",
        cam: { rX: -26, rY: -34 },
        setup: ["F'", "U'", "F", "U", "R", "U", "R'", "U'"],
        steps: [
          { move: "U", name: "向左躲猫猫 ◀️", icon: "🙈", desc: "【躲猫猫】要去右边槽位的小松鼠，先反方向向左躲开让位！" },
          { move: "R", name: "右手电梯上楼", icon: "⬆️", desc: "右手电梯升起迎接松鼠！" },
          { move: "U'", name: "松鼠跳进电梯", icon: "🐿️", desc: "松鼠与好朋友在楼顶牵手组队！" },
          { move: "R'", name: "降回一楼", icon: "🔽", desc: "降回底层，角块和棱块紧紧抱在了一起！" },
          { move: "U'", name: "侧面让位准备", icon: "◀️", desc: "转身换面，准备接入二楼！" },
          { move: "F'", name: "前门打开迎客", icon: "🚪", desc: "前门打开，引路接应！" },
          { move: "U", name: "松鼠整组滑入", icon: "🎯", desc: "双色组合滑入正轨！" },
          { move: "F", name: "前门关好！大功告成", icon: "✨", desc: "前门关上！二楼整齐划一，前两层全部完工！" }
        ],
        buttons: [
          { move: "U", label: "向左躲猫猫 ◀️", icon: "🙈", color: "bg-sky-500 hover:bg-sky-400" },
          { move: "U'", label: "跳进电梯 ▶️", icon: "🐿️", color: "bg-sky-500 hover:bg-sky-400" },
          { move: "R", label: "右手电梯上 ⬆️", icon: "🛗", color: "bg-amber-500 hover:bg-amber-400" },
          { move: "R'", label: "降回一楼 🔽", icon: "🛗", color: "bg-emerald-500 hover:bg-emerald-400" },
          { move: "F'", label: "前门开门 🚪", icon: "🚪", color: "bg-purple-500 hover:bg-purple-400" },
          { move: "F", label: "关门就位 ✨", icon: "✨", color: "bg-indigo-500 hover:bg-indigo-400" }
        ]
      },
      {
        id: 4,
        title: "金鱼跃龙门",
        icon: "🐟",
        badge: "金鱼驯龙师",
        task: "顶面全部变纯金黄色",
        rhyme: "推上去，拨一下；拉下来，拨一下；推上去，拨两下；拉下来金鱼变金龙！",
        cam: { rX: -56, rY: -34 },
        setup: ["R", "U2", "R'", "U'", "R", "U'", "R'"],
        steps: [
          { move: "R", name: "推上去 (上)", icon: "🌊", desc: "【推上去】小金鱼推起右边一层，浪花激起！" },
          { move: "U", name: "拨一下 (左)", icon: "💦", desc: "【拨一下】向左拨动一朵水花！" },
          { move: "R'", name: "拉下来 (下)", icon: "🌊", desc: "【拉下来】水花落回底层保护结构！" },
          { move: "U", name: "拨一下 (左)", icon: "💦", desc: "【拨一下】再向左拨动一朵水花！" },
          { move: "R", name: "推上去 (上)", icon: "🐬", desc: "【推上去】小金鱼一跃而起，冲向空中！" },
          { move: "U2", name: "拨两下 (转两圈)", icon: "🌀", desc: "【拨两下】在空中转两个大圈圈！" },
          { move: "R'", name: "拉下来！金龙现身", icon: "✨", desc: "【拉下来】扑通！整个顶面瞬间变成纯金黄色！" }
        ],
        buttons: [
          { move: "R", label: "推上去 ⬆️", icon: "🌊", color: "bg-amber-500 hover:bg-amber-400" },
          { move: "U", label: "拨一下 ◀️", icon: "💦", color: "bg-sky-500 hover:bg-sky-400" },
          { move: "R'", label: "拉下来 🔽", icon: "🌊", color: "bg-emerald-500 hover:bg-emerald-400" },
          { move: "U2", label: "拨两圈 🌀", icon: "💫", color: "bg-purple-500 hover:bg-purple-400" }
        ]
      },
      {
        id: 5,
        title: "猫头鹰守卫战",
        icon: "🦉",
        badge: "魔方终极守护者",
        task: "六面彻底重合，全魔方复原！",
        rhyme: "找到猫头鹰双眼，终极魔法大合体！",
        cam: { rX: -36, rY: -36 },
        setup: ["L'", "U2", "L", "U", "L'", "U", "L", "U", "R", "U2", "R'", "U'", "R", "U'", "R'"],
        steps: [
          { move: "R", name: "小鱼第1拍", icon: "⚡", desc: "释放右手小鱼上乘功力！" },
          { move: "U", name: "小鱼第2拍", icon: "⚡", desc: "拨开棱块！" },
          { move: "R'", name: "小鱼第3拍", icon: "⚡", desc: "拉回保护！" },
          { move: "U", name: "小鱼第4拍", icon: "⚡", desc: "传递交接！" },
          { move: "R", name: "小鱼第5拍", icon: "⚡", desc: "起飞升空！" },
          { move: "U2", name: "小鱼第6拍", icon: "⚡", desc: "半圈对接！" },
          { move: "R'", name: "小鱼收尾", icon: "⚡", desc: "右半部就位！" },
          { move: "U'", name: "左侧接力", icon: "⚡", desc: "转向左侧！" },
          { move: "L'", name: "左手小鱼起", icon: "🦉", desc: "左手猫头鹰法阵开启！" },
          { move: "U'", name: "左拨", icon: "🦉", desc: "对齐最后棱位！" },
          { move: "L", name: "左下", icon: "🦉", desc: "嵌入侧槽！" },
          { move: "U'", name: "左拨", icon: "🦉", desc: "校准最后角度！" },
          { move: "L'", name: "左推", icon: "🦉", desc: "拉起底面轨道！" },
          { move: "U2", name: "转半圈", icon: "✨", desc: "六面齿轮彻底咬合！" },
          { move: "L", name: "大功告成！", icon: "🎉", desc: "六个面全部拼好！恭喜成为真正的魔方大师！" }
        ],
        buttons: [
          { move: "R", label: "右手推上去 ⬆️", icon: "⚡", color: "bg-amber-500 hover:bg-amber-400" },
          { move: "R'", label: "右手拉下来 🔽", icon: "⚡", color: "bg-emerald-500 hover:bg-emerald-400" },
          { move: "L'", label: "左手推上去 ⬆️", icon: "🦉", color: "bg-indigo-500 hover:bg-indigo-400" },
          { move: "L", label: "左手拉下来 🔽", icon: "🦉", color: "bg-teal-500 hover:bg-teal-400" },
          { move: "U", label: "顶层顺时针 ◀️", icon: "💨", color: "bg-sky-500 hover:bg-sky-400" },
          { move: "U'", label: "顶层逆时针 ▶️", icon: "↩️", color: "bg-slate-700 hover:bg-slate-600" },
          { move: "U2", label: "空中转半圈 🌀", icon: "✨", color: "bg-purple-500 hover:bg-purple-400" }
        ]
      }
    ];

    /* =====================================================================
       6. 游戏状态与交互流程控制
       ===================================================================== */
    let currentLevelIdx = 0; // 0 ~ 4
    let currentStepIdx = 0;
    let isPlayChallengeMode = false;
    let starsStorage = JSON.parse(localStorage.getItem('rubiks_kids_stars') || '[3, 0, 0, 0, 0]');

    function saveStars() {
      localStorage.setItem('rubiks_kids_stars', JSON.stringify(starsStorage));
      updateTotalStarsUi();
    }

    function updateTotalStarsUi() {
      const sum = starsStorage.reduce((a, b) => a + b, 0);
      document.getElementById('total-stars-count').textContent = sum;

      // 更新关卡标签上的星星
      document.querySelectorAll('.level-tab-btn').forEach((btn, idx) => {
        const starSpan = btn.querySelector('.level-star-badge');
        const s = starsStorage[idx];
        starSpan.textContent = s > 0 ? '⭐'.repeat(s) : '';
      });
    }

    function getLevelData() {
      if (currentLevelIdx === -1 && typeof activeCustomPlan !== 'undefined' && activeCustomPlan) {
        return activeCustomPlan;
      }
      return ADVENTURE_LEVELS[currentLevelIdx] || ADVENTURE_LEVELS[0];
    }

    function loadLevel(levelIdx) {
      currentLevelIdx = levelIdx;
      currentStepIdx = 0;
      const data = getLevelData();

      // UI 文本更新
      document.getElementById('stage-task-text').textContent = data.task;
      document.getElementById('level-rhyme-text').textContent = data.rhyme;

      // 关卡标签高亮
      document.querySelectorAll('.level-tab-btn').forEach((btn, idx) => {
        if (idx === levelIdx) {
          btn.className = 'level-tab-btn flex-1 min-w-[120px] py-2 px-3 rounded-2xl transition flex items-center justify-center gap-1.5 bg-amber-500 text-slate-950 shadow-md font-black';
        } else {
          btn.className = 'level-tab-btn flex-1 min-w-[120px] py-2 px-3 rounded-2xl transition flex items-center justify-center gap-1.5 text-slate-300 hover:bg-slate-700/60 font-bold';
        }
      });

      // 摄像机镜头平滑切换到关卡推荐位置
      if (data.cam) {
        rX = data.cam.rX;
        rY = data.cam.rY;
        scale = 1.0;
        renderCamera(true);
      }

      // 重设魔方并载入本关残局
      rubik.init();
      if (data.setup && data.setup.length > 0) {
        rubik.instantMoves(data.setup);
      }

      renderActionButtons();
      renderStepUi();
    }

    function renderActionButtons() {
      const data = getLevelData();
      const grid = document.getElementById('action-buttons-grid');
      grid.innerHTML = '';

      const targetMove = data.steps[currentStepIdx] ? data.steps[currentStepIdx].move : null;

      data.buttons.forEach(b => {
        const btn = document.createElement('button');
        const isTarget = (b.move === targetMove);
        const guideClass = (!isPlayChallengeMode && isTarget) ? 'guide-pulse ring-4 ring-amber-400/50' : '';

        btn.className = \`p-3 rounded-2xl \${b.color} text-slate-950 font-black text-xs flex items-center justify-between shadow-md transition active:scale-95 \${guideClass}\`;
        btn.innerHTML = \`
          <div class="flex items-center gap-2">
            <span class="text-xl">\${b.icon}</span>
            <span>\${b.label}</span>
          </div>
          <span class="text-[10px] font-mono opacity-60 bg-black/10 px-1.5 py-0.5 rounded">\${b.move}</span>
        \`;

        btn.addEventListener('click', () => {
          handleActionClick(b.move, btn);
        });

        grid.appendChild(btn);
      });
    }

    function renderStepUi() {
      const data = getLevelData();
      const stepTotal = data.steps.length;

      // 更新皮皮狐气泡文本
      if (currentStepIdx < stepTotal) {
        const cur = data.steps[currentStepIdx];
        document.getElementById('step-hint-badge').textContent = \`第 \${currentStepIdx + 1}/\${stepTotal} 步\`;
        document.getElementById('dialog-bubble-text').textContent = cur.desc;
      } else {
        document.getElementById('step-hint-badge').textContent = \`完成啦！\`;
        document.getElementById('dialog-bubble-text').textContent = \`🎉 恭喜小勇士！你亲手完成了整个关卡！\`;
      }

      // 更新步骤点
      const dotsBar = document.getElementById('action-dots-bar');
      dotsBar.innerHTML = '';
      for (let i = 0; i < stepTotal; i++) {
        const dot = document.createElement('span');
        if (i < currentStepIdx) {
          dot.className = 'w-3 h-3 rounded-full bg-emerald-400 inline-block shadow-sm';
        } else if (i === currentStepIdx) {
          dot.className = 'w-3.5 h-3.5 rounded-full bg-amber-400 inline-block animate-ping';
        } else {
          dot.className = 'w-2.5 h-2.5 rounded-full bg-slate-700 inline-block';
        }
        dotsBar.appendChild(dot);
      }

      // 高亮匹配按钮
      renderActionButtons();
    }

    function handleActionClick(moveCode, btnElement = null) {
      if (rubik.isBusy) return;
      const data = getLevelData();

      if (currentStepIdx >= data.steps.length) {
        return;
      }

      const expected = data.steps[currentStepIdx].move;

      // 在挑战模式下，判断按键是否正确
      if (isPlayChallengeMode) {
        if (moveCode !== expected) {
          audio.playWrong();
          if (btnElement) {
            btnElement.classList.add('animate-shake');
            setTimeout(() => btnElement.classList.remove('animate-shake'), 400);
          }
          document.getElementById('dialog-bubble-text').textContent = \`哎呀，这个动作还不对哦！看看儿歌口诀，再试一次吧！\`;
          return;
        }
      }

      // 执行动作
      rubik.performMove(moveCode, () => {
        currentStepIdx++;
        if (currentLevelIdx === -1) {
          renderCustomPlanUi();
        } else {
          renderStepUi();
        }

        // 检查关卡是否全部通关
        if (currentStepIdx >= data.steps.length) {
          if (currentLevelIdx === -1) {
            audio.playVictory();
            launchConfetti();
          } else {
            triggerLevelVictory();
          }
        }
      });
    }

    function triggerLevelVictory() {
      audio.playVictory();
      launchConfetti();

      // 更新星星
      starsStorage[currentLevelIdx] = 3;
      saveStars();

      const data = getLevelData();
      document.getElementById('victory-stage-name').textContent = \`你成功征服了【\${data.title}】！\`;
      document.getElementById('victory-badge-name').textContent = data.badge;

      setTimeout(() => {
        document.getElementById('modal-level-complete').classList.remove('hidden');
      }, 350);
    }

    // 绑定关卡标签点击
    document.querySelectorAll('.level-tab-btn').forEach((btn, idx) => {
      btn.addEventListener('click', () => loadLevel(idx));
    });

    // 听故事演示 vs 小勇士挑战切换
    const btnStory = document.getElementById('mode-btn-story');
    const btnPlay = document.getElementById('mode-btn-play');

    btnStory.addEventListener('click', () => {
      isPlayChallengeMode = false;
      btnStory.className = 'px-3 py-1.5 rounded-xl bg-amber-500 text-slate-950 shadow-sm transition';
      btnPlay.className = 'px-3 py-1.5 rounded-xl text-slate-400 hover:text-white transition';
      renderActionButtons();
    });

    btnPlay.addEventListener('click', () => {
      isPlayChallengeMode = true;
      btnPlay.className = 'px-3 py-1.5 rounded-xl bg-amber-500 text-slate-950 shadow-sm transition';
      btnStory.className = 'px-3 py-1.5 rounded-xl text-slate-400 hover:text-white transition';
      renderActionButtons();
      document.getElementById('dialog-bubble-text').textContent = \`勇士挑战开始！这次没有发光提示，跟着你的记忆亲自通关吧！\`;
    });

    // 走一步快捷键
    document.getElementById('btn-auto-step').addEventListener('click', () => {
      const data = getLevelData();
      if (currentStepIdx < data.steps.length) {
        handleActionClick(data.steps[currentStepIdx].move);
      }
    });

    document.getElementById('btn-restart-level').addEventListener('click', () => {
      loadLevel(currentLevelIdx);
    });

    // 通关弹窗按钮
    document.getElementById('btn-replay-stage').addEventListener('click', () => {
      document.getElementById('modal-level-complete').classList.add('hidden');
      loadLevel(currentLevelIdx);
    });
    document.getElementById('btn-next-stage').addEventListener('click', () => {
      document.getElementById('modal-level-complete').classList.add('hidden');
      let next = currentLevelIdx + 1;
      if (next >= ADVENTURE_LEVELS.length) next = 0;
      loadLevel(next);
    });

    // 静音切换
    document.getElementById('btn-sound-toggle').addEventListener('click', (e) => {
      audio.muted = !audio.muted;
      e.target.textContent = audio.muted ? '🔇' : '🔊';
    });

    /* =====================================================================
       7. 魔法玩具箱与儿童计时器
       ===================================================================== */
    const modalTools = document.getElementById('modal-magic-tools');
    document.getElementById('btn-open-tools').addEventListener('click', () => {
      modalTools.classList.remove('hidden');
    });
    document.getElementById('btn-close-tools').addEventListener('click', () => {
      modalTools.classList.add('hidden');
    });

    // 6次神迹探索
    document.getElementById('btn-magic-six').addEventListener('click', () => {
      modalTools.classList.add('hidden');
      rubik.init();
      // 连续 6 次 Sexy Move
      const sexySix = [];
      for (let i = 0; i < 6; i++) {
        sexySix.push("R", "U", "R'", "U'");
      }
      document.getElementById('stage-task-text').textContent = '见证 6 次神迹循环！';
      document.getElementById('dialog-bubble-text').textContent = '快看！连续做 6 次“电梯接人”，魔方正在奇迹般地自动复原！';
      rubik.enqueueMoves(sexySix, () => {
        audio.playVictory();
        launchConfetti();
        document.getElementById('dialog-bubble-text').textContent = '🎉 哇！做完 6 次真的完全变回原样了！这就是魔方的神奇数学循环！';
      });
    });

    // 儿童拍击计时器
    let timerRunning = false;
    let timerStart = 0;
    let timerInterval = null;

    function toggleTimer() {
      const display = document.getElementById('timer-display');
      const triggerBtn = document.getElementById('btn-timer-trigger');
      if (!timerRunning) {
        timerRunning = true;
        timerStart = Date.now();
        triggerBtn.textContent = '⏱️ 计时中... 拍击这里立即停止！';
        triggerBtn.className = 'w-full py-3 rounded-2xl bg-rose-500 hover:bg-rose-400 text-white font-black text-sm shadow-lg active:scale-95 transition';
        timerInterval = setInterval(() => {
          const diff = (Date.now() - timerStart) / 1000;
          display.textContent = diff.toFixed(2) + ' 秒';
        }, 30);
      } else {
        timerRunning = false;
        clearInterval(timerInterval);
        triggerBtn.textContent = '拍击空格键或点击这里：开始 / 停止计时！';
        triggerBtn.className = 'w-full py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-sm shadow-lg active:scale-95 transition';
        audio.playDing();
      }
    }

    document.getElementById('btn-timer-trigger').addEventListener('click', toggleTimer);

    window.addEventListener('keydown', (e) => {
      if (e.code === 'Space') {
        if (!modalTools.classList.contains('hidden')) {
          e.preventDefault();
          toggleTimer();
        }
      }
    });

    // 玩具箱沙盒打乱与复原
    document.getElementById('btn-sandbox-scramble').addEventListener('click', () => {
      modalTools.classList.add('hidden');
      const allMoves = ["U", "U'", "D", "D'", "L", "L'", "R", "R'", "F", "F'", "B", "B'"];
      const scr = [];
      for (let i = 0; i < 15; i++) scr.push(allMoves[Math.floor(Math.random() * allMoves.length)]);
      rubik.enqueueMoves(scr);
    });

    document.getElementById('btn-sandbox-solve').addEventListener('click', () => {
      modalTools.classList.add('hidden');
      rubik.init();
      audio.playDing();
    });

    /* =====================================================================
       8. 实物魔方 54 贴纸映射与涂色面板逻辑
       ===================================================================== */
    const FACELET_MAP = {
      'U0': { pos: [-1, -1, -1], dir: 'u' }, 'U1': { pos: [0, -1, -1],  dir: 'u' }, 'U2': { pos: [1, -1, -1],  dir: 'u' },
      'U3': { pos: [-1, -1, 0],  dir: 'u' }, 'U4': { pos: [0, -1, 0],   dir: 'u', locked: 'Y' }, 'U5': { pos: [1, -1, 0],   dir: 'u' },
      'U6': { pos: [-1, -1, 1],  dir: 'u' }, 'U7': { pos: [0, -1, 1],   dir: 'u' }, 'U8': { pos: [1, -1, 1],   dir: 'u' },
      'D0': { pos: [-1, 1, 1],   dir: 'd' }, 'D1': { pos: [0, 1, 1],    dir: 'd' }, 'D2': { pos: [1, 1, 1],    dir: 'd' },
      'D3': { pos: [-1, 1, 0],   dir: 'd' }, 'D4': { pos: [0, 1, 0],    dir: 'd', locked: 'W' }, 'D5': { pos: [1, 1, 0],    dir: 'd' },
      'D6': { pos: [-1, 1, -1],  dir: 'd' }, 'D7': { pos: [0, 1, -1],   dir: 'd' }, 'D8': { pos: [1, 1, -1],   dir: 'd' },
      'F0': { pos: [-1, -1, 1],  dir: 'f' }, 'F1': { pos: [0, -1, 1],   dir: 'f' }, 'F2': { pos: [1, -1, 1],   dir: 'f' },
      'F3': { pos: [-1, 0, 1],   dir: 'f' }, 'F4': { pos: [0, 0, 1],    dir: 'f', locked: 'R' }, 'F5': { pos: [1, 0, 1],    dir: 'f' },
      'F6': { pos: [-1, 1, 1],   dir: 'f' }, 'F7': { pos: [0, 1, 1],    dir: 'f' }, 'F8': { pos: [1, 1, 1],    dir: 'f' },
      'B0': { pos: [1, -1, -1],  dir: 'b' }, 'B1': { pos: [0, -1, -1],  dir: 'b' }, 'B2': { pos: [-1, -1, -1], dir: 'b' },
      'B3': { pos: [1, 0, -1],   dir: 'b' }, 'B4': { pos: [0, 0, -1],   dir: 'b', locked: 'O' }, 'B5': { pos: [-1, 0, -1],  dir: 'b' },
      'B6': { pos: [1, 1, -1],   dir: 'b' }, 'B7': { pos: [0, 1, -1],   dir: 'b' }, 'B8': { pos: [-1, 1, -1],  dir: 'b' },
      'L0': { pos: [-1, -1, -1], dir: 'l' }, 'L1': { pos: [-1, -1, 0],  dir: 'l' }, 'L2': { pos: [-1, -1, 1],  dir: 'l' },
      'L3': { pos: [-1, 0, -1],  dir: 'l' }, 'L4': { pos: [-1, 0, 0],   dir: 'l', locked: 'B' }, 'L5': { pos: [-1, 0, 1],   dir: 'l' },
      'L6': { pos: [-1, 1, -1],  dir: 'l' }, 'L7': { pos: [-1, 1, 0],   dir: 'l' }, 'L8': { pos: [-1, 1, 1],   dir: 'l' },
      'R0': { pos: [1, -1, 1],   dir: 'r' }, 'R1': { pos: [1, -1, 0],   dir: 'r' }, 'R2': { pos: [1, -1, -1],  dir: 'r' },
      'R3': { pos: [1, 0, 1],    dir: 'r' }, 'R4': { pos: [1, 0, 0],    dir: 'r', locked: 'G' }, 'R5': { pos: [1, 0, -1],   dir: 'r' },
      'R6': { pos: [1, 1, 1],    dir: 'r' }, 'R7': { pos: [1, 1, 0],    dir: 'r' }, 'R8': { pos: [1, 1, -1],   dir: 'r' }
    };

    const COLOR_CLASSES = {
      'Y': 'sticker-u', 'W': 'sticker-d', 'R': 'sticker-f',
      'O': 'sticker-b', 'B': 'sticker-l', 'G': 'sticker-r', 'none': 'sticker-none'
    };

    const COLOR_NAMES = {
      'Y': '黄色 (顶)', 'W': '白色 (底)', 'R': '红色 (前)',
      'O': '橙色 (后)', 'B': '蓝色 (左)', 'G': '绿色 (右)'
    };

    const COLOR_HEX = {
      'Y': '#facc15', 'W': '#ffffff', 'R': '#ef4444',
      'O': '#f97316', 'B': '#3b82f6', 'G': '#10b981'
    };

    let paintedState = {};

    function initPaintedStateSolved() {
      ['U', 'D', 'F', 'B', 'L', 'R'].forEach(f => {
        const c = (f==='U'?'Y':(f==='D'?'W':(f==='F'?'R':(f==='B'?'O':(f==='L'?'B':'G')))));
        for (let i = 0; i < 9; i++) {
          paintedState[\`\${f}\${i}\`] = c;
        }
      });
    }
    initPaintedStateSolved();

    const COLOR_CYCLE = ['Y', 'W', 'R', 'O', 'B', 'G'];
    const FACE_NAMES_CN = { 'U': '顶面(黄)', 'D': '底面(白)', 'F': '前面(红)', 'B': '后面(橙)', 'L': '左面(蓝)', 'R': '右面(绿)' };
    const POS_NAMES_CN = { '0': '左上角', '1': '上棱', '2': '右上角', '3': '左棱', '4': '中心(锁定)', '5': '右棱', '6': '左下角', '7': '下棱', '8': '右下角' };

    let currentBrush = 'Y';
    let selectedTileKey = null;

    function updatePaletteButtonsHighlight() {
      document.querySelectorAll('.palette-btn').forEach(b => {
        if (b.getAttribute('data-color') === currentBrush) {
          b.classList.remove('border-transparent');
          b.classList.add('border-amber-400', 'ring-2', 'ring-amber-400/60', 'scale-105');
        } else {
          b.classList.remove('border-amber-400', 'ring-2', 'ring-amber-400/60', 'scale-105');
          b.classList.add('border-transparent');
        }
      });
    }

    function selectTile(key) {
      if (!key) return;
      selectedTileKey = key;

      // 更新所有格子样式的高亮
      document.querySelectorAll('[id^="tile-"]').forEach(t => {
        t.classList.remove('ring-4', 'ring-amber-400', 'scale-110', 'z-20', 'shadow-lg');
      });

      const targetEl = document.getElementById(\`tile-\${key}\`);
      if (targetEl) {
        targetEl.classList.add('ring-4', 'ring-amber-400', 'scale-110', 'z-20', 'shadow-lg');
      }

      // 更新选中状态说明条
      const badge = document.getElementById('selected-tile-badge');
      if (badge) {
        const face = key[0];
        const pos = key[1];
        const colorName = COLOR_NAMES[paintedState[key]] || '未涂色';
        badge.textContent = \`🎯 \${FACE_NAMES_CN[face]} \${POS_NAMES_CN[pos]} (当前: \${colorName})\`;
      }
    }

    function setTileColor(key, colorCode) {
      if (!key || key[1] === '4') return; // 中心块锁定不修改
      paintedState[key] = colorCode;
      const tile = document.getElementById(\`tile-\${key}\`);
      if (tile) {
        tile.style.backgroundColor = COLOR_HEX[colorCode] || '#1e293b';
      }
      currentBrush = colorCode;
      updatePaletteButtonsHighlight();
      updateColorCountBadges();
      selectTile(key);
    }

    function cycleTileColor(key) {
      if (key[1] === '4') {
        audio.playWrong();
        return;
      }
      const cur = paintedState[key] || 'none';
      const curIdx = COLOR_CYCLE.indexOf(cur);
      const nextColor = (curIdx === -1) ? 'Y' : COLOR_CYCLE[(curIdx + 1) % COLOR_CYCLE.length];
      
      setTileColor(key, nextColor);
      audio.playTone(360 + (curIdx + 1) * 45, 'sine', 0.05, 0.12);
    }

    const CUBIE_GROUPS = {};
    for (const [k, v] of Object.entries(FACELET_MAP)) {
      const pKey = v.pos.join(',');
      if (!CUBIE_GROUPS[pKey]) CUBIE_GROUPS[pKey] = [];
      CUBIE_GROUPS[pKey].push(k);
    }

    function renderColorInputGrids() {
      ['u', 'd', 'f', 'b', 'l', 'r'].forEach(f => {
        const grid = document.getElementById(\`face-grid-\${f}\`);
        if (!grid) return;
        grid.innerHTML = '';
        const fUpper = f.toUpperCase();

        for (let i = 0; i < 9; i++) {
          const key = \`\${fUpper}\${i}\`;
          const isCenter = (i === 4);
          const tile = document.createElement('div');
          const colorCode = paintedState[key] || 'none';

          tile.id = \`tile-\${key}\`;
          tile.className = \`w-6 h-6 sm:w-7 sm:h-7 rounded-lg border border-slate-700/80 cursor-pointer transition transform active:scale-95 flex items-center justify-center text-[9px] font-black shadow-inner\`;
          tile.style.backgroundColor = COLOR_HEX[colorCode] || '#1e293b';

          // 物理块联动高亮提示
          tile.addEventListener('mouseenter', () => {
            const pKey = FACELET_MAP[key].pos.join(',');
            const sisters = CUBIE_GROUPS[pKey] || [];
            sisters.forEach(sk => {
              const el = document.getElementById('tile-' + sk);
              if (el && el !== tile) el.classList.add('ring-2', 'ring-sky-400');
            });
          });
          tile.addEventListener('mouseleave', () => {
            const pKey = FACELET_MAP[key].pos.join(',');
            const sisters = CUBIE_GROUPS[pKey] || [];
            sisters.forEach(sk => {
              const el = document.getElementById('tile-' + sk);
              if (el && el !== tile) el.classList.remove('ring-2', 'ring-sky-400');
            });
          });

          if (isCenter) {
            tile.classList.add('cursor-not-allowed', 'ring-1', 'ring-white/40');
            tile.innerHTML = \`<span class="opacity-60 text-slate-950 font-bold text-[10px]">🔒</span>\`;
            tile.title = "中心块朝向固定，不可更改";
            tile.addEventListener('click', () => {
              audio.playWrong();
            });
          } else {
            tile.title = "点击可直接切换颜色，同一积木块会联动发光";
            tile.addEventListener('click', () => {
              // 点击色块直接轮转颜色，并选中它
              cycleTileColor(key);
            });
          }
          grid.appendChild(tile);
        }
      });
      updatePaletteButtonsHighlight();
      updateColorCountBadges();
      if (selectedTileKey) selectTile(selectedTileKey);
    }

    function updateColorCountBadges() {
      const counts = { 'Y': 0, 'W': 0, 'R': 0, 'O': 0, 'B': 0, 'G': 0 };
      Object.values(paintedState).forEach(c => {
        if (counts[c] !== undefined) counts[c]++;
      });

      let allExactNine = true;
      ['Y', 'W', 'R', 'O', 'B', 'G'].forEach(c => {
        const badge = document.getElementById(\`count-\${c}\`);
        if (badge) {
          badge.textContent = \`\${counts[c]}/9\`;
          if (counts[c] === 9) {
            badge.className = 'text-[10px] font-mono text-emerald-400 font-bold';
          } else {
            badge.className = 'text-[10px] font-mono text-amber-300 font-bold';
            allExactNine = false;
          }
        }
      });
      return allExactNine;
    }

    // 绑定 6 色快捷拾色按钮
    document.querySelectorAll('.palette-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const color = btn.getAttribute('data-color');
        currentBrush = color;
        updatePaletteButtonsHighlight();

        if (selectedTileKey && selectedTileKey[1] !== '4') {
          // 如果当前有选中的非中心色块，直接给它赋色！
          setTileColor(selectedTileKey, color);
          audio.playDing();
        } else {
          audio.playTone(520, 'sine', 0.06, 0.1);
        }
      });
    });

    const modalColorInput = document.getElementById('modal-color-input');
    const modalDiagnostic = document.getElementById('modal-diagnostic-report');

    document.getElementById('btn-open-color-input').addEventListener('click', () => {
      renderColorInputGrids();
      modalColorInput.classList.remove('hidden');
      audio.playDing();
    });

    document.getElementById('btn-close-color-modal').addEventListener('click', () => {
      modalColorInput.classList.add('hidden');
    });

    function resetNonCentersToNone() {
      ['U', 'D', 'F', 'B', 'L', 'R'].forEach(f => {
        for (let i = 0; i < 9; i++) {
          if (i !== 4) paintedState[\`\${f}\${i}\`] = 'none';
        }
      });
      paintedState['U4'] = 'Y'; paintedState['D4'] = 'W'; paintedState['F4'] = 'R';
      paintedState['B4'] = 'O'; paintedState['L4'] = 'B'; paintedState['R4'] = 'G';
    }

    // 阶段模板 1: 底层白色十字已拼好
    document.getElementById('btn-preset-cross').addEventListener('click', () => {
      resetNonCentersToNone();
      paintedState['D1'] = 'W'; paintedState['F7'] = 'R';
      paintedState['D5'] = 'W'; paintedState['R7'] = 'G';
      paintedState['D7'] = 'W'; paintedState['B7'] = 'O';
      paintedState['D3'] = 'W'; paintedState['L7'] = 'B';
      selectedTileKey = null;
      renderColorInputGrids();
      const badge = document.getElementById('selected-tile-badge');
      if (badge) badge.textContent = '🌼 已套用底十字基准，只需录入剩余角块和中高层';
      audio.playDing();
    });

    // 阶段模板 2: 第一层已拼好
    document.getElementById('btn-preset-layer1').addEventListener('click', () => {
      resetNonCentersToNone();
      for (let i = 0; i < 9; i++) paintedState['D' + i] = 'W';
      paintedState['F6'] = 'R'; paintedState['F7'] = 'R'; paintedState['F8'] = 'R';
      paintedState['R6'] = 'G'; paintedState['R7'] = 'G'; paintedState['R8'] = 'G';
      paintedState['B6'] = 'O'; paintedState['B7'] = 'O'; paintedState['B8'] = 'O';
      paintedState['L6'] = 'B'; paintedState['L7'] = 'B'; paintedState['L8'] = 'B';
      selectedTileKey = null;
      renderColorInputGrids();
      const badge = document.getElementById('selected-tile-badge');
      if (badge) badge.textContent = '🏢 已套用第一层基准（底层+侧边全好），只需微调中层与顶层';
      audio.playDing();
    });

    // 阶段模板 3: 前两层已拼好 (F2L)
    document.getElementById('btn-preset-f2l').addEventListener('click', () => {
      resetNonCentersToNone();
      for (let i = 0; i < 9; i++) paintedState['D' + i] = 'W';
      paintedState['F6'] = 'R'; paintedState['F7'] = 'R'; paintedState['F8'] = 'R';
      paintedState['R6'] = 'G'; paintedState['R7'] = 'G'; paintedState['R8'] = 'G';
      paintedState['B6'] = 'O'; paintedState['B7'] = 'O'; paintedState['B8'] = 'O';
      paintedState['L6'] = 'B'; paintedState['L7'] = 'B'; paintedState['L8'] = 'B';
      paintedState['F3'] = 'R'; paintedState['F5'] = 'R';
      paintedState['R3'] = 'G'; paintedState['R5'] = 'G';
      paintedState['B3'] = 'O'; paintedState['B5'] = 'O';
      paintedState['L3'] = 'B'; paintedState['L5'] = 'B';
      selectedTileKey = null;
      renderColorInputGrids();
      const badge = document.getElementById('selected-tile-badge');
      if (badge) badge.textContent = '🌲 已套用前两层基准（一楼二楼全好），只需点选顶层 8 个块！';
      audio.playDing();
    });

    // 阶段模板 4: 顶面小鱼形态
    document.getElementById('btn-preset-fish').addEventListener('click', () => {
      resetNonCentersToNone();
      for (let i = 0; i < 9; i++) paintedState['D' + i] = 'W';
      paintedState['F6'] = 'R'; paintedState['F7'] = 'R'; paintedState['F8'] = 'R';
      paintedState['R6'] = 'G'; paintedState['R7'] = 'G'; paintedState['R8'] = 'G';
      paintedState['B6'] = 'O'; paintedState['B7'] = 'O'; paintedState['B8'] = 'O';
      paintedState['L6'] = 'B'; paintedState['L7'] = 'B'; paintedState['L8'] = 'B';
      paintedState['F3'] = 'R'; paintedState['F5'] = 'R';
      paintedState['R3'] = 'G'; paintedState['R5'] = 'G';
      paintedState['B3'] = 'O'; paintedState['B5'] = 'O';
      paintedState['L3'] = 'B'; paintedState['L5'] = 'B';
      // 顶面黄色十字 + 1角块黄色在 U6 (左下角小鱼)
      paintedState['U1'] = 'Y'; paintedState['U3'] = 'Y'; paintedState['U5'] = 'Y'; paintedState['U7'] = 'Y';
      paintedState['U6'] = 'Y';
      paintedState['F1'] = 'R'; paintedState['R1'] = 'G'; paintedState['B1'] = 'O'; paintedState['L1'] = 'B';
      paintedState['F2'] = 'Y'; paintedState['R2'] = 'Y'; paintedState['B2'] = 'Y';
      paintedState['U0'] = 'B'; paintedState['U2'] = 'R'; paintedState['U8'] = 'G';
      paintedState['F0'] = 'R'; paintedState['R0'] = 'G'; paintedState['B0'] = 'O'; paintedState['L0'] = 'B'; paintedState['L2'] = 'B';
      selectedTileKey = null;
      renderColorInputGrids();
      const badge = document.getElementById('selected-tile-badge');
      if (badge) badge.textContent = '🐟 已载入经典顶面小鱼形态！';
      audio.playVictory();
    });

    // 物理规则智能自动推导补全算法
    function autoCompleteRemaining() {
      const counts = { 'Y': 0, 'W': 0, 'R': 0, 'O': 0, 'B': 0, 'G': 0 };
      Object.values(paintedState).forEach(c => {
        if (counts[c] !== undefined) counts[c]++;
      });

      const getNeedList = () => {
        const list = [];
        ['Y', 'W', 'R', 'O', 'B', 'G'].forEach(c => {
          const rem = 9 - counts[c];
          for (let i = 0; i < rem; i++) list.push(c);
        });
        return list;
      };

      const corners = Object.values(CUBIE_GROUPS).filter(g => g.length === 3);
      const edges = Object.values(CUBIE_GROUPS).filter(g => g.length === 2);

      // 角块补全
      corners.forEach(keys => {
        const filled = keys.filter(k => paintedState[k] && paintedState[k] !== 'none');
        const empty = keys.filter(k => !paintedState[k] || paintedState[k] === 'none');
        if (filled.length === 2 && empty.length === 1) {
          const c1 = paintedState[filled[0]], c2 = paintedState[filled[1]];
          let candidate = ['Y', 'W', 'R', 'O', 'B', 'G'].find(c => {
            return c !== c1 && c !== c2 && counts[c] < 9;
          });
          if (candidate) {
            paintedState[empty[0]] = candidate;
            counts[candidate]++;
          }
        }
      });

      // 棱块补全
      edges.forEach(keys => {
        const filled = keys.filter(k => paintedState[k] && paintedState[k] !== 'none');
        const empty = keys.filter(k => !paintedState[k] || paintedState[k] === 'none');
        if (filled.length === 1 && empty.length === 1) {
          const c1 = paintedState[filled[0]];
          let candidate = ['Y', 'W', 'R', 'O', 'B', 'G'].find(c => {
            return c !== c1 && counts[c] < 9;
          });
          if (candidate) {
            paintedState[empty[0]] = candidate;
            counts[candidate]++;
          }
        }
      });

      // 剩余任何未填格，按配额贪心填满
      const unassigned = Object.keys(paintedState).filter(k => !paintedState[k] || paintedState[k] === 'none');
      const need = getNeedList();
      unassigned.forEach((k, idx) => {
        if (idx < need.length) {
          paintedState[k] = need[idx];
          counts[need[idx]]++;
        }
      });

      renderColorInputGrids();
      audio.playVictory();
    }

    document.getElementById('btn-auto-complete').addEventListener('click', () => {
      autoCompleteRemaining();
      const badge = document.getElementById('selected-tile-badge');
      if (badge) badge.textContent = '✨ 物理规则自动推导补全成功！全部满足 9 个';
    });

    document.getElementById('btn-color-reset-solved').addEventListener('click', () => {
      initPaintedStateSolved();
      selectedTileKey = null;
      renderColorInputGrids();
      const badge = document.getElementById('selected-tile-badge');
      if (badge) badge.textContent = '👉 点选上方任意色块';
      audio.playTone(600, 'sine', 0.08, 0.1);
    });

    document.getElementById('btn-color-clear').addEventListener('click', () => {
      resetNonCentersToNone();
      selectedTileKey = null;
      renderColorInputGrids();
      const badge = document.getElementById('selected-tile-badge');
      if (badge) badge.textContent = '👉 点选上方任意色块';
      audio.playWrong();
    });

    /* =====================================================================
       9. 智能阶段诊断与 3D 实物带练引擎
       ===================================================================== */
    function applyPaintedStateToCube() {
      rubik.cubies.forEach(c => {
        c.mat = [[1, 0, 0], [0, 1, 0], [0, 0, 1]];
        rubik.updateStyle(c);

        const faces = c.el.querySelectorAll('.face');
        faces.forEach(faceDiv => {
          let dir = '';
          if (faceDiv.classList.contains('face-u')) dir = 'u';
          else if (faceDiv.classList.contains('face-d')) dir = 'd';
          else if (faceDiv.classList.contains('face-f')) dir = 'f';
          else if (faceDiv.classList.contains('face-b')) dir = 'b';
          else if (faceDiv.classList.contains('face-l')) dir = 'l';
          else if (faceDiv.classList.contains('face-r')) dir = 'r';

          const stickerDiv = faceDiv.querySelector('.sticker');
          let matchedKey = null;
          for (const [k, v] of Object.entries(FACELET_MAP)) {
            if (v.dir === dir && v.pos[0] === c.pos[0] && v.pos[1] === c.pos[1] && v.pos[2] === c.pos[2]) {
              matchedKey = k;
              break;
            }
          }

          if (matchedKey && paintedState[matchedKey]) {
            const colorCode = paintedState[matchedKey];
            stickerDiv.className = \`sticker \${COLOR_CLASSES[colorCode] || 'sticker-none'}\`;
          } else {
            stickerDiv.className = \`sticker sticker-none\`;
          }
        });
      });
    }

    function diagnoseCube() {
      const isNine = updateColorCountBadges();
      if (!isNine) {
        alert("小勇士注意：有格子还没涂好，请确认每种颜色都刚好是 9 个哦！");
        return null;
      }

      // 阶段 1: 白色底十字
      const dfWhite = (paintedState['D1'] === 'W' && paintedState['F7'] === 'R');
      const drWhite = (paintedState['D5'] === 'W' && paintedState['R7'] === 'G');
      const dbWhite = (paintedState['D7'] === 'W' && paintedState['B7'] === 'O');
      const dlWhite = (paintedState['D3'] === 'W' && paintedState['L7'] === 'B');
      const crossDone = (dfWhite && drWhite && dbWhite && dlWhite);

      // 阶段 2: 第一层角块
      const dflDone = (paintedState['D0'] === 'W' && paintedState['F6'] === 'R' && paintedState['L8'] === 'B');
      const dfrDone = (paintedState['D2'] === 'W' && paintedState['F8'] === 'R' && paintedState['R6'] === 'G');
      const dbrDone = (paintedState['D8'] === 'W' && paintedState['B6'] === 'O' && paintedState['R8'] === 'G');
      const dblDone = (paintedState['D6'] === 'W' && paintedState['B8'] === 'O' && paintedState['L6'] === 'B');
      const firstLayerDone = crossDone && (dflDone && dfrDone && dbrDone && dblDone);

      // 阶段 3: 第二层中层棱块
      const flDone = (paintedState['F3'] === 'R' && paintedState['L5'] === 'B');
      const frDone = (paintedState['F5'] === 'R' && paintedState['R3'] === 'G');
      const brDone = (paintedState['B3'] === 'O' && paintedState['R5'] === 'G');
      const blDone = (paintedState['B5'] === 'O' && paintedState['L3'] === 'B');
      const f2lDone = firstLayerDone && (flDone && frDone && brDone && blDone);

      // 阶段 4: 顶面黄色 (OLL)
      const uEdgesYellow = [paintedState['U1'], paintedState['U3'], paintedState['U5'], paintedState['U7']].filter(c => c === 'Y').length;
      const uCornersYellow = [paintedState['U0'], paintedState['U2'], paintedState['U6'], paintedState['U8']].filter(c => c === 'Y').length;
      const yellowCrossDone = (uEdgesYellow === 4);
      const yellowFaceDone = (yellowCrossDone && uCornersYellow === 4);

      // 阶段 5: 全魔方复原
      const allSolved = Object.keys(FACELET_MAP).every(k => {
        const expectedFace = k[0];
        const expColor = (expectedFace==='U'?'Y':(expectedFace==='D'?'W':(expectedFace==='F'?'R':(expectedFace==='B'?'O':(expectedFace==='L'?'B':'G')))));
        return paintedState[k] === expColor;
      });

      return {
        crossDone, firstLayerDone, f2lDone,
        uEdgesYellow, uCornersYellow, yellowCrossDone, yellowFaceDone, allSolved
      };
    }

    let activeCustomPlan = null;

    document.getElementById('btn-run-diagnostic').addEventListener('click', () => {
      const diag = diagnoseCube();
      if (!diag) return;

      modalColorInput.classList.add('hidden');
      audio.playVictory();

      const list = document.getElementById('diagnostic-checklist');
      list.innerHTML = '';

      function addItem(title, isOk, extraInfo = '') {
        const div = document.createElement('div');
        div.className = \`p-2.5 rounded-xl border flex items-center justify-between \${
          isOk ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300 font-bold' : 'bg-slate-800/80 border-slate-700 text-slate-300'
        }\`;
        div.innerHTML = \`
          <div class="flex items-center gap-2">
            <span>\${isOk ? '✅' : '⏳'}</span>
            <span>\${title}</span>
          </div>
          <span class="text-[11px] font-mono opacity-80">\${extraInfo}</span>
        \`;
        list.appendChild(div);
      }

      addItem('第1关：小黄花与底十字', diag.crossDone, diag.crossDone ? '完美对齐' : '未完整');
      addItem('第2关：神奇电梯楼(第一层)', diag.firstLayerDone, diag.firstLayerDone ? '一楼全拼好' : '差部分角块');
      addItem('第3关：森林捉迷藏(第二层)', diag.f2lDone, diag.f2lDone ? '前两层已完成' : '中棱未全');
      addItem('第4关：金鱼跃龙门(顶面全黄)', diag.yellowFaceDone, diag.yellowFaceDone ? '顶面纯金黄' : (diag.yellowCrossDone ? '已是小鱼/翻色态' : \`黄棱数: \${diag.uEdgesYellow}/4\`));
      addItem('第5关：猫头鹰守卫(六面全解)', diag.allSolved, diag.allSolved ? '🎉 已完全复原' : '只差最后一步');

      let summaryText = "";
      let targetLevelRef = 0;
      let planTitle = "实物定制带练";
      let planSteps = [];
      let planButtons = [];

      if (diag.allSolved) {
        summaryText = "太厉害啦！你手里的魔方其实已经全拼好啦！六个面全部严丝合缝！";
        targetLevelRef = 4;
        planSteps = [{ move: "U", name: "巡视六面", icon: "✨", desc: "魔方已经完全复原，随时可以重新打乱挑战！" }];
        planButtons = [{ move: "U", label: "巡视魔方", icon: "✨", color: "bg-emerald-500 hover:bg-emerald-400" }];
      } else if (!diag.crossDone) {
        summaryText = "手里的魔方处于【第 1 关：小黄花农场】阶段！我们先在顶层找白花瓣，对齐侧面颜色转半圈，立即搞定白色十字！";
        targetLevelRef = 0;
        planSteps = ADVENTURE_LEVELS[0].steps;
        planButtons = ADVENTURE_LEVELS[0].buttons;
      } else if (!diag.firstLayerDone) {
        summaryText = "白色地基十字已经打好啦！当前处于【第 2 关：神奇电梯楼】！我们要用【电梯接人法】把白色小人一个个送回家！";
        targetLevelRef = 1;
        planSteps = ADVENTURE_LEVELS[1].steps;
        planButtons = ADVENTURE_LEVELS[1].buttons;
      } else if (!diag.f2lDone) {
        summaryText = "一楼地基已经稳固，目前处于【第 3 关：森林捉迷藏】！我们要用反向躲猫猫把二楼中层棱块全部嵌进去！";
        targetLevelRef = 2;
        planSteps = ADVENTURE_LEVELS[2].steps;
        planButtons = ADVENTURE_LEVELS[2].buttons;
      } else if (!diag.yellowFaceDone) {
        summaryText = "前两层都搞定了，真棒！目前处于【第 4 关：金鱼跃龙门】！把小黄鱼的鱼头摆在左下角，念口诀：推上去拨一下、拉下来拨一下，瞬间变金龙！";
        targetLevelRef = 3;
        planSteps = ADVENTURE_LEVELS[3].steps;
        planButtons = ADVENTURE_LEVELS[3].buttons;
      } else {
        summaryText = "顶面金黄已经拿下！只差最后【第 5 关：猫头鹰双眼】收尾！寻找侧面的双眼车灯，施展终极合体魔法！";
        targetLevelRef = 4;
        planSteps = ADVENTURE_LEVELS[4].steps;
        planButtons = ADVENTURE_LEVELS[4].buttons;
      }

      document.getElementById('diagnostic-summary-text').textContent = summaryText;
      modalDiagnostic.classList.remove('hidden');

      activeCustomPlan = {
        targetLevelRef,
        planTitle,
        summaryText,
        steps: planSteps,
        buttons: planButtons
      };
    });

    document.getElementById('btn-close-diagnostic').addEventListener('click', () => {
      modalDiagnostic.classList.add('hidden');
    });

    document.getElementById('btn-start-custom-guidance').addEventListener('click', () => {
      if (!activeCustomPlan) return;
      modalDiagnostic.classList.add('hidden');

      // 同步实物贴纸到 3D 舞台
      rubik.init();
      applyPaintedStateToCube();

      // 显示并激活定制实物带练标签
      const tabCustom = document.getElementById('tab-custom-solve');
      tabCustom.classList.remove('hidden');

      // 绑定定制数据并切换
      currentLevelIdx = -1; // -1 表示定制实物模式
      currentStepIdx = 0;

      document.querySelectorAll('.level-tab-btn').forEach(b => {
        b.className = 'level-tab-btn flex-1 min-w-[120px] py-2 px-3 rounded-2xl transition flex items-center justify-center gap-1.5 text-slate-300 hover:bg-slate-700/60 font-bold';
      });
      tabCustom.className = 'level-tab-btn min-w-[130px] py-2 px-3 rounded-2xl transition flex items-center justify-center gap-1.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-black shadow-md';

      document.getElementById('stage-task-text').textContent = '手里的真实魔方专属带练';
      document.getElementById('level-rhyme-text').textContent = activeCustomPlan.summaryText;

      // 替换当前动作按钮与步骤
      renderCustomPlanUi();
      audio.playVictory();
    });

    function renderCustomPlanUi() {
      if (!activeCustomPlan) return;
      const data = activeCustomPlan;
      const grid = document.getElementById('action-buttons-grid');
      grid.innerHTML = '';

      const targetMove = data.steps[currentStepIdx] ? data.steps[currentStepIdx].move : null;

      data.buttons.forEach(b => {
        const btn = document.createElement('button');
        const isTarget = (b.move === targetMove);
        const guideClass = (!isPlayChallengeMode && isTarget) ? 'guide-pulse ring-4 ring-amber-400/50' : '';

        btn.className = \`p-3 rounded-2xl \${b.color} text-slate-950 font-black text-xs flex items-center justify-between shadow-md transition active:scale-95 \${guideClass}\`;
        btn.innerHTML = \`
          <div class="flex items-center gap-2">
            <span class="text-xl">\${b.icon}</span>
            <span>\${b.label}</span>
          </div>
          <span class="text-[10px] font-mono opacity-60 bg-black/10 px-1.5 py-0.5 rounded">\${b.move}</span>
        \`;

        btn.addEventListener('click', () => {
          handleActionClick(b.move, btn);
        });

        grid.appendChild(btn);
      });

      // 更新皮皮狐气泡文本与引导手势
      const stepTotal = data.steps.length;
      if (currentStepIdx < stepTotal) {
        const cur = data.steps[currentStepIdx];
        document.getElementById('step-hint-badge').textContent = \`第 \${currentStepIdx + 1}/\${stepTotal} 步\`;
        document.getElementById('dialog-bubble-text').textContent = \`👉 请拿起你手里的真实魔方：执行【\${cur.name}】！\${cur.desc}\`;
      } else {
        document.getElementById('step-hint-badge').textContent = \`完成！\`;
        document.getElementById('dialog-bubble-text').textContent = \`🎉 恭喜小勇士！本阶段已完全攻克，手里的魔方已经成功升级！\`;
      }

      // 更新步骤点
      const dotsBar = document.getElementById('action-dots-bar');
      dotsBar.innerHTML = '';
      for (let i = 0; i < stepTotal; i++) {
        const dot = document.createElement('span');
        if (i < currentStepIdx) {
          dot.className = 'w-3 h-3 rounded-full bg-emerald-400 inline-block shadow-sm';
        } else if (i === currentStepIdx) {
          dot.className = 'w-3.5 h-3.5 rounded-full bg-amber-400 inline-block animate-ping';
        } else {
          dot.className = 'w-2.5 h-2.5 rounded-full bg-slate-700 inline-block';
        }
        dotsBar.appendChild(dot);
      }
    }

    /* =====================================================================
       12. PWA 桌面应用化与 Service Worker 离线引擎
       ===================================================================== */
    let deferredPrompt = null;
    const btnPwaInstall = document.getElementById('btn-pwa-install');
    const modalPwa = document.getElementById('modal-pwa-install');
    const btnClosePwa = document.getElementById('btn-close-pwa-modal');
    const btnPwaKnow = document.getElementById('btn-pwa-know');
    const nativeBox = document.getElementById('pwa-native-install-box');
    const btnTriggerInstall = document.getElementById('btn-pwa-trigger-install');

    if (btnPwaInstall && modalPwa) {
      btnPwaInstall.addEventListener('click', () => {
        audio.playClick();
        modalPwa.classList.remove('hidden');
      });
    }
    if (btnClosePwa && modalPwa) {
      btnClosePwa.addEventListener('click', () => modalPwa.classList.add('hidden'));
    }
    if (btnPwaKnow && modalPwa) {
      btnPwaKnow.addEventListener('click', () => modalPwa.classList.add('hidden'));
    }

    // Android/Chrome 原生安装事件捕获
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      deferredPrompt = e;
      if (nativeBox) nativeBox.classList.remove('hidden');
    });

    if (btnTriggerInstall) {
      btnTriggerInstall.addEventListener('click', async () => {
        if (deferredPrompt) {
          deferredPrompt.prompt();
          const choice = await deferredPrompt.userChoice;
          console.log('PWA userChoice:', choice);
          deferredPrompt = null;
          if (modalPwa) modalPwa.classList.add('hidden');
        }
      });
    }

    // Service Worker 离线缓存注册
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('sw.js').then((reg) => {
          console.log('PWA ServiceWorker registered with scope:', reg.scope);
        }).catch((err) => {
          console.warn('PWA ServiceWorker registration failed:', err);
        });
      });
    }

    // 移动端初次打开时友好轻提示 (在独立模式下不打扰)
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;
    const hasSeenPwaTip = localStorage.getItem('rubik_pwa_tip_seen');
    if (!isStandalone && !hasSeenPwaTip && /iphone|ipad|ipod|android/i.test(navigator.userAgent)) {
      setTimeout(() => {
        if (modalPwa) {
          modalPwa.classList.remove('hidden');
          localStorage.setItem('rubik_pwa_tip_seen', '1');
        }
      }, 3500);
    }

    // 默认启动载入第 1 关
    updateTotalStarsUi();
    loadLevel(0);
  </script>
</body>
</html>
`;
const MANIFEST_CONTENT = `{
  "name": "魔方小勇士：3D 奇幻大冒险",
  "short_name": "魔方小勇士",
  "description": "专为儿童与零基础初学者定制的沉浸式 3D 三阶魔方教学与实物解法应用",
  "start_url": "./",
  "scope": "./",
  "display": "standalone",
  "background_color": "#0f172a",
  "theme_color": "#3b82f6",
  "orientation": "portrait-primary",
  "icons": [
    {
      "src": "icon-192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "icon-512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "icon.svg",
      "sizes": "any",
      "type": "image/svg+xml",
      "purpose": "any maskable"
    }
  ],
  "categories": ["education", "games", "kids"]
}
`;
const SW_CONTENT = `// Service Worker for 魔方小勇士 PWA
const CACHE_NAME = 'rubik-kids-v1';
const ASSETS_TO_CACHE = [
  './',
  'manifest.json',
  'icon-192.png',
  'icon-512.png',
  'icon.svg',
  'apple-touch-icon.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
    }).then(() => self.clients.claim())
  );
});

// Network first, falling back to cache
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);

  // Only handle requests to the same origin
  if (url.origin !== self.location.origin) return;

  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      })
      .catch(() => {
        return caches.match(event.request).then((cachedResponse) => {
          if (cachedResponse) return cachedResponse;
          if (event.request.headers.get('accept')?.includes('text/html')) {
            return caches.match('./');
          }
        });
      })
  );
});
`;
const SVG_ICON = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
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
const PNG_192_B64 = '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';
const PNG_512_B64 = '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';

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
