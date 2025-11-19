# WxRemember / 记忆力训练微信小程序

这个仓库包含一个完整的微信小程序示例项目，用于训练工作记忆与注意力（数字序列、N-Back、Simon、空间序列等），并配有本地存储、成就系统、训练复盘和基础自动化测试。

- 小程序源码目录：`wx-memory-trainer/`
- 单元测试：`__tests__/storage.spec.js`
- CI 配置：`.github/workflows/ci.yml`

> 默认定位为 **纯本地 MVP**：不开启云开发即可完整体验所有训练流程。排行榜的云端部分保留为可选扩展能力。

## 功能概览

- 多种训练模式：数字序列（正/反向）、N-Back（视觉 / 听觉 / 双模态）、Simon、空间序列网格记忆。
- 训练复盘：记录最近一次训练的摘要和错题信息（尤其是 N-Back 的逐步错题）。
- 成就与连续训练：首训、连续训练天数、成绩达标等徽章。
- 分享海报：基于 Canvas 生成带最佳成绩的分享图片。
- 排行榜：
  - 默认展示 **本机最佳** 成绩；
  - 云端排行榜接口以占位形式预留，方便你在需要时接入云开发。

## 开发环境要求

- Node.js ≥ 18
- 微信开发者工具（用于运行 `wx-memory-trainer` 小程序）

## 安装依赖与脚本

在仓库根目录：

```bash
npm install
```

可用脚本：

- 运行单元测试（Vitest）：

  ```bash
  npm test
  ```

- 运行 ESLint 检查：

  ```bash
  npm run lint
  ```

- 自动修复可修复的问题：

  ```bash
  npm run lint:fix
  ```

> 安装依赖时会自动执行 `npm run prepare`，通过 [Husky](https://typicode.github.io/husky) 安装 Git hooks。默认的 `pre-commit` 会在提交前运行 `npm test` 与 `npm run lint`。

## 在微信开发者工具中运行小程序

1. 打开微信开发者工具，选择「导入项目」。  
2. 项目目录请选择本仓库中的 `wx-memory-trainer/` 子目录。  
3. AppID 可使用测试号或留空（不开启云能力时）。  
4. 导入后即可在模拟器或真机预览中体验各类训练模式。

更多关于小程序内部结构与功能说明，请参考 `wx-memory-trainer/README.md`。

## 云排行榜（可选拓展）

当前仓库默认 **不启用云开发**：

- 排行榜页面会优先展示「本机最佳」信息；
- 若未启用云开发，云端排行榜区域会给出说明文案，而不是空白或报错。

如需接入真实云排行榜，你可以：

1. 在微信开放平台/小程序后台开启云开发，并创建对应环境；
2. 在小程序开发者工具中启用云开发，并获取 `envId`；
3. 在 `wx-memory-trainer/utils/cloud.js` 中补充 `saveScore` / `getLeaderboard` 的真实实现；
4. 在设置页中开启云功能并填写 `envId`。

## 许可证

本项目默认采用 MIT License，你可以根据需要在 Fork 时更改协议，并同步更新相关 README 与 License 文件。
