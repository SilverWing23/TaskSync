const User = require('../models/User');

class UserController {
  static async getAllUsers(req, res) {
    try {
      const users = await User.getAll();
      res.json({ success: true, data: users });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  static async getUserById(req, res) {
    try {
      const user = await User.findById(req.params.id);
      if (!user) {
        return res.status(404).json({ success: false, message: '用户不存在' });
      }
      res.json({ success: true, data: user });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  static async searchUsers(req, res) {
    try {
      const keyword = req.query.keyword || '';
      const users = await User.search(keyword);
      res.json({ success: true, data: users });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  static async updateUserRole(req, res) {
    try {
      const { role } = req.body;
      const validRoles = ['super_admin', 'project_admin', 'member', 'readonly'];
      
      if (!validRoles.includes(role)) {
        return res.status(400).json({ success: false, message: '无效的角色' });
      }
      
      await User.update(req.params.id, { role });
      const user = await User.findById(req.params.id);
      res.json({ success: true, data: user });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
}

module.exports = UserController;