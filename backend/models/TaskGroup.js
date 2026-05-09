const pool = require('../config/database');

class TaskGroup {
  static async findByProject(projectId) {
    const [rows] = await pool.execute(
      'SELECT * FROM task_groups WHERE project_id = ? ORDER BY sort_order',
      [projectId]
    );
    return rows;
  }

  static async create(groupData) {
    const { project_id, name, sort_order = 0 } = groupData;
    const [result] = await pool.execute(
      'INSERT INTO task_groups (project_id, name, sort_order) VALUES (?, ?, ?)',
      [project_id, name, sort_order]
    );
    return result.insertId;
  }

  static async update(id, groupData) {
    const fields = [];
    const values = [];
    
    if (groupData.name) {
      fields.push('name = ?');
      values.push(groupData.name);
    }
    if (groupData.sort_order !== undefined) {
      fields.push('sort_order = ?');
      values.push(groupData.sort_order);
    }
    
    values.push(id);
    const [result] = await pool.execute(`UPDATE task_groups SET ${fields.join(', ')} WHERE id = ?`, values);
    return result.affectedRows;
  }

  static async delete(id) {
    const [result] = await pool.execute('DELETE FROM task_groups WHERE id = ?', [id]);
    return result.affectedRows;
  }
}

module.exports = TaskGroup;