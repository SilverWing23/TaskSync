const pool = require('../config/database');

class TaskChange {
  static async findByTask(taskId) {
    const [rows] = await pool.execute(
      'SELECT tc.*, u.nickname FROM task_changes tc ' +
      'LEFT JOIN users u ON tc.user_id = u.id ' +
      'WHERE tc.task_id = ? ORDER BY tc.changed_at DESC',
      [taskId]
    );
    return rows;
  }

  static async create(changeData) {
    const { task_id, user_id, field_name, old_value, new_value } = changeData;
    const [result] = await pool.execute(
      'INSERT INTO task_changes (task_id, user_id, field_name, old_value, new_value) VALUES (?, ?, ?, ?, ?)',
      [task_id, user_id, field_name, old_value, new_value]
    );
    return result.insertId;
  }
}

module.exports = TaskChange;