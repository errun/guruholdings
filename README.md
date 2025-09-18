# 大师持仓追踪 - Guru Holdings Tracker

一个专注于追踪投资大师持仓变化的网站，聚焦巴菲特（Berkshire Hathaway）和李录（Himalaya Capital），展示最近3个季度的美股持仓变化。

## 🎯 项目特色

- **数据可视化**：使用图表直观展示持仓分布和变化趋势
- **AI智能分析**：自动生成持仓变化摘要和投资洞察
- **响应式设计**：完美适配桌面端和移动端
- **实时更新**：基于SEC 13F报告数据

## 🚀 技术栈

- **前端框架**：React 18 + Vite
- **样式框架**：TailwindCSS
- **图表库**：Recharts
- **路由**：React Router
- **图标**：Heroicons
- **部署**：GitHub Pages

## 📦 安装和运行

```bash
# 克隆项目
git clone https://github.com/your-username/guru-holdings-tracker.git

# 进入项目目录
cd guru-holdings-tracker

# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build
```

## 🌐 在线访问

访问地址：[https://your-username.github.io/guru-holdings-tracker/](https://your-username.github.io/guru-holdings-tracker/)

## 📊 功能特性

### 1. 大师选择页
- 展示巴菲特和李录的投资简介
- 显示最新持仓总市值和更新时间
- 投资亮点和特色介绍

### 2. 持仓详情页
- 最近3个季度持仓对比表格
- 持仓变化标记（增持/减持/新增/清仓）
- 饼图展示当前持仓分布
- 总市值趋势图
- AI生成的投资洞察摘要

### 3. 订阅功能
- 邮件订阅季度更新
- 本地存储订阅信息
- 订阅状态反馈

## 📝 数据说明

- **数据来源**：SEC EDGAR 13F季度报告
- **数据延迟**：约45天，非实时持仓
- **覆盖范围**：价值超过$200,000且持股超过10,000股的美股持仓
- **免责声明**：本数据仅供参考，不构成投资建议

## 🔧 开发

```bash
# 开发模式
npm run dev

# 类型检查
npm run lint

# 构建
npm run build

# 预览构建结果
npm run preview
```

## 📄 许可证

MIT License
