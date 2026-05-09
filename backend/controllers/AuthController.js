const User = require('../models/User');
const { hashPassword, comparePassword } = require('../utils/password');
const { generateToken } = require('../utils/jwt');

class AuthController {
  static async register(req, res) {
    try {
      console.log('Registering user:', req.body.email);
      const { username, email, password, nickname } = req.body;
      
      const existingUser = await User.findByEmail(email);
      if (existingUser) {
        return res.status(400).json({ success: false, message: '邮箱已被注册' });
      }
      
      const existingUsername = await User.findByUsername(username);
      if (existingUsername) {
        return res.status(400).json({ success: false, message: '用户名已被使用' });
      }
      
      const hashedPassword = await hashPassword(password);
      const userId = await User.create({ username, email, password: hashedPassword, nickname });
      
      const user = await User.findById(userId);
      const token = generateToken(user);
      
      res.json({ success: true, data: { user, token } });
    } catch (error) {
      console.error('Register error:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  }

  static async login(req, res) {
    try {
      console.log('Login attempt:', req.body.email);
      const { email, password } = req.body;
      
      const user = await User.findByEmail(email);
      if (!user) {
        console.log('User not found');
        return res.status(400).json({ success: false, message: '邮箱或密码错误' });
      }
      
      const isValid = await comparePassword(password, user.password);
      if (!isValid) {
        console.log('Invalid password');
        return res.status(400).json({ success: false, message: '邮箱或密码错误' });
      }
      
      const token = generateToken(user);
      const userData = { id: user.id, username: user.username, email: user.email, nickname: user.nickname, avatar: user.avatar, role: user.role };
      
      console.log('Login successful for user:', user.id);
      res.json({ success: true, data: { user: userData, token } });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  }

  static async getProfile(req, res) {
    try {
      console.log('Getting profile for user:', req.user.id);
      const user = await User.findById(req.user.id);
      console.log('User profile:', user);
      res.json({ success: true, data: user });
    } catch (error) {
      console.error('Get profile error:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  }

  static async updateProfile(req, res) {
    try {
      console.log('Updating profile for user:', req.user.id);
      const { nickname, avatar } = req.body;
      await User.update(req.user.id, { nickname, avatar });
      const user = await User.findById(req.user.id);
      res.json({ success: true, data: user });
    } catch (error) {
      console.error('Update profile error:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  }

  static async changePassword(req, res) {
    try {
      console.log('Changing password for user:', req.user.id);
      const { oldPassword, newPassword } = req.body;
      const user = await User.findByEmail(req.user.email);
      
      const isValid = await comparePassword(oldPassword, user.password);
      if (!isValid) {
        return res.status(400).json({ success: false, message: '原密码错误' });
      }
      
      const hashedPassword = await hashPassword(newPassword);
      await User.update(req.user.id, { password: hashedPassword });
      
      res.json({ success: true, message: '密码修改成功' });
    } catch (error) {
      console.error('Change password error:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  }
}

module.exports = AuthController;