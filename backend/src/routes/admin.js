const express = require('express');
const PairingService = require('../services/pairingService');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

/**
 * POST /api/admin/pairing/run
 * 手动触发配对（仅管理员）
 * 注意：实际应用中需要添加管理员权限检查
 */
router.post('/pairing/run', authenticateToken, async (req, res) => {
  try {
    const result = await PairingService.performDailyPairing();

    res.json({
      message: 'Pairing completed',
      result
    });

  } catch (error) {
    console.error('Manual pairing error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/admin/stats
 * 获取统计信息
 */
router.get('/stats', authenticateToken, async (req, res) => {
  try {
    const db = require('../../config/database');

    const stats = await db.query(`
      SELECT
        (SELECT COUNT(*) FROM users) as total_users,
        (SELECT COUNT(*) FROM users WHERE DATE(created_at) = CURRENT_DATE) as new_users_today,
        (SELECT COUNT(*) FROM messages WHERE DATE(created_at) = CURRENT_DATE) as messages_today,
        (SELECT COUNT(*) FROM pairings WHERE DATE(created_at) = CURRENT_DATE) as pairings_today,
        (SELECT COUNT(*) FROM reports WHERE status = 'pending') as pending_reports
    `);

    res.json({ stats: stats.rows[0] });

  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
