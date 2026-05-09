const express = require('express');
const TaskGroupController = require('../controllers/TaskGroupController');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

router.get('/project/:projectId', authenticateToken, TaskGroupController.getGroupsByProject);
router.post('/', authenticateToken, TaskGroupController.createGroup);
router.put('/:id', authenticateToken, TaskGroupController.updateGroup);
router.delete('/:id', authenticateToken, TaskGroupController.deleteGroup);

module.exports = router;