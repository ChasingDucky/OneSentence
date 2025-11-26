const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const messageRoutes = require('./routes/messages');
const reactionRoutes = require('./routes/reactions');
const reportRoutes = require('./routes/reports');
const adminRoutes = require('./routes/admin');

const app = express();
const PORT = process.env.PORT || 5000;

// 中间件
app.use(helmet()); // 安全头
app.use(cors()); // CORS
app.use(express.json()); // JSON 解析
app.use(express.urlencoded({ extended: true })); // URL 编码

// 速率限制
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15分钟
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // 最多100个请求
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/', limiter);

// 健康检查
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// 路由
app.use('/api/auth', authRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/reactions', reactionRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/admin', adminRoutes);

// 404 处理
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// 错误处理
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error'
  });
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════════╗
║                                               ║
║   One Sentence Today - Backend Server        ║
║                                               ║
║   Server running on port ${PORT}               ║
║   Environment: ${process.env.NODE_ENV || 'development'}                  ║
║                                               ║
╚═══════════════════════════════════════════════╝
  `);

  console.log('Available routes:');
  console.log('  POST   /api/auth/register');
  console.log('  POST   /api/auth/login');
  console.log('  GET    /api/auth/me');
  console.log('  POST   /api/messages');
  console.log('  GET    /api/messages/today');
  console.log('  GET    /api/messages/history');
  console.log('  POST   /api/reactions/:msgId');
  console.log('  POST   /api/reports/:msgId');
  console.log('  POST   /api/admin/pairing/run');
  console.log('  GET    /api/admin/stats');
  console.log('');
});

module.exports = app;
