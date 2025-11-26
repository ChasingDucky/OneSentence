# One Sentence Today

一款基于匿名、随机配对的社交应用。每个用户每天只能发布一句话，该句子会以匿名形式随机发给另一个当天也发布了一句话的用户。

## 项目结构

```
OneSentence/
├── backend/          # 后端服务（Node.js + Express）
│   ├── src/
│   │   ├── routes/   # API 路由
│   │   ├── models/   # 数据模型
│   │   ├── middleware/  # 中间件
│   │   ├── services/    # 业务逻辑
│   │   └── utils/       # 工具函数
│   └── config/       # 配置文件
├── frontend/         # 前端应用（React）
│   ├── src/
│   │   ├── components/  # React 组件
│   │   ├── pages/       # 页面
│   │   ├── services/    # API 服务
│   │   ├── styles/      # 样式文件
│   │   └── utils/       # 工具函数
│   └── public/       # 静态资源
└── docs/            # 文档
```

## 核心功能

- **每日一句**：每天只能发布一句话（140字符限制）
- **匿名配对**：随机与其他用户匿名交换句子
- **安全过滤**：自动内容审核和敏感词过滤
- **情绪反应**：对收到的句子做简单反应
- **每日摘要**：查看每天的交互统计

## 技术栈

### 后端
- Node.js + Express
- PostgreSQL (数据库)
- Redis (缓存和队列)
- JWT (身份验证)

### 前端
- React
- Axios (HTTP 客户端)
- React Router (路由)
- CSS Modules (样式)

## 快速开始

### 前置要求
- Node.js 16+
- PostgreSQL 13+
- Redis (可选，用于生产环境)

### 安装

1. 克隆项目
```bash
git clone <repository-url>
cd OneSentence
```

2. 安装后端依赖
```bash
cd backend
npm install
```

3. 安装前端依赖
```bash
cd ../frontend
npm install
```

4. 配置环境变量
```bash
# 在 backend 目录下创建 .env 文件
cp backend/.env.example backend/.env
# 编辑 .env 文件，填入数据库等配置
```

5. 初始化数据库
```bash
cd backend
npm run db:migrate
```

### 运行

1. 启动后端服务
```bash
cd backend
npm run dev
```

2. 启动前端服务
```bash
cd frontend
npm start
```

3. 访问应用
打开浏览器访问 `http://localhost:3000`

## 开发计划

### MVP (第 1-6 周)
- [x] 项目架构搭建
- [ ] 用户注册和登录
- [ ] 发布每日一句
- [ ] 随机配对机制
- [ ] 内容过滤
- [ ] 基本 UI 界面

### 后续功能
- [ ] 主题日活动
- [ ] 地区/语言偏好
- [ ] 付费订阅功能
- [ ] 社区榜单

## 安全与隐私

- 完全匿名：消息不包含任何可追溯用户的信息
- 内容审核：自动过滤敏感内容
- 举报机制：用户可举报不当内容
- 数据加密：所有敏感数据加密存储

## 贡献

欢迎提交 Issue 和 Pull Request！

## 许可证

MIT License
