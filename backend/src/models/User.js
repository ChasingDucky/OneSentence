const db = require('../../config/database');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

class User {
  /**
   * 创建新用户
   */
  static async create({ email, phone, password, isGuest = false }) {
    const passwordHash = await bcrypt.hash(password, 10);

    const result = await db.query(
      `INSERT INTO users (email, phone, password_hash, is_guest, is_verified)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, email, phone, is_guest, created_at`,
      [email || null, phone || null, passwordHash, isGuest, isGuest]
    );

    const user = result.rows[0];

    // 创建对应的匿名档案
    const anonId = uuidv4();
    await db.query(
      `INSERT INTO anonymous_profiles (anon_id, user_id) VALUES ($1, $2)`,
      [anonId, user.id]
    );

    return { ...user, anonId };
  }

  /**
   * 通过邮箱或手机号查找用户
   */
  static async findByCredentials(email, phone) {
    const result = await db.query(
      `SELECT u.*, ap.anon_id
       FROM users u
       LEFT JOIN anonymous_profiles ap ON u.id = ap.user_id
       WHERE (u.email = $1 OR u.phone = $2) AND u.is_banned = false`,
      [email || null, phone || null]
    );

    return result.rows[0];
  }

  /**
   * 通过 ID 查找用户
   */
  static async findById(id) {
    const result = await db.query(
      `SELECT u.*, ap.anon_id
       FROM users u
       LEFT JOIN anonymous_profiles ap ON u.id = ap.user_id
       WHERE u.id = $1 AND u.is_banned = false`,
      [id]
    );

    return result.rows[0];
  }

  /**
   * 验证密码
   */
  static async verifyPassword(plainPassword, hashedPassword) {
    return bcrypt.compare(plainPassword, hashedPassword);
  }

  /**
   * 更新最后活跃时间
   */
  static async updateLastActive(userId) {
    await db.query(
      `UPDATE users SET last_active = CURRENT_TIMESTAMP WHERE id = $1`,
      [userId]
    );
  }

  /**
   * 更新用户偏好
   */
  static async updatePreferences(userId, preferences) {
    const result = await db.query(
      `UPDATE users SET preferences = $1 WHERE id = $2 RETURNING preferences`,
      [JSON.stringify(preferences), userId]
    );

    return result.rows[0];
  }
}

module.exports = User;
