const pool = require('../config/database');

class TaskAttachment {
  static async findByTask(taskId) {
    const [rows] = await pool.execute(
      'SELECT ta.*, u.nickname as uploader_name FROM task_attachments ta ' +
      'LEFT JOIN users u ON ta.uploaded_by = u.id ' +
      'WHERE ta.task_id = ? ORDER BY ta.uploaded_at DESC',
      [taskId]
    );
    return rows;
  }

  static async create(attachmentData) {
    const { task_id, filename, filepath, file_size, uploaded_by } = attachmentData;
    const [result] = await pool.execute(
      'INSERT INTO task_attachments (task_id, filename, filepath, file_size, uploaded_by) VALUES (?, ?, ?, ?, ?)',
      [task_id, filename, filepath, file_size, uploaded_by]
    );
    return result.insertId;
  }

  static async delete(id) {
    const [result] = await pool.execute('DELETE FROM task_attachments WHERE id = ?', [id]);
    return result.affectedRows;
  }
}

module.exports = TaskAttachment;