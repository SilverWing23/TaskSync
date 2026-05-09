const pool = require('../config/database');

class KanbanColumn {
  static async findByProject(projectId) {
    const [rows] = await pool.execute(
      'SELECT * FROM kanban_columns WHERE project_id = ? ORDER BY sort_order',
      [projectId]
    );
    return rows;
  }

  static async create(columnData) {
    try {
      console.log('[KanbanColumn.create] columnData:', columnData);
      const { project_id, name, sort_order = 0, status_mapping } = columnData;
      const [result] = await pool.execute(
        'INSERT INTO kanban_columns (project_id, name, sort_order, status_mapping) VALUES (?, ?, ?, ?)',
        [project_id, name, sort_order, status_mapping]
      );
      console.log('[KanbanColumn.create] result:', result);
      return result.insertId;
    } catch (error) {
      console.error('[KanbanColumn.create] Error:', error.message, error.stack);
      throw error;
    }
  }

  static async update(id, columnData) {
    const fields = [];
    const values = [];
    
    if (columnData.name) {
      fields.push('name = ?');
      values.push(columnData.name);
    }
    if (columnData.sort_order !== undefined) {
      fields.push('sort_order = ?');
      values.push(columnData.sort_order);
    }
    if (columnData.status_mapping) {
      fields.push('status_mapping = ?');
      values.push(columnData.status_mapping);
    }
    
    values.push(id);
    const [result] = await pool.execute(`UPDATE kanban_columns SET ${fields.join(', ')} WHERE id = ?`, values);
    return result.affectedRows;
  }

  static async delete(id) {
    const [result] = await pool.execute('DELETE FROM kanban_columns WHERE id = ?', [id]);
    return result.affectedRows;
  }
}

module.exports = KanbanColumn;