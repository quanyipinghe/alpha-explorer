# 字母探险家 · 电视遥控器闯关版 设计

## Context

`alpha-explorer` 现在是一个约 870 行的 Vue 3 + Vite + Tailwind 骨架(字母岛、字母详情、描红、
找字母、拖拽配对、成就墙),只能用鼠标/触屏操作,发音按钮里的 phonics 也只是复用字母名音频。

用户想参考 `../github/lingopop` 的 17 个提交把它做丰富,并能在 Android TV 上用遥控器操作、寓教于乐。
电视端外壳是同目录下的 `../github/kidbox`(全屏 WebView,已负责每日时长、休息页、家长加法关卡、
域名白名单;家长可在 kidbox 设置里增删网址;遥控返回键 = `web.goBack()`,无可退历史时退出;
`mediaPlaybackRequiresUserGesture = false`,页面可自动发声)。目标电视是 OPPO Android 9,
WebView 内核 Chrome 66,系统 emoji 只到 Emoji 11。

## 用户与意图(用户说的)

- 使用者:3–4 岁孩子,26 个字母都认识,**自己拿遥控器**在电视前玩,家长不在旁边
- 方向:**两者都要,按闯关循序渐进** —— 先巩固字母,再字母发音,再简单拼读
- 主题与奖励风格:交给我定(沿用现有「字母岛探险」卡通糖果风)
- 四条底线,任何一条发生都算做坏了:
  1. 一玩就停不下来
  2. 卡住不会操作就哭(焦点丢失、不知按哪、退不出去)
  3. 乱按也能拿奖励,没学到东西
  4. 乱按改了设置或进度

## 目标 / 非目标

目标:遥控器(上下左右/确认/返回)能走完全部流程;一条线性闯关地图,三个阶段;每关 3–5 分钟;
奖励只给真正答对;家长区被加法题挡住。

非目标(YAGNI,本次不做):账号与云同步(lingopop 有,这里单机单娃不需要,进度存 localStorage);
网页内计时(kidbox 已管每日时长);触屏描红;多孩子档案;中文语音提示。

## 已定的「怎么做」(我的判断,用户未反对)

- **技术栈不变**:Vue 3 + vue-router + Vite + Tailwind,不重写,不加新运行时依赖。
  GSAP 已安装,动画需要时可用,不强求。
- **Chrome 66 兼容**:`vite.config.js` 设 `build.target: 'chrome66'`、`build.cssTarget: 'chrome66'`
  (esbuild 会把 `?.`/`??` 等降级,包括依赖)。仍需人为避开的:flex 容器上的 `gap-*`
  (Chrome 84 才支持,改用 `space-x-*`/`space-y-*` 或 grid 的 gap)、`aspect-ratio`、
  `backdrop-blur`(不支持会被忽略,可留)、`Array.prototype.flat/flatMap`、`Object.fromEntries`
  (运行时 API,esbuild 不 polyfill)。emoji 一律 ≤ Emoji 11(参考 lingopop 提交 `70189a6`)。
- **路由**:继续 `createWebHistory`,每个页面一条历史;关卡内部换题不入栈。遥控返回键 → kidbox
  `goBack()` → popstate → vue-router 自动回上一页,和页面「返回」按钮(`router.back()`)一致。
  Cloudflare Pages 无 404.html 时自动 SPA 回退,深链可用。
- **画面**:按 960×540 CSS 像素(1080p 电视 DPR 2)设计,答题页不出现滚动条;字母地图可滚动,
  但焦点移动时 `scrollIntoView({block:'nearest'})`。
- **发音**:沿用 lingopop 的 Kokoro-82M(音色 `af_heart`)离线预生成 mp3 的方式,
  把 `lingopop/scripts/tts.mjs` 改写成本仓库 `scripts/tts.mjs`(`kokoro-js` 作 devDependency,
  需本机有 ffmpeg),所有音频统一重新生成,音色一致。
- **音效**:照搬 lingopop `public/app.js` 里 `beep()`(Web Audio 现合成 叮/嘟/啵),不加音频文件。
- **描红**:遥控器做不了,删除 `TracingCanvas.vue`。

## 遥控器操作(照搬 lingopop 提交 `06a1b28` `f270dba` `1f90ce3`)

- 新建 `src/logic.js` 放纯函数,其中 `nearest(from, rects, dir)`、`mathGate()`、`cooldown()`
  从 `lingopop/public/logic.js` 原样搬来。
- 新建 `src/tv.js`(或直接写在 `App.vue`)挂一个全局 `keydown`:方向键 → 在可见、未禁用的
  `button, a[href]` 里用 `nearest` 选下一个并 `focus()`;焦点不在任何按钮上时,方向键先回到页面主按钮。
  确认键靠原生 `<button>` 的 click,不自己处理。
- 每次路由切换、换题、按钮被禁用后,焦点自动落到 `[data-autofocus]` 元素(没有则第一个按钮)。
- 焦点样式:粗描边 + 放大,同时写 `:focus` 兜底(Chrome 66 不认 `:focus-visible`)。
- 所有可操作元素必须是 `<button>` 或 `<a>`,不用带 `@click` 的 `<div>`。

## 闯关结构

首页 = 一张横向/蛇形的**闯关地图**,关卡依次解锁,当前关自动获得焦点,已过关显示星星。
另有「贴纸墙」入口和一个不显眼的「家长」入口。现有「字母岛 / 游戏乐园 / 成就墙」三个入口合并进这张地图,
旧路由删掉。

每关 = 开头几张热身卡 + 8 道题。题目是同一题型,或两种题型混合。「认字母」和「看拼读」**不单独成关**,
只做每关开头的热身(本关涉及的字母或单词逐张出现,按确认翻下一张,可以跳过),不计分。
所以每一关都必须答题才能过关,光按确认拿不到贴纸(我的判断)。题目数据由 `src/logic.js` 的生成函数按关卡配置随机出题。
关卡配置写在 `src/data/levels.json`,形如 `{ "id": "s1-03", "stage": 1, "type": "find-upper", "letters": "MNOPQR" }`。

**阶段 1 · 巩固字母**(按字母分 4–5 组,每组若干关)
- 认字母:看字母卡(大小写 + 图 + A for Apple),按确认听字母名、听单词;就是现在的字母详情页,改成遥控可用
- 听音找字母:读字母名,从 3 个气球里选(先大写,后小写)
- 大小写配对:给大写,从 3 个小写里选(替代拖拽)
- 字母排队:`A B ?` 选下一个字母

**阶段 2 · 字母发音**
- 听发音选字母:读 /æ/,从 3 个字母里选
- 首字母音:读单词并显示图片(apple),选它的开头字母

**阶段 3 · 简单拼读(CVC)**
- 看拼读:三个字母依次亮起并发音 c–a–t,再读整个词并出图;按确认进入下一个
- 听词选图:读 `cat`,从 3 张图里选
- 补字母:显示 `c _ t` + 图,从 3 个元音里选
- 词表约 30 个 CVC 词,放 `src/data/cvc.json`:`{ "word": "cat", "emoji": "🐱", "zh": "猫" }`,
  图片用 ≤ Emoji 11 的 emoji;同一道题的选项图标互不相同

## 防乱按、奖励与「学到东西」

- 题目语音播放时(包括答错后重读)选项禁用,播完才可选;音频加载失败时最多等 1.5 秒。
  这样没听题就按不了,也就不需要另做「连续乱按锁定」(我的判断:删掉了初稿里的 3 秒锁定规则)。
  禁用期间焦点留在原来的按钮上,不能掉到 body。
- 答错:嘟一声,只把这个选项置灰并重读题目;同一题第二次错就高亮正确答案并读出来,然后进入下一题。
- 只有**第一次就答对**的题算分。一关 8 题里第一次就答对 ≥ 6 题才过关:点亮 1–3 颗星
  (6/7/8 题第一次就答对),盖一张新贴纸;没过关就鼓励「再来一次」,不发贴纸,也不解锁下一关。
- 关卡结束必须停在结算页:主按钮是「回地图」,不会自动跳到下一关(配合 kidbox 的时长控制,让孩子有自然的停顿点)。
- 贴纸墙:每关一张贴纸(emoji),新贴纸有盖章动画(参考 lingopop `f9f58b5`)。

## 家长区

入口在地图角落,点进去先出 `mathGate`:连续答对 2 题才能进,答错锁 1 分钟(和 lingopop `5f7529a`、
kidbox 一致)。家长区里可以:看每关的星星数和过关日期、一键解锁全部关卡、清空进度(清空要再按一次确认)。

## 进度存储

扩展 `src/composables/useProgress.js`,localStorage 一个键 `alpha_explorer_progress`,内容为
`{ levels: { [id]: { stars, at } }, stickers: [id] }`。旧键 `alpha_explorer_learned_letters` 直接忽略
(目前没有真实用户数据)。

## 内容与音频

- `src/data/alphabet.json` 每个字母加 `phonicsText`(交给 Kokoro 朗读的文本),以及 `phonics` 音频路径
  `/audio/phonics/A.mp3`。**只放单独的字母发音**(比如 /æ/),不放「a, a, apple」这种短句:
  带了单词,「听发音选字母」就退化成「首字母音」了。做法:先试 kokoro-js 能不能直接输入音标,
  不行就试拼写近似的文本(比如 "ah"、"buh");生成后逐个听。
  读不准的字母从「听发音选字母」的题里排除,但仍参加「首字母音」题,并列进「已知未完成」(我的判断)。
  如果 26 个字母里一半以上读不准,就先停下来问用户:要不要自己录音,或换成别的音源。
  X 用词尾音(box),不用 xylophone。
- 字母卡上的三个按钮依次是:字母名、字母发音、单词。
- 新增 CVC 单词音频 `/audio/cvc/<word>.mp3`,以及「Find the letter」「Which one is cat?」这类固定提示语音频。
- 现有 26 张字母 SVG 图保留使用。

## 留给实现者决定

- 地图的具体画法、吉祥物形象、配色细节(保持现有糖果风即可)
- 关卡的具体分组和数量(阶段 1 大约 8–10 关,阶段 2、3 各约 6 关)
- 是否用 GSAP 做动画,还是只用 CSS transition

## 关键文件

- 改:`vite.config.js`、`src/App.vue`、`src/router/index.js`、`src/composables/useProgress.js`、
  `src/data/alphabet.json`、`src/components/common/AudioButton.vue`、`package.json`
- 新:`src/logic.js`、`src/tv.js`、`src/data/levels.json`、`src/data/cvc.json`、`src/views/MapView.vue`、
  `src/views/LevelView.vue`(一个视图按题型渲染)、`src/views/StickerWallView.vue`、`src/views/ParentView.vue`、
  `scripts/tts.mjs`、`test.mjs`
- 删:`TracingCanvas.vue`、`GameParkView.vue`、`CaseMatchView.vue`、`FindTheLetterView.vue`、
  `AchievementWallView.vue`、`AlphabetIslandView.vue`(功能并入地图和关卡)
- 设计文档提交到 `docs/superpowers/specs/2026-10-22-tv-quest-design.md`

## 验证

- `node test.mjs`:用 node assert 测 `src/logic.js`,包括 nearest、mathGate、出题(选项不重复且包含正确答案)、
  星级计算和过关判定;并检查数据:每个 CVC 词和关卡引用的音频文件都存在,emoji 全部 ≤ Emoji 11
- `npm run build` 后用 acorn 按 ES2018 解析 `dist/assets/*.js`,确认 Chrome 66 能解析;
  grep 构建出的 CSS,确认 flex 容器上没有 `gap`
- `vite preview` + 无头 Chrome(CDP)**只用键盘**走完:地图 → 第一关(含答错一次)→ 结算页 →
  返回键回地图 → 贴纸墙 → 家长区加法题;全程检查 `document.activeElement` 始终是一个按钮
- 在电视上实测:部署到 Cloudflare Pages,在 kidbox 家长设置里添加网址。这一步需要用户在电视上操作;
  没实测前,提交里不写「电视已验证」
