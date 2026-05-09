const KanbanColumn = require('../models/KanbanColumn');
const Task = require('../models/Task');

class KanbanController {
  static async getColumns(req, res) {
    try {
      const columns = await KanbanColumn.findByProject(req.params.projectId);
      const tasks = await Task.findByProject(req.params.projectId);
      
      const result = columns.map(col => ({
        ...col,
        tasks: tasks.filter(t => t.status === col.status_mapping)
      }));
      
      res.json({ success: true, data: result });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  static async createColumn(req, res) {
    try {
      console.log('[KanbanController] createColumn request body:', req.body);
      const columnData = { ...req.body };
      console.log('[KanbanController] columnData:', columnData);
      const columnId = await KanbanColumn.create(columnData);
      console.log('[KanbanController] columnId:', columnId);
      
      const columns = await KanbanColumn.findByProject(req.body.project_id);
      const tasks = await Task.findByProject(req.body.project_id);
      
      const result = columns.map(col => ({
        ...col,
        tasks: tasks.filter(t => t.status === col.status_mapping)
      }));
      
      console.log('[KanbanController] result:', result);
      res.json({ success: true, data: result });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  static async updateColumn(req, res) {
    try {
      await KanbanColumn.update(req.params.id, req.body);
      const columns = await KanbanColumn.findByProject(req.body.project_id);
      const tasks = await Task.findByProject(req.body.project_id);
      
      const result = columns.map(col => ({
        ...col,
        tasks: tasks.filter(t => t.status === col.status_mapping)
      }));
      
      res.json({ success: true, data: result });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  static async deleteColumn(req, res) {
    try {
      await KanbanColumn.delete(req.params.id);
      const columns = await KanbanColumn.findByProject(req.query.projectId);
      const tasks = await Task.findByProject(req.query.projectId);
      
      const result = columns.map(col => ({
        ...col,
        tasks: tasks.filter(t => t.status === col.status_mapping)
      }));
      
      res.json({ success: true, data: result });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  static async moveTask(req, res) {
    try {
      const { taskId, newStatus } = req.body;
      await Task.update(taskId, { status: newStatus });
      res.json({ success: true, message: '任务状态已更新' });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
}

module.exports = KanbanController;