# Tagged Story Synopsis (标签化故事梗概提示词生成器)

面向小说、网络文学、电影、电视剧和流媒体剧集创作者的**本地化故事梗概提示词生成器**。

在线演示（GitHub Pages）：[https://swyu22.github.io/TaggedStories/](https://swyu22.github.io/TaggedStories/)

---

## 一、项目用途

用户在网页中填写故事资料、从预置全维度标签库中多选故事标签，点击确认后，系统会自动将资料与标签注入内置的长篇专业编剧提示词模板中，生成一份 1000—1500 字故事大纲的高质量 AI 创作提示词，并自动复制到剪贴板，支持检查、再次复制与保存为本地 Markdown 文件。

**全过程在浏览器本地运行，不调用任何大模型接口，不上传任何用户故事内容。**

---

## 二、核心功能列表

1. **结构化故事资料录入**：
   - **作品名称**（选填）：若留空，提示词中会自动写入“要求 AI 推荐作品名称”的专属编剧指令。
   - **原始故事梗概**（必填）：多行编辑、自适应高度（不少于 240px），为空时触发焦点定位与即时错误反馈。
   - **不可更改的核心设定**（选填）：人物命运、世界观规则等，留空时写入“无”。
   - **其他创作要求**（选填）：强化悬疑、反转、特定受众等，留空时写入“无”。
2. **全维度分类标签母库检索与多选**：
   - 严格以 `src/data/story-tags.md` 为唯一数据源，内置 15 大类、数千标签。
   - 分类层级折叠面板，支持“展开全部 / 收起全部”。
   - 实时不区分大小写检索（同时搜索标签与各级分类名），匹配项自动展开。
   - 单分类“全选”与“清空”支持；每个标签具备无障碍复选胶囊交互（Tab / Space / Enter）。
   - **已选标签汇总区**：按原标签库顺序归类展示，支持单独移除与一键清空。
3. **专业编剧长篇提示词组装**：
   - 内置融合亚里士多德、三幕/五幕、八序列、英雄之旅、救猫咪等经典理论的专业编剧模板。
   - 严格按照 5W1H 原则与 20 项戏剧审校标准设计，输出可直接用于驱动各大主流大模型的提示词。
4. **一键生成、剪贴板与本地导出闭环**：
   - **生成并复制完整提示词**：自动复制并平滑滚动聚焦到结果区。
   - **仅生成预览**：便于检查草稿。
   - **剪贴板兼容降级**：优先使用现代 Clipboard API，并在受限环境平滑回退到兼容模式。
   - **下载为 Markdown**：导出 UTF-8 编码 `.md` 文件，文件名规范：`Tagged_Story_Synopsis_<作品名称或Untitled>_<YYYYMMDD-HHmm>.md`。
5. **导出的 Markdown 重新载入与反向解析恢复**：
   - 支持一键**载入此前导出的提示词 `.md` 文件**。
   - 自动反向提取并恢复 4 个表单字段（作品名称、故事梗概、不可更改核心设定、其他创作要求）。
   - 智能比对标签库，自动重新勾选此前选择的所有标签并在已选汇总面板中完整呈现。
6. **本地草稿与隐私保护**：
   - 采用 LocalStorage（键名：`tagged-story-synopsis:draft:v1`）自动防抖保存表单输入、已选标签与生成结果。
   - 页面刷新后无缝恢复，失效标签自动剔除。
   - 提供“清空全部内容”确认弹窗，确认后彻底销毁本地草稿。
   - 数据绝不上传云端，无任何第三方分析跟踪。

---

## 三、安装与运行

### 3.1 环境要求

- Node.js >= 18.0.0
- npm >= 9.0.0

### 3.2 安装依赖

```bash
npm install
```

### 3.3 本地开发运行

```bash
npm run dev
```

启动后在浏览器访问控制台提示的本地地址（通常为 `http://localhost:5173`）。

### 3.4 单元测试

```bash
npm test
```

包含标签解析器、标签格式化、提示词拼装核心纯函数以及文件名清洗等单元测试。

### 3.5 生产构建

```bash
npm run build
```

产物将输出至 `dist/` 目录，采用相对路径构建，支持直接托管于任何静态托管服务或 GitHub Pages。

---

## 四、标签 Markdown 数据源说明

### 4.1 标签文件存放位置

```text
src/data/story-tags.md
```

### 4.2 支持的标签 Markdown 格式

解析器内置于 `src/lib/parseTagMarkdown.ts`，严格支持以下常见 Markdown 组织方式：

- **二级/三级/四级标题层级**：如 `## 一、受众定位` > `### 受众与市场定位标签` > `#### 频道与消费倾向`。
- **符号分隔标签**：支持中文顿号 `、`、中文逗号 `，`、英文逗号 `,`、分号 `；` `;`、竖线 `|` 等分隔符。
- **无序列表 / 有序列表**：支持 `- `、`* `、`+ ` 及 `1. `、`2、 `、`（1） ` 编号。
- **格式清洗**：自动去除粗体 `**`、斜体 `*`、行末句号等排版字符，保留内部空格及英文短语。
- **说明区域自动排除**：标题含有“说明”、“使用说明”、“备注”、“附录”、“标签使用建议”、“注意事项”、“结语”等章节会自动排除，避免将解释文本误识别为标签。

### 4.3 如何替换或更新标签清单

1. 直接替换 `src/data/story-tags.md` 文件内容；
2. 运行 `npm run build` 即可重新构建包含新标签库的站点；
3. 或者在运行页面点击右上角“导入备用标签库 (.md)”，即可在当前浏览器会话中即时生效（纯本地解析，不上传）。

---

## 五、内置提示词模板位置

内置提示词模板独立存放于：

```text
src/config/promptTemplate.ts
```

包含完整且未删节的资深职业编剧身份定位、5W1H 核心要素要求与 20 条写作原则。核心拼装纯函数位于 `src/lib/buildPrompt.ts`。

---

## 六、本地草稿与隐私机制

- **存储键名**：`tagged-story-synopsis:draft:v1`
- **防抖保存**：用户输入时 400ms 防抖自动写入 LocalStorage。
- **恢复策略**：加载时自动比对当前标签母库，只恢复真实存在的有效标签；上次生成的结果会明确标记为“上次生成结果（本地草稿）”。
- **安全与隐私**：绝无网络请求发出，无任何后端连接，断网可离线完整使用。

---

## 七、项目目录结构

```text
TaggedStories/
├── .github/
│   └── workflows/
│       └── deploy.yml              # GitHub Actions 自动化部署工作流
├── src/
│   ├── app/
│   │   └── App.tsx                 # 主应用逻辑编排与状态协调
│   ├── components/
│   │   ├── AppHeader.tsx           # 顶部品牌区与提示词说明折叠
│   │   ├── StoryFormSection.tsx    # 步骤一：故事资料输入表单
│   │   ├── TagLibrarySection.tsx   # 步骤二：标签库检索与分类折叠主控
│   │   ├── TagCategoryAccordion.tsx# 单个大分类折叠项与子分类渲染
│   │   ├── TagOption.tsx           # 单个标签复选胶囊（键盘与ARIA）
│   │   ├── SelectedTagsPanel.tsx   # 已选标签汇总面板（分类路径与移除）
│   │   ├── GenerateActions.tsx     # 步骤三：操作按钮区（主按钮、次按钮、清空）
│   │   ├── PromptResultPanel.tsx   # 提示词结果展示区（可复制、导出与焦点管理）
│   │   ├── ConfirmDialog.tsx       # 原生模态清空确认对话框
│   │   └── Toast.tsx               # 全局状态提示容器
│   ├── config/
│   │   ├── promptTemplate.ts       # 完整内置编剧长篇提示词模板
│   │   └── tagParserConfig.ts      # 标签解析器过滤词与分隔符配置
│   ├── data/
│   │   └── story-tags.md           # 核心标签母库 Markdown 数据源
│   ├── hooks/
│   │   ├── useLocalDraft.ts        # 本地草稿防抖持久化与验证恢复
│   │   └── useToast.ts             # 轻提示状态管理
│   ├── lib/
│   │   ├── parseTagMarkdown.ts     # Markdown 标签树解析器
│   │   ├── formatSelectedTags.ts   # 已选标签格式化纯函数
│   │   ├── buildPrompt.ts          # 提示词拼装核心纯函数
│   │   ├── clipboard.ts            # 剪贴板写入与降级方案
│   │   ├── downloadMarkdown.ts     # 浏览器本地 Blob 下载器
│   │   ├── filename.ts             # 导出文件名规范化与时间戳
│   │   └── text.ts                 # 文本规范化与字符统计
│   ├── tests/
│   │   ├── parseTagMarkdown.test.ts# 标签解析 12 项场景单元测试
│   │   ├── formatSelectedTags.test.ts# 标签格式化单元测试
│   │   ├── buildPrompt.test.ts     # 提示词拼装 12 项场景单元测试
│   │   ├── filename.test.ts        # 文件名生成测试
│   │   └── setup.ts                # 测试环境配置
│   ├── types/
│   │   └── index.ts                # 全局 TypeScript 接口定义
│   ├── vite-env.d.ts               # Vite 静态资源类型声明
│   ├── index.css                   # 全局样式与 Tailwind 基础指令
│   └── main.tsx                    # React 应用入口
├── index.html                      # HTML 模板与字体加载
├── package.json
├── postcss.config.js
├── tailwind.config.js
├── tsconfig.json
├── tsconfig.node.json
├── vite.config.ts
└── README.md
```
