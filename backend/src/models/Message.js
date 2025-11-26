const db = require('../../config/database');

class Message {
  /**
   * 创建新消息
   */
  static async create({ anonId, text, language = 'zh', metadata = {} }) {
    const result = await db.query(
      `INSERT INTO messages (anon_id, text, language, metadata)
       VALUES ($1, $2, $3, $4)
       RETURNING msg_id, anon_id, text, created_at, language`,
      [anonId, text, language, JSON.stringify(metadata)]
    );

    return result.rows[0];
  }

  /**
   * 标记消息为已过滤
   */
  static async markAsFiltered(msgId, reason) {
    await db.query(
      `UPDATE messages SET is_filtered = true, filter_reason = $1 WHERE msg_id = $2`,
      [reason, msgId]
    );
  }

  /**
   * 获取今天某用户是否已发布消息
   */
  static async getTodayMessageByAnonId(anonId) {
    const result = await db.query(
      `SELECT * FROM messages
       WHERE anon_id = $1
       AND DATE(created_at) = CURRENT_DATE
       AND is_filtered = false
       ORDER BY created_at DESC
       LIMIT 1`,
      [anonId]
    );

    return result.rows[0];
  }

  /**
   * 获取今天所有未配对的消息
   */
  static async getTodayUnpairedMessages() {
    const result = await db.query(
      `SELECT m.* FROM messages m
       WHERE DATE(m.created_at) = CURRENT_DATE
       AND m.is_filtered = false
       AND NOT EXISTS (
         SELECT 1 FROM pairings p
         WHERE p.msg_id_from = m.msg_id OR p.msg_id_to = m.msg_id
       )
       ORDER BY m.created_at`
    );

    return result.rows;
  }

  /**
   * 获取消息详情
   */
  static async findById(msgId) {
    const result = await db.query(
      `SELECT * FROM messages WHERE msg_id = $1`,
      [msgId]
    );

    return result.rows[0];
  }

  /**
   * 获取用户的历史消息
   */
  static async getHistoryByAnonId(anonId, limit = 30) {
    const result = await db.query(
      `SELECT msg_id, text, created_at, language,
              (SELECT COUNT(*) FROM reactions WHERE msg_id = messages.msg_id) as reaction_count,
              (SELECT COUNT(*) FROM favorites WHERE msg_id = messages.msg_id) as favorite_count
       FROM messages
       WHERE anon_id = $1
       ORDER BY created_at DESC
       LIMIT $2`,
      [anonId, limit]
    );

    return result.rows;
  }
}

module.exports = Message;
