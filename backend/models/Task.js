const pool = require('../config/database');

function formatDate(dateStr) {
  if (!dateStr) return null;
  const date = new Date(dateStr);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

class Task {
  static async findById(id) {
    const [rows] = await pool.execute(
      'SELECT t.*, u.nickname as assignee_name, g.name as group_name FROM tasks t ' +
      'LEFT JOIN users u ON t.assignee_id = u.id ' +
      'LEFT JOIN task_groups g ON t.group_id = g.id ' +
      'WHERE t.id = ?',
      [id]
    );
    return rows[0];
  }

  static async findByProject(projectId) {
    const [rows] = await pool.execute(
      'SELECT t.*, u.nickname as assignee_name, g.name as group_name FROM tasks t ' +
      'LEFT JOIN users u ON t.assignee_id = u.id ' +
      'LEFT JOIN task_groups g ON t.group_id = g.id ' +
      'WHERE t.project_id = ? ORDER BY t.created_at DESC',
      [projectId]
    );
    return rows;
  }

  static async create(taskData) {
    try {
      console.log('[Task.create] taskData:', taskData);
      const { title, description, project_id, group_id, parent_id, assignee_id, priority, status, start_date, due_date, estimated_hours, tags, created_by } = taskData;
      const formattedStartDate = formatDate(start_date);
      const formattedDueDate = formatDate(due_date);
      console.log('[Task.create] formatted dates - start_date:', formattedStartDate, ', due_date:', formattedDueDate);
      const [result] = await pool.execute(
        'INSERT INTO tasks (title, description, project_id, group_id, parent_id, assignee_id, priority, status, start_date, due_date, estimated_hours, tags, created_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [title, description, project_id, group_id || null, parent_id || null, assignee_id || null, priority, status, formattedStartDate, formattedDueDate, estimated_hours || null, tags || null, created_by]
      );
      console.log('[Task.create] result:', result);
      return result.insertId;
    } catch (error) {
      console.error('[Task.create] Error:', error.message, error.stack);
      throw error;
    }
  }

  static async update(id, taskData) {
    const fields = [];
    const values = [];
    
    if (taskData.title) {
      fields.push('title = ?');
      values.push(taskData.title);
    }
    if (taskData.description !== undefined) {
      fields.push('description = ?');
      values.push(taskData.description);
    }
    if (taskData.group_id !== undefined) {
      fields.push('group_id = ?');
      values.push(taskData.group_id);
    }
    if (taskData.parent_id !== undefined) {
      fields.push('parent_id = ?');
      values.push(taskData.parent_id);
    }
    if (taskData.assignee_id !== undefined) {
      fields.push('assignee_id = ?');
      values.push(taskData.assignee_id);
    }
    if (taskData.priority) {
      fields.push('priority = ?');
      values.push(taskData.priority);
    }
    if (taskData.status) {
      fields.push('status = ?');
      values.push(taskData.status);
    }
    if (taskData.start_date !== undefined) {
      fields.push('start_date = ?');
      values.push(formatDate(taskData.start_date));
    }
    if (taskData.due_date !== undefined) {
      fields.push('due_date = ?');
      values.push(formatDate(taskData.due_date));
    }
    if (taskData.estimated_hours !== undefined) {
      fields.push('estimated_hours = ?');
      values.push(taskData.estimated_hours);
    }
    if (taskData.actual_hours !== undefined) {
      fields.push('actual_hours = ?');
      values.push(taskData.actual_hours);
    }
    if (taskData.tags) {
      fields.push('tags = ?');
      values.push(taskData.tags);
    }
    
    values.push(id);
    const [result] = await pool.execute(`UPDATE tasks SET ${fields.join(', ')} WHERE id = ?`, values);
    return result.affectedRows;
  }

  static async delete(id) {
    const [result] = await pool.execute('DELETE FROM tasks WHERE id = ?', [id]);
    return result.affectedRows;
  }

  static async batchUpdate(taskIds, updates) {
    const values = [];
    const placeholders = taskIds.map(() => '(?)').join(',');
    
    Object.keys(updates).forEach(key => {
      values.push(updates[key]);
    });
    
    const setClause = Object.keys(updates).map(key => `${key} = VALUES(${key})`).join(', ');
    const [result] = await pool.execute(
      `UPDATE tasks SET ${setClause} WHERE id IN (${placeholders})`,
      [...Object.values(updates), ...taskIds]
    );
    return result.affectedRows;
  }

  static async getByStatus(projectId, status) {
    const [rows] = await pool.execute(
      'SELECT t.*, u.nickname as assignee_name FROM tasks t ' +
      'LEFT JOIN users u ON t.assignee_id = u.id ' +
      'WHERE t.project_id = ? AND t.status = ?',
      [projectId, status]
    );
    return rows;
  }

  static async getByAssignee(assigneeId) {
    const [rows] = await pool.execute(
      'SELECT t.*, p.name as project_name FROM tasks t ' +
      'LEFT JOIN projects p ON t.project_id = p.id ' +
      'WHERE t.assignee_id = ? AND t.status != "closed"',
      [assigneeId]
    );
    return rows;
  }

  static async getTodayTasks(userId) {
    const today = new Date().toISOString().split('T')[0];
    const [rows] = await pool.execute(
      'SELECT t.*, p.name as project_name FROM tasks t ' +
      'LEFT JOIN projects p ON t.project_id = p.id ' +
      'WHERE t.due_date = ? AND t.status != "closed"',
      [today]
    );
    return rows;
  }

  static async getOverdueTasks(userId) {
    const today = new Date().toISOString().split('T')[0];
    const [rows] = await pool.execute(
      'SELECT t.*, p.name as project_name FROM tasks t ' +
      'LEFT JOIN projects p ON t.project_id = p.id ' +
      'WHERE t.due_date < ? AND t.status NOT IN ("completed", "closed")',
      [today]
    );
    return rows;
  }

  static async search(keyword) {
    const [rows] = await pool.execute(
      'SELECT t.*, p.name as project_name FROM tasks t ' +
      'LEFT JOIN projects p ON t.project_id = p.id ' +
      'WHERE t.title LIKE ? OR t.description LIKE ?',
      [`%${keyword}%`, `%${keyword}%`]
    );
    return rows;
  }
}

module.exports = Task;