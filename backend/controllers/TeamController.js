const Team = require('../models/Team');

class TeamController {
  static async getAllTeams(req, res) {
    try {
      const teams = await Team.findAll(req.user.id);
      res.json({ success: true, data: teams });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  static async getTeamById(req, res) {
    try {
      const team = await Team.findById(req.params.id);
      if (!team) {
        return res.status(404).json({ success: false, message: '团队不存在' });
      }
      res.json({ success: true, data: team });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  static async createTeam(req, res) {
    try {
      const teamData = { ...req.body, created_by: req.user.id };
      const teamId = await Team.create(teamData);
      await Team.addMember(teamId, req.user.id, 'admin');
      const team = await Team.findById(teamId);
      res.json({ success: true, data: team });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  static async updateTeam(req, res) {
    try {
      await Team.update(req.params.id, req.body);
      const team = await Team.findById(req.params.id);
      res.json({ success: true, data: team });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  static async deleteTeam(req, res) {
    try {
      await Team.delete(req.params.id);
      res.json({ success: true, message: '团队已删除' });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  static async getTeamMembers(req, res) {
    try {
      const members = await Team.getMembers(req.params.id);
      res.json({ success: true, data: members });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  static async addTeamMember(req, res) {
    try {
      await Team.addMember(req.params.id, req.body.user_id, req.body.role);
      const members = await Team.getMembers(req.params.id);
      res.json({ success: true, data: members });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  static async removeTeamMember(req, res) {
    try {
      await Team.removeMember(req.params.id, req.params.userId);
      const members = await Team.getMembers(req.params.id);
      res.json({ success: true, data: members });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
}

module.exports = TeamController;