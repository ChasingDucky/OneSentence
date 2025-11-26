const express = require('express');
const db = require('../../config/database');
const { authenticateToken } = require('../middleware/auth');
const { validateRequest, schemas } = require('../middleware/validation');

const router = express.Router();

/**
 * POST /api/reactions/:msgId
 * 对消息添加反应
 */
router.post('/:msgId', authenticateToken, validateRequest(schemas.createReaction), async (req, res) => {
  try {
    const { msgId } = req.params;
    const { reactionType } = req.body;
    const { anonId } = req.user;

    // 检查消息是否存在
    const messageCheck = await db.query(
      'SELECT msg_id FROM messages WHERE msg_id = $1',
      [msgId]
    );

    if (messageCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Message not found' });
    }

    // 创建或更新反应
    const result = await db.query(
      `INSERT INTO reactions (msg_id, anon_id, reaction_type)
       VALUES ($1, $2, $3)
       ON CONFLICT (msg_id, anon_id)
       DO UPDATE SET reaction_type = $3, created_at = CURRENT_TIMESTAMP
       RETURNING *`,
      [msgId, anonId, reactionType]
    );

    res.status(201).json({
      message: 'Reaction added successfully',
      reaction: result.rows[0]
    });

  } catch (error) {
    console.error('Create reaction error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * DELETE /api/reactions/:msgId
 * 删除对消息的反应
 */
router.delete('/:msgId', authenticateToken, async (req, res) => {
  try {
    const { msgId } = req.params;
    const { anonId } = req.user;

    const result = await db.query(
      'DELETE FROM reactions WHERE msg_id = $1 AND anon_id = $2 RETURNING *',
      [msgId, anonId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Reaction not found' });
    }

    res.json({ message: 'Reaction removed successfully' });

  } catch (error) {
    console.error('Delete reaction error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /api/favorites/:msgId
 * 收藏消息
 */
router.post('/favorites/:msgId', authenticateToken, async (req, res) => {
  try {
    const { msgId } = req.params;
    const { anonId } = req.user;

    const result = await db.query(
      `INSERT INTO favorites (msg_id, anon_id)
       VALUES ($1, $2)
       ON CONFLICT (msg_id, anon_id) DO NOTHING
       RETURNING *`,
      [msgId, anonId]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({ error: 'Already favorited' });
    }

    res.status(201).json({
      message: 'Message favorited successfully',
      favorite: result.rows[0]
    });

  } catch (error) {
    console.error('Create favorite error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * DELETE /api/favorites/:msgId
 * 取消收藏
 */
router.delete('/favorites/:msgId', authenticateToken, async (req, res) => {
  try {
    const { msgId } = req.params;
    const { anonId } = req.user;

    const result = await db.query(
      'DELETE FROM favorites WHERE msg_id = $1 AND anon_id = $2 RETURNING *',
      [msgId, anonId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Favorite not found' });
    }

    res.json({ message: 'Favorite removed successfully' });

  } catch (error) {
    console.error('Delete favorite error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/favorites
 * 获取收藏列表
 */
router.get('/favorites', authenticateToken, async (req, res) => {
  try {
    const { anonId } = req.user;

    const result = await db.query(
      `SELECT f.*, m.text, m.created_at as message_created_at, m.language
       FROM favorites f
       JOIN messages m ON f.msg_id = m.msg_id
       WHERE f.anon_id = $1
       ORDER BY f.created_at DESC`,
      [anonId]
    );

    res.json({
      favorites: result.rows,
      count: result.rows.length
    });

  } catch (error) {
    console.error('Get favorites error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
