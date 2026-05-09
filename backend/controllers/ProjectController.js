const Project = require('../models/Project');
const Task = require('../models/Task');

class ProjectController {
  static async getAllProjects(req, res) {
    try {
      const projects = await Project.findAll(req.user.id);
      res.json({ success: true, data: projects });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  static async getProjectById(req, res) {
    try {
      const project = await Project.findById(req.params.id);
      if (!project) {
        return res.status(404).json({ success: false, message: '项目不存在' });
      }
      res.json({ success: true, data: project });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  static async createProject(req, res) {
    try {
      console.log('Creating project with data:', req.body);
      const projectData = { ...req.body, owner_id: req.user.id };
      const projectId = await Project.create(projectData);
      const project = await Project.findById(projectId);
      res.json({ success: true, data: project });
    } catch (error) {
      console.error('Create project error:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  }

  static async updateProject(req, res) {
    try {
      await Project.update(req.params.id, req.body);
      const project = await Project.findById(req.params.id);
      res.json({ success: true, data: project });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  static async deleteProject(req, res) {
    try {
      await Project.delete(req.params.id);
      res.json({ success: true, message: '项目已删除' });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  static async archiveProject(req, res) {
    try {
      await Project.update(req.params.id, { status: 'archived' });
      const project = await Project.findById(req.params.id);
      res.json({ success: true, data: project });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  static async getProjectStats(req, res) {
    try {
      const stats = await Project.getStats(req.params.id);
      res.json({ success: true, data: stats });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  static async searchProjects(req, res) {
    try {
      const keyword = req.query.keyword || '';
      const projects = await Project.search(keyword);
      res.json({ success: true, data: projects });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  static async getDashboardStats(req, res) {
    try {
      const projects = await Project.findAll(req.user.id);
      const activeProjects = projects.filter(p => p.status === 'active').length;
      
      const tasks = [];
      for (const project of projects) {
        const projectTasks = await Task.findByProject(project.id);
        tasks.push(...projectTasks);
      }
      
      const today = new Date().toISOString().split('T')[0];
      const todayTasks = tasks.filter(t => t.due_date === today && t.status !== 'closed');
      const completedTasks = tasks.filter(t => t.status === 'completed').length;
      const overdueTasks = tasks.filter(t => t.due_date < today && t.status !== 'completed' && t.status !== 'closed');
      
      res.json({
        success: true,
        data: {
          totalProjects: projects.length,
          activeProjects,
          totalTasks: tasks.length,
          todayTasks: todayTasks.length,
          completedTasks,
          overdueTasks: overdueTasks.length
        }
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
}

module.exports = ProjectController;