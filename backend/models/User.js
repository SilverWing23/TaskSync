const pool = require('../config/database');

class User {
  static async findById(id) {
    const [rows] = await pool.execute('SELECT id, username, email, nickname, avatar, role, created_at FROM users WHERE id = ?', [id]);
    return rows[0];
  }

  static async findByEmail(email) {
    const [rows] = await pool.execute('SELECT * FROM users WHERE email = ?', [email]);
    return rows[0];
  }

  static async findByUsername(username) {
    const [rows] = await pool.execute('SELECT id, username, email, nickname, avatar, role, created_at FROM users WHERE username = ?', [username]);
    return rows[0];
  }

  static async create(userData) {
    const { username, email, password, nickname, role = 'member' } = userData;
    const [result] = await pool.execute(
      'INSERT INTO users (username, email, password, nickname, role) VALUES (?, ?, ?, ?, ?)',
      [username, email, password, nickname, role]
    );
    return result.insertId;
  }

  static async update(id, userData) {
    const fields = [];
    const values = [];
    
    if (userData.nickname !== undefined) {
      fields.push('nickname = ?');
      values.push(userData.nickname || null);
    }
    if (userData.avatar !== undefined) {
      fields.push('avatar = ?');
      values.push(userData.avatar || null);
    }
    if (userData.password !== undefined) {
      fields.push('password = ?');
      values.push(userData.password);
    }
    if (userData.role !== undefined) {
      fields.push('role = ?');
      values.push(userData.role);
    }
    
    if (fields.length === 0) {
      return 0;
    }
    
    values.push(id);
    const [result] = await pool.execute(`UPDATE users SET ${fields.join(', ')} WHERE id = ?`, values);
    return result.affectedRows;
  }

  static async getAll() {
    const [rows] = await pool.execute('SELECT id, username, email, nickname, avatar, role, created_at FROM users');
    return rows;
  }

  static async search(keyword) {
    const [rows] = await pool.execute(
      'SELECT id, username, email, nickname, avatar, role, created_at FROM users WHERE username LIKE ? OR email LIKE ? OR nickname LIKE ?',
      [`%${keyword}%`, `%${keyword}%`, `%${keyword}%`]
    );
    return rows;
  }
}

module.exports = User;