const pool = require('../config/database');

class Notification {
  static async findByUser(userId) {
    const [rows] = await pool.execute(
      'SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC',
      [userId]
    );
    return rows;
  }

  static async create(notificationData) {
    const { user_id, type, title, content, task_id } = notificationData;
    const [result] = await pool.execute(
      'INSERT INTO notifications (user_id, type, title, content, task_id) VALUES (?, ?, ?, ?, ?)',
      [user_id, type, title, content, task_id]
    );
    return result.insertId;
  }

  static async markAsRead(userId, notificationId = null) {
    let query = 'UPDATE notifications SET `read` = TRUE WHERE user_id = ?';
    const params = [userId];
    
    if (notificationId) {
      query += ' AND id = ?';
      params.push(notificationId);
    }
    
    const [result] = await pool.execute(query, params);
    return result.affectedRows;
  }

  static async getUnreadCount(userId) {
    const [rows] = await pool.execute(
      'SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND `read` = FALSE',
      [userId]
    );
    return rows[0].count;
  }

  static async delete(id) {
    const [result] = await pool.execute('DELETE FROM notifications WHERE id = ?', [id]);
    return result.affectedRows;
  }
}

module.exports = Notification;