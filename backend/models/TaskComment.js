const pool = require('../config/database');

class TaskComment {
  static async findByTask(taskId) {
    const [rows] = await pool.execute(
      'SELECT tc.*, u.nickname, u.avatar FROM task_comments tc ' +
      'LEFT JOIN users u ON tc.user_id = u.id ' +
      'WHERE tc.task_id = ? ORDER BY tc.created_at',
      [taskId]
    );
    return rows;
  }

  static async create(commentData) {
    const { task_id, user_id, content } = commentData;
    const [result] = await pool.execute(
      'INSERT INTO task_comments (task_id, user_id, content) VALUES (?, ?, ?)',
      [task_id, user_id, content]
    );
    return result.insertId;
  }

  static async delete(id) {
    const [result] = await pool.execute('DELETE FROM task_comments WHERE id = ?', [id]);
    return result.affectedRows;
  }
}

module.exports = TaskComment;