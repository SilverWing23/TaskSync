const express = require('express');
const ProjectController = require('../controllers/ProjectController');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

router.get('/', authenticateToken, ProjectController.getAllProjects);
router.get('/dashboard', authenticateToken, ProjectController.getDashboardStats);
router.get('/search', authenticateToken, ProjectController.searchProjects);
router.get('/:id', authenticateToken, ProjectController.getProjectById);
router.get('/:id/stats', authenticateToken, ProjectController.getProjectStats);
router.post('/', authenticateToken, ProjectController.createProject);
router.put('/:id', authenticateToken, ProjectController.updateProject);
router.delete('/:id', authenticateToken, ProjectController.deleteProject);
router.put('/:id/archive', authenticateToken, ProjectController.archiveProject);

module.exports = router;