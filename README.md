# 字母探险家 (Alpha-Explorer)

给 3–4 岁、已经认识 26 个字母的孩子在**电视上用遥控器**玩的英语启蒙闯关。
分三个阶段 22 关:🏝️ 字母岛(巩固大小写和顺序)→ 🔊 发音谷(字母发音、首字母)→ 🧩 拼读山(CVC 拼读)。

- 只用方向键、确认键、返回键就能玩完;焦点永远停在一个按钮上
- 每关开头几张热身卡,然后 8 道题;第一次就答对 6 题才过关,过关得星星和贴纸
- 题目播放时选项不能按,乱按拿不到奖励
- 家长区(地图左下角)需要连续答对 2 道加法题,可看进度、解锁全部、清空进度
- 时长控制交给电视外壳 [kidbox](../github/kidbox),网页本身不计时

设计: `docs/superpowers/specs/2026-10-22-tv-quest-design.md`

## 技术栈

Vue 3 + vue-router + Vite + Tailwind。打包目标 Chrome 66(OPPO 电视 Android 9 的 WebView)。
进度存在浏览器 localStorage(`alpha_explorer_progress`)。

## 开发

    npm install
    npm run dev
    npm test                     # 出题、计星、数据和音频自检
    npm run build && npx vite preview --port 4173 &
    node scripts/kbd-check.mjs http://localhost:4173   # 无头 Chrome 只用键盘走一遍

## 写代码要注意(电视是 Chrome 66)

- flex 容器不要用 `gap-*`(Chrome 84 才支持),用 `space-x-*` 或 grid
- 不要用 `aspect-ratio`、`Array.prototype.flat`、`Object.fromEntries`
- emoji 只用 Emoji 11 以内的,`npm test` 会检查数据里的 emoji
- 可操作的东西一律用 `<button>`;页面主按钮加 `data-autofocus`

## 内容与发音

- 关卡: `src/data/levels.json`;CVC 词表: `src/data/cvc.json`;字母: `src/data/alphabet.json`
- 发音用 [Kokoro-82M](https://huggingface.co/hexgrad/Kokoro-82M)(Apache-2.0,音色 `af_heart`)离线生成,需要本机有 ffmpeg:

      npm run tts              # 全部重新生成
      npm run tts -- --missing # 只补缺的

  字母发音(`phonicsText`)是音标,直接送进模型。某个字母读得不准,就把它的 `phonicsOk` 改成 `false`,
  它会退出「听发音选字母」题。

## 部署

纯静态站点,`npm run build` 后把 `dist/` 部署到 Cloudflare Pages(构建命令 `npm run build`,输出目录 `dist`)。
然后在 kidbox 的家长设置里添加这个网址。
