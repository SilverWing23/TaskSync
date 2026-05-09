const Task = require('../models/Task');
const TaskComment = require('../models/TaskComment');
const TaskChange = require('../models/TaskChange');
const TaskAttachment = require('../models/TaskAttachment');
const Notification = require('../models/Notification');

class TaskController {
  static async getTasksByProject(req, res) {
    try {
      const tasks = await Task.findByProject(req.params.projectId);
      res.json({ success: true, data: tasks });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  static async getTaskById(req, res) {
    try {
      const task = await Task.findById(req.params.id);
      if (!task) {
        return res.status(404).json({ success: false, message: '任务不存在' });
      }
      res.json({ success: true, data: task });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  static async createTask(req, res) {
    try {
      console.log('[TaskController] createTask request body:', req.body);
      const taskData = { ...req.body, created_by: req.user.id };
      console.log('[TaskController] taskData:', taskData);
      const taskId = await Task.create(taskData);
      
      if (taskData.assignee_id && taskData.assignee_id !== req.user.id) {
        await Notification.create({
          user_id: taskData.assignee_id,
          type: 'task_assigned',
          title: '新任务指派',
          content: `您被指派了新任务: ${taskData.title}`,
          task_id: taskId
        });
      }
      
      const task = await Task.findById(taskId);
      res.json({ success: true, data: task });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  static async updateTask(req, res) {
    try {
      const oldTask = await Task.findById(req.params.id);
      const updates = req.body;
      
      for (const key of Object.keys(updates)) {
        if (oldTask[key] !== updates[key]) {
          await TaskChange.create({
            task_id: req.params.id,
            user_id: req.user.id,
            field_name: key,
            old_value: String(oldTask[key]),
            new_value: String(updates[key])
          });
        }
      }
      
      if (updates.status && updates.status !== oldTask.status) {
        if (oldTask.assignee_id) {
          await Notification.create({
            user_id: oldTask.assignee_id,
            type: 'task_status',
            title: '任务状态变更',
            content: `任务 "${oldTask.title}" 状态变为: ${updates.status}`,
            task_id: req.params.id
          });
        }
      }
      
      await Task.update(req.params.id, updates);
      const task = await Task.findById(req.params.id);
      res.json({ success: true, data: task });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  static async deleteTask(req, res) {
    try {
      await Task.delete(req.params.id);
      res.json({ success: true, message: '任务已删除' });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  static async batchUpdateTasks(req, res) {
    try {
      const { taskIds, updates } = req.body;
      await Task.batchUpdate(taskIds, updates);
      res.json({ success: true, message: '批量更新成功' });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  static async getTodayTasks(req, res) {
    try {
      console.log('[TaskController] getTodayTasks userId:', req.user.id);
      const tasks = await Task.getTodayTasks(req.user.id);
      console.log('[TaskController] getTodayTasks result:', tasks);
      res.json({ success: true, data: tasks });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  static async getOverdueTasks(req, res) {
    try {
      console.log('[TaskController] getOverdueTasks userId:', req.user.id);
      const tasks = await Task.getOverdueTasks(req.user.id);
      console.log('[TaskController] getOverdueTasks result:', tasks);
      res.json({ success: true, data: tasks });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  static async searchTasks(req, res) {
    try {
      const keyword = req.query.keyword || '';
      const tasks = await Task.search(keyword);
      res.json({ success: true, data: tasks });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  static async getTaskComments(req, res) {
    try {
      const comments = await TaskComment.findByTask(req.params.taskId);
      res.json({ success: true, data: comments });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  static async addComment(req, res) {
    try {
      const commentData = { ...req.body, user_id: req.user.id };
      const commentId = await TaskComment.create(commentData);
      
      const task = await Task.findById(req.body.task_id);
      if (task.assignee_id && task.assignee_id !== req.user.id) {
        await Notification.create({
          user_id: task.assignee_id,
          type: 'task_comment',
          title: '任务评论',
          content: `${req.user.username} 评论了任务: ${task.title}`,
          task_id: req.body.task_id
        });
      }
      
      const comment = await TaskComment.findByTask(req.body.task_id);
      res.json({ success: true, data: comment });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  static async getTaskChanges(req, res) {
    try {
      const changes = await TaskChange.findByTask(req.params.taskId);
      res.json({ success: true, data: changes });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  static async getTaskAttachments(req, res) {
    try {
      const attachments = await TaskAttachment.findByTask(req.params.taskId);
      res.json({ success: true, data: attachments });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  static async addAttachment(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json({ success: false, message: '请上传文件' });
      }
      
      const attachmentData = {
        task_id: req.params.taskId,
        filename: req.file.originalname,
        filepath: req.file.path,
        file_size: req.file.size,
        uploaded_by: req.user.id
      };
      
      await TaskAttachment.create(attachmentData);
      const attachments = await TaskAttachment.findByTask(req.params.taskId);
      res.json({ success: true, data: attachments });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  static async deleteAttachment(req, res) {
    try {
      await TaskAttachment.delete(req.params.id);
      res.json({ success: true, message: '附件已删除' });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
}

module.exports = TaskController;