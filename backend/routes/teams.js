const express = require('express');
const TeamController = require('../controllers/TeamController');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

router.get('/', authenticateToken, TeamController.getAllTeams);
router.get('/:id', authenticateToken, TeamController.getTeamById);
router.get('/:id/members', authenticateToken, TeamController.getTeamMembers);
router.post('/', authenticateToken, TeamController.createTeam);
router.put('/:id', authenticateToken, TeamController.updateTeam);
router.delete('/:id', authenticateToken, TeamController.deleteTeam);
router.post('/:id/members', authenticateToken, TeamController.addTeamMember);
router.delete('/:id/members/:userId', authenticateToken, TeamController.removeTeamMember);

module.exports = router;