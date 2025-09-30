# 圣经阅读排行榜 (Bible Reading Rankings)

一个基于 React + TypeScript + Express + Prisma 的圣经阅读跟踪和社交应用。

## 功能特性

### 📖 圣经阅读
- 完整的圣经文本（66卷书，1189章，31095节）
- 中英文对照显示
- 书卷中文缩写显示
- 阅读记录追踪
- 阅读统计和排行榜

### 👥 群组功能
- 创建和加入阅读群组
- 群组成员管理（角色权限：群主/管理员/成员）
- 群组通知和置顶公告
- 多种分享方式（链接、二维码、图片）
- 群组设置管理（改名、公开/私有设置）

### 🤝 社交功能
- 好友系统
- 排行榜竞赛
- 用户个人资料

### 🔐 认证与安全
- JWT 身份验证
- bcrypt 密码加密（12轮）
- 角色权限控制（用户/管理员/超级管理员）
- 忘记密码和重置功能
- 密码修改功能

### 🛠 管理功能
- 系统统计面板
- 用户管理（角色修改、状态管理）
- 群组管理
- 系统设置

## 技术栈

### 前端
- **React 18** - UI框架
- **TypeScript** - 类型安全
- **Vite** - 构建工具
- **Tailwind CSS** - 样式框架
- **Zustand** - 状态管理
- **React Router** - 路由管理
- **Axios** - HTTP客户端

### 后端
- **Node.js** - 运行时
- **Express** - Web框架
- **TypeScript** - 类型安全
- **Prisma** - ORM数据库工具
- **SQLite** - 数据库
- **bcrypt** - 密码加密
- **jsonwebtoken** - JWT认证

## 项目结构

```
BibleReadingRankings/
├── client/                 # React前端应用
│   ├── src/
│   │   ├── components/     # 可复用组件
│   │   ├── pages/         # 页面组件
│   │   ├── stores/        # Zustand状态管理
│   │   ├── services/      # API服务
│   │   └── types/         # TypeScript类型
│   └── package.json
├── server/                 # Express后端应用
│   ├── src/
│   │   ├── controllers/   # 路由控制器
│   │   ├── middleware/    # 中间件
│   │   ├── routes/        # API路由
│   │   ├── services/      # 业务逻辑
│   │   ├── scripts/       # 数据库脚本
│   │   └── config/        # 配置文件
│   ├── prisma/            # 数据库schema和数据
│   └── package.json
├── shared/                 # 共享类型定义
└── package.json           # 根package.json
```

## 快速开始

### 环境要求
- Node.js 18+
- npm 或 yarn

### 安装步骤

1. **克隆仓库**
   ```bash
   git clone https://github.com/your-username/BibleReadingRankings.git
   cd BibleReadingRankings
   ```

2. **安装依赖**
   ```bash
   npm install
   ```

3. **设置环境变量**
   
   在 `server/` 目录创建 `.env` 文件：
   ```env
   DATABASE_URL="file:./dev.db"
   JWT_SECRET="your-jwt-secret-key"
   PORT=3001
   ```
   
   在 `client/` 目录创建 `.env` 文件：
   ```env
   VITE_API_URL=http://localhost:3001/api
   ```

4. **初始化数据库**
   ```bash
   cd server
   npx prisma db push
   npx tsx src/scripts/seed.ts
   npx tsx src/scripts/import-bible.ts
   ```

5. **启动开发服务器**
   
   后端服务（端口3001）：
   ```bash
   cd server
   npm run dev
   ```
   
   前端服务（端口5173）：
   ```bash
   cd client
   npm run dev
   ```

6. **访问应用**
   
   打开浏览器访问：http://localhost:5173

### 默认账户

- **演示用户**
  - 邮箱：`demo@example.com`
  - 密码：`password123`
  - 角色：普通用户

- **超级管理员**
  - 邮箱：`williamitouch@gmail.com`
  - 用户名：`WilliamL`
  - 密码：`password123`
  - 角色：超级管理员

## 主要功能截图

### 圣经阅读界面
- 支持中英文对照
- 书卷选择界面显示中文缩写
- 章节导航

### 群组管理
- 群组创建和加入
- 成员权限管理
- 通知发布
- 多种分享方式

### 管理面板（超级管理员）
- 系统统计
- 用户管理
- 群组监控

## 贡献指南

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

## 许可证

本项目采用 MIT 许可证。

## 联系方式

- 项目作者：William L
- 邮箱：williamitouch@gmail.com