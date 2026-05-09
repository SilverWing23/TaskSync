const Notification = require('../models/Notification');

class NotificationController {
  static async getNotifications(req, res) {
    try {
      console.log('Getting notifications for user:', req.user.id);
      const notifications = await Notification.findByUser(req.user.id);
      res.json({ success: true, data: notifications });
    } catch (error) {
      console.error('Error getting notifications:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  }

  static async markAsRead(req, res) {
    try {
      console.log('Marking notification as read:', req.params.id, 'for user:', req.user.id);
      await Notification.markAsRead(req.user.id, req.params.id);
      const notifications = await Notification.findByUser(req.user.id);
      res.json({ success: true, data: notifications });
    } catch (error) {
      console.error('Error marking notification as read:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  }

  static async markAllAsRead(req, res) {
    try {
      console.log('Marking all notifications as read for user:', req.user.id);
      await Notification.markAsRead(req.user.id);
      res.json({ success: true, message: '全部已读' });
    } catch (error) {
      console.error('Error marking all as read:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  }

  static async getUnreadCount(req, res) {
    try {
      console.log('Getting unread count for user:', req.user.id);
      const count = await Notification.getUnreadCount(req.user.id);
      console.log('Unread count:', count);
      res.json({ success: true, data: { count } });
    } catch (error) {
      console.error('Error getting unread count:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  }

  static async deleteNotification(req, res) {
    try {
      console.log('Deleting notification:', req.params.id);
      await Notification.delete(req.params.id);
      res.json({ success: true, message: '通知已删除' });
    } catch (error) {
      console.error('Error deleting notification:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  }
}

module.exports = NotificationController;