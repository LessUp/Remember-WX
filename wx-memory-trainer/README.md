# 记忆力训练微信小程序

一个专注于工作记忆与注意力训练的微信小程序示例项目，涵盖数字序列、N-Back、Simon、空间序列等经典练习，并内置分享海报、成就徽章、训练复盘等增强功能，适合自用或二次开发后开源发布。

## 功能亮点

- **多种训练模式**：
  - 数字序列（正向 / 反向）
  - N-Back（视觉 / 听觉 / 双模态，可配置 N、步时、音素）
  - Simon 视觉序列
  - 空间序列网格记忆
- **复盘系统**：保存最近一次训练，展示错题时间点、目标与实际输入，支持回看序列。
- **成就与连续训练**：自动记录训练天数，解锁「初次训练」「连续 3/7 天」「成绩达标」等徽章。
- **分享海报**：基于 Canvas 生成带最佳成绩的宣传海报，可保存至相册分享。
- **动效与交互优化**：按钮脉冲、Simon/空间序列流光渐变、N-Back 网格高亮等，提升操作反馈。
- **云端占位实现**：`utils/cloud.js` 预留云开发接口，便于接入排行榜、成绩同步。

## 技术栈

- 微信小程序原生框架（WXML / WXSS / JS）
- 小程序本地存储（`wx.setStorageSync` / `wx.getStorageSync`）
- Canvas 海报绘制
- 可选云开发接口（需在 `cloud.js` 内补充具体逻辑）

## 目录结构

```
wx-memory-trainer/
├── app.js / app.json / app.wxss
├── pages/
│   ├── index/          // 首页导航
│   ├── digitspan/      // 数字序列训练
│   ├── nback/          // N-Back 训练
│   ├── simon/          // Simon 训练
│   ├── spatial/        // 空间序列训练
│   ├── review/         // 训练复盘
│   ├── achievements/   // 成就与连续训练
│   ├── share/          // 分享海报
│   └── ...             // 其他辅助页面（设置/成绩/排行榜）
├── utils/
│   ├── storage.js      // 本地存储与成就、复盘逻辑
│   └── cloud.js        // 云开发占位接口
├── project.config.json // 微信开发者工具配置
├── sitemap.json
├── .gitignore
├── .gitattributes
└── README.md
```

## 快速开始

1. **克隆代码**
   ```bash
   git clone https://github.com/your-name/wx-memory-trainer.git
   ```
2. **使用微信开发者工具导入**
   - 选择「导入项目」，项目目录指向 `wx-memory-trainer`。
   - AppID 可填写测试号或留空（不开启云能力时）。
3. **配置基础信息**
   - 根据需要在 `app.json` 调整页面顺序、TabBar 等。
   - 若落地云开发，请在 `utils/cloud.js` 内补充真实逻辑，并在 `app.js` 的 `onLaunch` 中初始化云环境。
4. **预览与调试**
   - 在微信开发者工具中点击「预览 / 真机调试」即可体验训练流程。

## 自动化测试与 CI

- 项目根目录引入了 [Vitest](https://vitest.dev/) 单元测试框架，用于覆盖关键的本地存储与成就逻辑。
- 在本地运行测试：
  ```bash
  npm install
  npm test
  ```
- 仓库自带 GitHub Actions (`.github/workflows/ci.yml`)，会在提交与 Pull Request 时执行上述测试流程，确保核心逻辑稳定可靠。

## 数据与配置说明

- `utils/storage.js`
  - 负责最佳成绩、训练历史、成就、连续训练天数、复盘记录的读写。
  - `updateStreakOnTraining()` 按自然日更新连续训练天数，适用于成就判定。
- `utils/cloud.js`
  - 提供 `init`、`saveScore`、`getLeaderboard` 等占位函数。
  - 如需上线真实排行榜，请替换为自己的云函数 / 后端接口。

## 复盘 & 成就

- 每次训练结束自动调用 `storage.setLastReview()` 保存本轮摘要，在复盘页查看。
- 成就代码示例：`first_train`、`digit10`、`nback80`、`simon10`、`spatial10`、`streak_3`、`streak_7`。
- 若要扩展更多成就，可在 `storage.js` 和 `pages/achievements/index.js` 中添加对应逻辑与展示。

## 分享海报

- `pages/share/index.js` 使用 Canvas 绘制海报，包含项目最佳成绩与时间戳。
- 用户需授权保存到相册（`wx.saveImageToPhotosAlbum`）。
- 可扩展多套模板或加入复盘数据统计。

## 开源建议

- 提交前确认 `.gitignore` / `.gitattributes` 生效，避免提交开发者工具缓存。
- 若提供示例数据，请确保不包含个人隐私信息。
- 推荐在 issue / discussions 中收集社区反馈，持续迭代训练模式与动画表现。

## 许可证

本项目默认采用 MIT License，若需使用其他协议，请更新本 README 及仓库 License 文件。
