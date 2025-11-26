# 快速开始指南

5 分钟快速启动 One Sentence Today 项目

## 方式一：使用 Docker Compose（推荐）

最快速的启动方式，只需 3 步：

### 步骤 1：克隆项目
```bash
git clone <repository-url>
cd OneSentence
```

### 步骤 2：启动服务
```bash
docker-compose up -d
```

### 步骤 3：初始化数据库
```bash
# 等待约 10 秒，让数据库完全启动
docker-compose exec backend npm run db:migrate
```

### 访问应用
- 🌐 前端：http://localhost
- 🔌 后端 API：http://localhost:5000
- 📊 健康检查：http://localhost:5000/health

完成！你现在可以开始使用应用了。

---

## 方式二：本地开发模式

如果需要进行开发，可以本地运行：

### 前置要求
- Node.js 16+
- PostgreSQL 13+

### 步骤 1：安装 PostgreSQL

**macOS (Homebrew):**
```bash
brew install postgresql@13
brew services start postgresql@13
createdb one_sentence_today
```

**Ubuntu/Debian:**
```bash
sudo apt-get install postgresql-13
sudo systemctl start postgresql
sudo -u postgres createdb one_sentence_today
```

**Windows:**
下载并安装 [PostgreSQL](https://www.postgresql.org/download/windows/)

### 步骤 2：配置后端

```bash
cd backend
npm install
cp .env.example .env
```

编辑 `.env` 文件：
```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=one_sentence_today
DB_USER=postgres
DB_PASSWORD=your_password
JWT_SECRET=your-secret-key-at-least-32-chars
```

### 步骤 3：初始化数据库
```bash
npm run db:migrate
```

### 步骤 4：启动后端
```bash
npm run dev
```

后端现在运行在 http://localhost:5000

### 步骤 5：配置前端

打开新终端：
```bash
cd frontend
npm install
cp .env.example .env
```

### 步骤 6：启动前端
```bash
npm run dev
```

前端现在运行在 http://localhost:3000

---

## 首次使用

### 1. 注册账号

访问 http://localhost:3000，点击"注册"：
- 输入邮箱
- 设置密码（至少 8 个字符）
- 点击"注册"按钮

### 2. 发布第一句话

登录后：
- 在输入框中写下你的一句话（最多 140 字符）
- 点击"发送到宇宙"
- 等待系统配对

### 3. 触发配对

因为这是测试环境，你需要手动触发配对：

**使用 curl:**
```bash
curl -X POST http://localhost:5000/api/admin/pairing/run \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**或使用浏览器:**
访问 http://localhost:5000/api/admin/pairing/run（需要登录）

### 4. 查看收到的消息

刷新页面，你应该能看到配对的消息！

---

## 测试数据

想要快速测试？可以创建多个账号并发布消息：

```bash
# 使用提供的测试脚本
node scripts/seed-test-data.js
```

或者手动创建：

1. 注册账号 A，发布消息："今天天气真好！"
2. 退出登录
3. 注册账号 B，发布消息："希望明天会更好"
4. 触发配对（调用配对 API）
5. 刷新两个账号，查看收到的消息

---

## 常用命令

### Docker 模式

```bash
# 启动所有服务
docker-compose up -d

# 查看日志
docker-compose logs -f

# 停止服务
docker-compose down

# 重启服务
docker-compose restart

# 查看运行状态
docker-compose ps

# 进入后端容器
docker-compose exec backend sh

# 运行数据库迁移
docker-compose exec backend npm run db:migrate

# 清除所有数据（谨慎使用）
docker-compose down -v
```

### 本地开发模式

```bash
# 后端
cd backend
npm run dev          # 开发模式
npm start            # 生产模式
npm run db:migrate   # 数据库迁移

# 前端
cd frontend
npm run dev          # 开发服务器
npm run build        # 构建生产版本
npm run preview      # 预览生产版本
```

---

## 故障排查

### 端口被占用

**问题**: "Port 5000 is already in use"

**解决**:
```bash
# 查找占用端口的进程
lsof -i :5000  # macOS/Linux
netstat -ano | findstr :5000  # Windows

# 杀死进程或更改端口
# 修改 backend/.env 中的 PORT=5001
```

### 数据库连接失败

**问题**: "ECONNREFUSED" 或 "database does not exist"

**解决**:
```bash
# 检查 PostgreSQL 是否运行
pg_isready  # 应该返回 "accepting connections"

# 创建数据库
createdb one_sentence_today

# 检查连接参数
cat backend/.env
```

### Docker 数据库未就绪

**问题**: 数据库迁移失败

**解决**:
```bash
# 等待数据库完全启动（约 10-15 秒）
docker-compose logs postgres

# 当看到 "database system is ready to accept connections" 后
# 再运行迁移
docker-compose exec backend npm run db:migrate
```

### 前端无法连接后端

**问题**: 前端显示网络错误

**解决**:
1. 确认后端正在运行：访问 http://localhost:5000/health
2. 检查前端配置：`frontend/.env` 中的 `VITE_API_URL`
3. 查看浏览器控制台的详细错误信息

---

## 下一步

- 📖 阅读 [API 文档](./API.md) 了解所有接口
- 🚀 查看 [部署文档](./DEPLOYMENT.md) 部署到生产环境
- 🔧 阅读主 [README](../README.md) 了解项目架构
- 🎨 自定义样式和功能

---

## 获取帮助

遇到问题？

1. 查看 [常见问题](./FAQ.md)
2. 搜索 [GitHub Issues](https://github.com/your-repo/issues)
3. 提交新的 Issue
4. 加入开发者社区

祝你使用愉快！ 🎉
