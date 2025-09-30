# 测试环境设置指南

## 1. 数据库设置（PostgreSQL）

你需要先安装和配置PostgreSQL数据库：

### 安装 PostgreSQL (macOS)
```bash
brew install postgresql@16
brew services start postgresql@16
```

### 创建数据库
```bash
createdb bible_rankings
```

### 更新数据库连接
编辑 `server/.env` 文件中的 DATABASE_URL：
```
DATABASE_URL="postgresql://your-username@localhost:5432/bible_rankings?schema=public"
```

## 2. 运行数据库迁移和种子数据

```bash
cd server
npx prisma generate
npx prisma db push
npm run db:seed
```

## 3. 启动开发服务器

在项目根目录：

```bash
# 启动后端服务器 (端口 3001)
npm run dev:server

# 在新终端窗口启动前端服务器 (端口 5173)  
npm run dev:client

# 或者同时启动两个服务器
npm run dev
```

## 4. 访问应用

- 前端应用: http://localhost:5173
- 后端API: http://localhost:3001/api
- API健康检查: http://localhost:3001/api/health

## 5. 测试账户

运行种子脚本后会创建一个测试账户：
- 邮箱: demo@example.com  
- 密码: password123

## 6. 功能测试检查清单

### 认证功能
- [ ] 用户注册
- [ ] 用户登录
- [ ] 受保护路由访问

### 圣经阅读功能
- [ ] 查看书卷列表（旧约/新约）
- [ ] 选择书卷查看章节
- [ ] 阅读圣经章节
- [ ] 中英文语言切换
- [ ] 章节导航（上一章/下一章）
- [ ] 经文点击标记（准备阅读追踪）

### API测试
```bash
# 健康检查
curl http://localhost:3001/api/health

# 获取圣经书卷
curl http://localhost:3001/api/bible/books

# 获取创世记第1章
curl http://localhost:3001/api/bible/books/1/chapters/1
```