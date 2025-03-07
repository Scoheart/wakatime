# WakaTime 团队编码时间统计 📊

该应用程序使用 WakaTime API 来统计和可视化团队中三名成员的每周编码时间。通过直观的图表和数据展示，团队可以轻松跟踪每个成员的编码活动和趋势。

## 功能特点 ✨

- 使用 ECharts 绘制交互式数据可视化图表
- 显示每天的编码时间统计（柱状图）
- 展示一周编码时间趋势（折线图）
- 呈现团队各成员的总编码时间摘要（卡片视图）
- 美观现代的响应式设计，适配不同设备

## 技术栈 🛠️

- React + TypeScript
- Vite 构建工具
- ECharts 数据可视化库
- Axios 用于API请求
- Day.js 用于日期格式化

## 安装与运行 🚀

1. 克隆仓库：
   ```bash
   git clone https://github.com/yourusername/wakatime-team-dashboard.git
   cd wakatime-team-dashboard
   ```

2. 安装依赖：
   ```bash
   npm install
   ```

3. 开发模式运行：
   ```bash
   npm run dev
   ```

4. 构建生产版本：
   ```bash
   npm run build
   ```

## WakaTime API 集成 🔌

应用默认使用模拟数据运行。若要连接实际 WakaTime API：

1. 在 `src/services/wakatime.ts` 中找到 API 密钥配置部分
2. 将每个团队成员的 WakaTime API 密钥替换为实际密钥
3. 在调用 `getMultipleUsersWeeklyStats` 时将 `useMockData` 参数设置为 `false`

**安全提示**：在实际部署中，请勿在前端直接存储 API 密钥。应使用后端代理或环境变量来保护敏感信息。

## 自定义 🎨

- 修改 `src/services/wakatime.ts` 中的 `USERS` 数组来自定义团队成员信息
- 在 `src/App.css` 中调整 CSS 变量来更改应用的主题颜色
- 根据需要修改 ECharts 配置，自定义图表外观和行为

## 贡献 👥

欢迎提交 Pull Requests 和 Issues。请确保您的代码符合项目的代码风格，并且在提交前已经经过测试。

## 许可证 📄

MIT
