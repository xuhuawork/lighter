# 流浪火机 (Wandering Lighter)

这是一个艺术项目的数字化组成部分。项目通过追踪25个被"蓄意丢失"的打火机，记录它们在不同人之间流转的故事。

## 项目描述

沈序桦导演蓄意丢失了25个打火机，每个打火机都带有一个二维码。当人们找到这些打火机时，可以通过扫描二维码来：
- 查看这个打火机之前的历程
- 记录自己与这个打火机的故事
- 继续传递这个打火机，让故事延续

## 技术栈

- 前端：HTML5, CSS3, JavaScript
- 后端：Node.js, Express
- 数据库：MongoDB
- 样式：像素风格 (Pixel Art Style)，致敬 Game Boy Advance 美学

## 功能特点

- 🎮 复古像素风格界面
- 📱 移动端优化设计
- 📝 故事记录与分享
- 🗺️ 打火机旅程追踪
- 🔄 实时使用次数统计

## 安装说明

1. 克隆仓库
bash
git clone https://github.com/你的用户名/lighter-tracking.git
cd lighter-tracking

2. 安装依赖
bash
npm install

3. 配置环境变量
bash
cp .env.example .env

MONGODB_URI=mongodb://127.0.0.1:27017/lighter
PORT=3000

4. 启动服务器
bash
npm start

## 项目结构
README.md
lighter-tracking/
├── app.js # 应用入口和主要逻辑
├── views/ # 页面模板
│ ├── welcome.html # 欢迎页面
│ ├── index.html # 表单页面
│ └── history.html # 历史记录页面
├── public/ # 静态资源
│ ├── css/
│ │ └── style.css # 样式文件
│ └── js/
│ ├── form.js # 表单处理
│ └── validation.js # 表单验证
└── package.json # 项目配置

## API 接口

### POST /submit
提交新的打火机记录

### GET /history/:lighterNumber
获取特定打火机的历史记录

### GET /api/usage-count/:lighterNumber
获取特定打火机的使用次数

## 贡献指南

1. Fork 项目
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 提交 Pull Request

## 作者

- 沈序桦 - *项目创意与导演*
- [你的名字] - *技术实现*

## 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情

## 致谢

- 感谢所有参与这个艺术项目的人
- 感谢每一个传递打火机的人，让故事得以延续