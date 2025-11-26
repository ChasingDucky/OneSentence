# 部署文档

本文档介绍如何部署 One Sentence Today 应用。

## 目录

- [本地开发](#本地开发)
- [Docker 部署](#docker-部署)
- [生产环境部署](#生产环境部署)
- [数据库迁移](#数据库迁移)
- [定时任务配置](#定时任务配置)

---

## 本地开发

### 前置要求

- Node.js 16+
- PostgreSQL 13+
- npm 或 yarn

### 步骤

1. **克隆项目**
```bash
git clone <repository-url>
cd OneSentence
```

2. **安装后端依赖**
```bash
cd backend
npm install
cp .env.example .env
# 编辑 .env 文件，配置数据库等信息
```

3. **初始化数据库**
```bash
# 确保 PostgreSQL 已运行
npm run db:migrate
```

4. **启动后端**
```bash
npm run dev
# 后端运行在 http://localhost:5000
```

5. **安装前端依赖**
```bash
cd ../frontend
npm install
cp .env.example .env
```

6. **启动前端**
```bash
npm run dev
# 前端运行在 http://localhost:3000
```

---

## Docker 部署

使用 Docker Compose 一键部署整个应用栈。

### 前置要求

- Docker 20.10+
- Docker Compose 2.0+

### 步骤

1. **克隆项目**
```bash
git clone <repository-url>
cd OneSentence
```

2. **配置环境变量**
```bash
# 编辑 docker-compose.yml 中的环境变量
# 特别注意修改 JWT_SECRET 和数据库密码
```

3. **启动服务**
```bash
docker-compose up -d
```

4. **初始化数据库**
```bash
# 等待数据库就绪后，运行迁移
docker-compose exec backend npm run db:migrate
```

5. **访问应用**
- 前端：http://localhost
- 后端 API：http://localhost:5000
- 数据库：localhost:5432

6. **查看日志**
```bash
# 所有服务
docker-compose logs -f

# 特定服务
docker-compose logs -f backend
docker-compose logs -f frontend
```

7. **停止服务**
```bash
docker-compose down

# 删除数据（谨慎使用）
docker-compose down -v
```

---

## 生产环境部署

### 推荐架构

```
Internet
    |
    v
Load Balancer (Nginx/Cloudflare)
    |
    +-- Frontend (React Static Files)
    |
    +-- Backend API (Node.js)
            |
            v
        PostgreSQL Database
```

### 环境配置

1. **后端环境变量**（`backend/.env`）
```env
NODE_ENV=production
PORT=5000

# 数据库
DB_HOST=your-db-host
DB_PORT=5432
DB_NAME=one_sentence_today
DB_USER=your-db-user
DB_PASSWORD=your-secure-password

# JWT
JWT_SECRET=your-super-secret-jwt-key-at-least-32-chars
JWT_EXPIRES_IN=7d

# 安全
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# 内容审核
ENABLE_CONTENT_FILTER=true
```

2. **前端环境变量**（`frontend/.env`）
```env
VITE_API_URL=https://api.yourdomain.com/api
```

### 部署到云平台

#### 1. Heroku 部署

**后端：**
```bash
cd backend
heroku create your-app-backend
heroku addons:create heroku-postgresql:hobby-dev
heroku config:set JWT_SECRET=your-secret-key
git push heroku main
heroku run npm run db:migrate
```

**前端：**
```bash
cd frontend
# 构建静态文件
npm run build

# 部署到 Vercel/Netlify 或其他静态托管服务
```

#### 2. AWS 部署

- **Frontend**: S3 + CloudFront
- **Backend**: EC2 / ECS / Lambda (with API Gateway)
- **Database**: RDS PostgreSQL

#### 3. 自有服务器部署

使用 PM2 管理 Node.js 进程：

```bash
# 安装 PM2
npm install -g pm2

# 启动后端
cd backend
pm2 start src/index.js --name one-sentence-backend

# 配置开机自启
pm2 startup
pm2 save

# 监控
pm2 monit
```

使用 Nginx 反向代理：

```nginx
server {
    listen 80;
    server_name yourdomain.com;

    # 前端
    location / {
        root /var/www/one-sentence/frontend/dist;
        try_files $uri $uri/ /index.html;
    }

    # 后端 API
    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

---

## 数据库迁移

### 创建备份

```bash
# 本地
pg_dump -U postgres one_sentence_today > backup.sql

# Docker
docker-compose exec postgres pg_dump -U postgres one_sentence_today > backup.sql
```

### 恢复备份

```bash
# 本地
psql -U postgres one_sentence_today < backup.sql

# Docker
docker-compose exec -T postgres psql -U postgres one_sentence_today < backup.sql
```

### 升级迁移

当数据库结构变更时：

1. 备份当前数据库
2. 更新迁移文件 `backend/src/utils/dbMigrate.js`
3. 运行迁移
```bash
npm run db:migrate
```

---

## 定时任务配置

配对服务需要定时运行。推荐使用 cron 或云函数。

### 使用 Cron（Linux/Mac）

```bash
# 编辑 crontab
crontab -e

# 添加以下行（每小时运行一次配对）
0 * * * * curl -X POST http://localhost:5000/api/admin/pairing/run

# 或者每天固定时间（例如每天下午6点）
0 18 * * * curl -X POST http://localhost:5000/api/admin/pairing/run
```

### 使用 Node-cron（推荐）

在 `backend/src/index.js` 中添加：

```javascript
const cron = require('node-cron');
const PairingService = require('./services/pairingService');

// 每小时运行一次配对
cron.schedule('0 * * * *', async () => {
  console.log('Running scheduled pairing...');
  try {
    await PairingService.performDailyPairing();
  } catch (error) {
    console.error('Scheduled pairing failed:', error);
  }
});
```

### 使用云函数（AWS Lambda / Google Cloud Functions）

创建定时触发的云函数，调用配对 API：

```javascript
exports.handler = async (event) => {
  const response = await fetch('https://your-api.com/api/admin/pairing/run', {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer your-admin-token'
    }
  });

  return {
    statusCode: 200,
    body: JSON.stringify('Pairing completed')
  };
};
```

---

## 监控和日志

### 应用监控

推荐工具：
- **Sentry**: 错误追踪
- **Datadog**: 性能监控
- **New Relic**: APM

### 日志管理

```bash
# PM2 日志
pm2 logs one-sentence-backend

# Docker 日志
docker-compose logs -f backend

# 日志文件
tail -f /var/log/one-sentence/app.log
```

### 健康检查

访问 `/health` 端点检查服务状态：

```bash
curl http://localhost:5000/health
```

---

## 安全建议

1. **使用 HTTPS**：生产环境必须使用 SSL/TLS
2. **设置防火墙**：只开放必要的端口
3. **定期更新**：保持依赖包最新
4. **备份数据**：每天自动备份数据库
5. **环境变量**：敏感信息不要硬编码
6. **限流保护**：防止 DDoS 攻击
7. **内容审核**：定期检查举报内容

---

## 故障排查

### 常见问题

**1. 数据库连接失败**
```bash
# 检查数据库是否运行
docker-compose ps
# 检查连接配置
cat backend/.env
```

**2. 前端无法访问 API**
- 检查 CORS 配置
- 确认 API 地址正确
- 查看浏览器控制台错误

**3. 配对不工作**
- 检查定时任务是否运行
- 查看后端日志
- 手动触发配对测试

---

## 性能优化

1. **数据库索引**：已在迁移中创建
2. **CDN**：使用 CDN 加速静态资源
3. **缓存**：使用 Redis 缓存热点数据
4. **压缩**：启用 Gzip 压缩
5. **负载均衡**：多实例部署

---

## 扩展建议

当用户增长时：

1. **水平扩展**：部署多个后端实例
2. **读写分离**：使用数据库主从复制
3. **消息队列**：使用 RabbitMQ/Redis 处理异步任务
4. **对象存储**：使用 S3 存储用户上传的图片
5. **搜索引擎**：使用 Elasticsearch 优化搜索

---

## 支持

如有问题，请查看：
- GitHub Issues
- 技术文档
- 开发者社区
