const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { validateRequest, schemas } = require('../middleware/validation');

const router = express.Router();

/**
 * POST /api/auth/register
 * 用户注册
 */
router.post('/register', validateRequest(schemas.register), async (req, res) => {
  try {
    const { email, phone, password, isGuest } = req.body;

    // 检查用户是否已存在
    const existingUser = await User.findByCredentials(email, phone);
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // 创建用户
    const user = await User.create({ email, phone, password, isGuest });

    // 生成 JWT
    const token = jwt.sign(
      { userId: user.id, anonId: user.anonId },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: user.id,
        email: user.email,
        phone: user.phone,
        isGuest: user.is_guest,
        createdAt: user.created_at
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /api/auth/login
 * 用户登录
 */
router.post('/login', validateRequest(schemas.login), async (req, res) => {
  try {
    const { email, phone, password } = req.body;

    // 查找用户
    const user = await User.findByCredentials(email, phone);
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // 验证密码
    const isValid = await User.verifyPassword(password, user.password_hash);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // 更新最后活跃时间
    await User.updateLastActive(user.id);

    // 生成 JWT
    const token = jwt.sign(
      { userId: user.id, anonId: user.anon_id },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        phone: user.phone,
        isGuest: user.is_guest,
        lastActive: user.last_active
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/auth/me
 * 获取当前用户信息
 */
router.get('/me', async (req, res) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      user: {
        id: user.id,
        email: user.email,
        phone: user.phone,
        isGuest: user.is_guest,
        isVerified: user.is_verified,
        preferences: user.preferences,
        createdAt: user.created_at,
        lastActive: user.last_active
      }
    });

  } catch (error) {
    console.error('Get user error:', error);
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid token' });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
