const db = require('../../config/database');

class Pairing {
  /**
   * 创建配对
   */
  static async create(msgIdFrom, msgIdTo) {
    const result = await db.query(
      `INSERT INTO pairings (msg_id_from, msg_id_to)
       VALUES ($1, $2)
       RETURNING pairing_id, msg_id_from, msg_id_to, created_at`,
      [msgIdFrom, msgIdTo]
    );

    return result.rows[0];
  }

  /**
   * 获取某条消息收到的配对（即别人发给它的消息）
   */
  static async getReceivedPairing(msgId) {
    const result = await db.query(
      `SELECT p.*, m.text, m.created_at as message_created_at, m.language
       FROM pairings p
       JOIN messages m ON p.msg_id_from = m.msg_id
       WHERE p.msg_id_to = $1
       ORDER BY p.created_at DESC
       LIMIT 1`,
      [msgId]
    );

    return result.rows[0];
  }

  /**
   * 获取某条消息发出的配对（即它发给别人的消息）
   */
  static async getSentPairing(msgId) {
    const result = await db.query(
      `SELECT p.*, m.text, m.created_at as message_created_at, m.language
       FROM pairings p
       JOIN messages m ON p.msg_id_to = m.msg_id
       WHERE p.msg_id_from = $1
       ORDER BY p.created_at DESC
       LIMIT 1`,
      [msgId]
    );

    return result.rows[0];
  }

  /**
   * 检查两条消息是否在近期已配对过（防重复）
   */
  static async hasRecentPairing(anonId1, anonId2, days = 7) {
    const result = await db.query(
      `SELECT COUNT(*) as count FROM pairings p
       JOIN messages m1 ON p.msg_id_from = m1.msg_id
       JOIN messages m2 ON p.msg_id_to = m2.msg_id
       WHERE ((m1.anon_id = $1 AND m2.anon_id = $2) OR (m1.anon_id = $2 AND m2.anon_id = $1))
       AND p.created_at > NOW() - INTERVAL '${days} days'`,
      [anonId1, anonId2]
    );

    return result.rows[0].count > 0;
  }

  /**
   * 标记配对为已读
   */
  static async markAsRead(pairingId) {
    await db.query(
      `UPDATE pairings SET is_read = true WHERE pairing_id = $1`,
      [pairingId]
    );
  }

  /**
   * 获取用户今天收到的配对
   */
  static async getTodayReceivedByAnonId(anonId) {
    const result = await db.query(
      `SELECT p.*,
              m_from.text as received_text,
              m_from.created_at as received_created_at,
              m_from.language as received_language,
              (SELECT COUNT(*) FROM reactions WHERE msg_id = m_from.msg_id) as reaction_count
       FROM pairings p
       JOIN messages m_to ON p.msg_id_to = m_to.msg_id
       JOIN messages m_from ON p.msg_id_from = m_from.msg_id
       WHERE m_to.anon_id = $1
       AND DATE(p.created_at) = CURRENT_DATE
       ORDER BY p.created_at DESC
       LIMIT 1`,
      [anonId]
    );

    return result.rows[0];
  }
}

module.exports = Pairing;
