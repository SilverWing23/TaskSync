const express = require('express');
const KanbanController = require('../controllers/KanbanController');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

router.get('/project/:projectId', authenticateToken, KanbanController.getColumns);
router.post('/columns', authenticateToken, KanbanController.createColumn);
router.put('/columns/:id', authenticateToken, KanbanController.updateColumn);
router.delete('/columns/:id', authenticateToken, KanbanController.deleteColumn);
router.put('/move-task', authenticateToken, KanbanController.moveTask);

module.exports = router;