const express = require('express');
const db = require('../../config/database');
const { authenticateToken } = require('../middleware/auth');
const { validateRequest, schemas } = require('../middleware/validation');

const router = express.Router();

/**
 * POST /api/reports/:msgId
 * 举报消息
 */
router.post('/:msgId', authenticateToken, validateRequest(schemas.createReport), async (req, res) => {
  try {
    const { msgId } = req.params;
    const { reason } = req.body;
    const { anonId } = req.user;

    // 检查消息是否存在
    const messageCheck = await db.query(
      'SELECT msg_id FROM messages WHERE msg_id = $1',
      [msgId]
    );

    if (messageCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Message not found' });
    }

    // 检查是否已举报过
    const existingReport = await db.query(
      'SELECT * FROM reports WHERE msg_id = $1 AND reporter_anon_id = $2',
      [msgId, anonId]
    );

    if (existingReport.rows.length > 0) {
      return res.status(400).json({ error: 'You have already reported this message' });
    }

    // 创建举报
    const result = await db.query(
      `INSERT INTO reports (msg_id, reporter_anon_id, reason)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [msgId, anonId, reason]
    );

    res.status(201).json({
      message: 'Report submitted successfully',
      report: result.rows[0]
    });

  } catch (error) {
    console.error('Create report error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/reports (Admin only - 未实现权限检查)
 * 获取所有举报
 */
router.get('/', authenticateToken, async (req, res) => {
  try {
    const status = req.query.status || 'pending';

    const result = await db.query(
      `SELECT r.*, m.text as message_text
       FROM reports r
       JOIN messages m ON r.msg_id = m.msg_id
       WHERE r.status = $1
       ORDER BY r.created_at DESC`,
      [status]
    );

    res.json({
      reports: result.rows,
      count: result.rows.length
    });

  } catch (error) {
    console.error('Get reports error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
