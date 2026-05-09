const pool = require('../config/database');

class Team {
  static async findById(id) {
    const [rows] = await pool.execute(
      'SELECT t.*, u.nickname as creator_name FROM teams t ' +
      'LEFT JOIN users u ON t.created_by = u.id WHERE t.id = ?',
      [id]
    );
    return rows[0];
  }

  static async findAll(userId) {
    const [rows] = await pool.execute(
      'SELECT DISTINCT t.*, u.nickname as creator_name FROM teams t ' +
      'LEFT JOIN users u ON t.created_by = u.id ' +
      'LEFT JOIN team_members tm ON t.id = tm.team_id ' +
      'WHERE t.created_by = ? OR tm.user_id = ?',
      [userId, userId]
    );
    
    for (const team of rows) {
      team.members = await this.getMembers(team.id);
    }
    
    return rows;
  }

  static async create(teamData) {
    const { name, description, created_by } = teamData;
    const [result] = await pool.execute(
      'INSERT INTO teams (name, description, created_by) VALUES (?, ?, ?)',
      [name, description, created_by]
    );
    return result.insertId;
  }

  static async update(id, teamData) {
    const fields = [];
    const values = [];
    
    if (teamData.name !== undefined) {
      fields.push('name = ?');
      values.push(teamData.name || null);
    }
    if (teamData.description !== undefined) {
      fields.push('description = ?');
      values.push(teamData.description || null);
    }
    
    if (fields.length === 0) {
      return 0;
    }
    
    values.push(id);
    const [result] = await pool.execute(`UPDATE teams SET ${fields.join(', ')} WHERE id = ?`, values);
    return result.affectedRows;
  }

  static async delete(id) {
    const [result] = await pool.execute('DELETE FROM teams WHERE id = ?', [id]);
    return result.affectedRows;
  }

  static async addMember(teamId, userId, role = 'member') {
    const [result] = await pool.execute(
      'INSERT INTO team_members (team_id, user_id, role) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE role = ?',
      [teamId, userId, role, role]
    );
    return result.affectedRows;
  }

  static async removeMember(teamId, userId) {
    const [result] = await pool.execute('DELETE FROM team_members WHERE team_id = ? AND user_id = ?', [teamId, userId]);
    return result.affectedRows;
  }

  static async getMembers(teamId) {
    const [rows] = await pool.execute(
      'SELECT tm.team_id, u.id, u.username, u.email, u.nickname, u.avatar, tm.role FROM team_members tm ' +
      'LEFT JOIN users u ON tm.user_id = u.id WHERE tm.team_id = ?',
      [teamId]
    );
    return rows;
  }
}

module.exports = Team;