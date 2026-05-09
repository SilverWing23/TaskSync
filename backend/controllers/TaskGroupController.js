const TaskGroup = require('../models/TaskGroup');

class TaskGroupController {
  static async getGroupsByProject(req, res) {
    try {
      const groups = await TaskGroup.findByProject(req.params.projectId);
      res.json({ success: true, data: groups });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  static async createGroup(req, res) {
    try {
      const groupData = { ...req.body };
      const groupId = await TaskGroup.create(groupData);
      const groups = await TaskGroup.findByProject(req.body.project_id);
      res.json({ success: true, data: groups });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  static async updateGroup(req, res) {
    try {
      await TaskGroup.update(req.params.id, req.body);
      const groups = await TaskGroup.findByProject(req.body.project_id);
      res.json({ success: true, data: groups });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  static async deleteGroup(req, res) {
    try {
      const group = await TaskGroup.findByProject(req.query.projectId);
      const index = group.findIndex(g => g.id === parseInt(req.params.id));
      
      await TaskGroup.delete(req.params.id);
      
      const groups = await TaskGroup.findByProject(req.query.projectId);
      groups.forEach((g, i) => {
        if (i >= index) {
          TaskGroup.update(g.id, { sort_order: i });
        }
      });
      
      const updatedGroups = await TaskGroup.findByProject(req.query.projectId);
      res.json({ success: true, data: updatedGroups });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
}

module.exports = TaskGroupController;