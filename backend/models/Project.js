const pool = require('../config/database');

function formatDate(dateStr) {
  if (!dateStr || dateStr === '') return null;
  if (dateStr.includes('T')) {
    return dateStr.split('T')[0];
  }
  return dateStr;
}

class Project {
  static async findById(id) {
    const [rows] = await pool.execute(
      'SELECT p.*, u.nickname as owner_name, t.name as team_name FROM projects p ' +
      'LEFT JOIN users u ON p.owner_id = u.id ' +
      'LEFT JOIN teams t ON p.team_id = t.id ' +
      'WHERE p.id = ? AND p.status != "deleted"',
      [id]
    );
    return rows[0];
  }

  static async findAll(userId) {
    const [rows] = await pool.execute(
      'SELECT DISTINCT p.*, u.nickname as owner_name, t.name as team_name FROM projects p ' +
      'LEFT JOIN users u ON p.owner_id = u.id ' +
      'LEFT JOIN teams t ON p.team_id = t.id ' +
      'LEFT JOIN project_members pm ON p.id = pm.project_id ' +
      'WHERE p.status != "deleted" AND (p.owner_id = ? OR pm.user_id = ?)',
      [userId, userId]
    );
    return rows;
  }

  static async create(projectData) {
    const { name, description, start_date, end_date, owner_id, team_id, priority = 'medium', tags } = projectData;
    const formattedStartDate = formatDate(start_date);
    const formattedEndDate = formatDate(end_date);
    const [result] = await pool.execute(
      'INSERT INTO projects (name, description, start_date, end_date, owner_id, team_id, priority, tags) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [name, description || null, formattedStartDate, formattedEndDate, owner_id, team_id || null, priority, tags || null]
    );
    return result.insertId;
  }

  static async update(id, projectData) {
    const fields = [];
    const values = [];
    
    if (projectData.name !== undefined) {
      fields.push('name = ?');
      values.push(projectData.name || null);
    }
    if (projectData.description !== undefined) {
      fields.push('description = ?');
      values.push(projectData.description || null);
    }
    if (projectData.start_date !== undefined) {
      fields.push('start_date = ?');
      values.push(formatDate(projectData.start_date));
    }
    if (projectData.end_date !== undefined) {
      fields.push('end_date = ?');
      values.push(formatDate(projectData.end_date));
    }
    if (projectData.team_id !== undefined) {
      fields.push('team_id = ?');
      values.push(projectData.team_id || null);
    }
    if (projectData.priority !== undefined) {
      fields.push('priority = ?');
      values.push(projectData.priority || 'medium');
    }
    if (projectData.status !== undefined) {
      fields.push('status = ?');
      values.push(projectData.status);
    }
    if (projectData.tags !== undefined) {
      fields.push('tags = ?');
      values.push(projectData.tags || null);
    }
    
    if (fields.length === 0) {
      return 0;
    }
    
    values.push(id);
    const [result] = await pool.execute(`UPDATE projects SET ${fields.join(', ')} WHERE id = ?`, values);
    return result.affectedRows;
  }

  static async delete(id) {
    const [result] = await pool.execute('UPDATE projects SET status = "deleted" WHERE id = ?', [id]);
    return result.affectedRows;
  }

  static async getStats(projectId) {
    const [statusStats] = await pool.execute(
      'SELECT status, COUNT(*) as count FROM tasks WHERE project_id = ? GROUP BY status',
      [projectId]
    );
    const [memberWorkload] = await pool.execute(
      'SELECT u.nickname, COUNT(t.id) as task_count FROM tasks t ' +
      'LEFT JOIN users u ON t.assignee_id = u.id ' +
      'WHERE t.project_id = ? GROUP BY u.id',
      [projectId]
    );
    return { statusStats, memberWorkload };
  }

  static async search(keyword) {
    const [rows] = await pool.execute(
      'SELECT p.id, p.name, p.description, u.nickname as owner_name FROM projects p ' +
      'LEFT JOIN users u ON p.owner_id = u.id ' +
      'WHERE p.status != "deleted" AND (p.name LIKE ? OR p.description LIKE ?)',
      [`%${keyword}%`, `%${keyword}%`]
    );
    return rows;
  }
}

module.exports = Project;