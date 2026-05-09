const express = require('express');
const TaskController = require('../controllers/TaskController');
const { authenticateToken } = require('../middleware/auth');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

const router = express.Router();

router.get('/project/:projectId', authenticateToken, TaskController.getTasksByProject);
router.get('/today', authenticateToken, TaskController.getTodayTasks);
router.get('/overdue', authenticateToken, TaskController.getOverdueTasks);
router.get('/search', authenticateToken, TaskController.searchTasks);
router.get('/:id', authenticateToken, TaskController.getTaskById);
router.get('/:taskId/comments', authenticateToken, TaskController.getTaskComments);
router.get('/:taskId/changes', authenticateToken, TaskController.getTaskChanges);
router.get('/:taskId/attachments', authenticateToken, TaskController.getTaskAttachments);
router.post('/', authenticateToken, TaskController.createTask);
router.post('/batch', authenticateToken, TaskController.batchUpdateTasks);
router.post('/:taskId/comments', authenticateToken, TaskController.addComment);
router.post('/:taskId/attachments', authenticateToken, upload.single('file'), TaskController.addAttachment);
router.put('/:id', authenticateToken, TaskController.updateTask);
router.delete('/:id', authenticateToken, TaskController.deleteTask);
router.delete('/attachments/:id', authenticateToken, TaskController.deleteAttachment);

module.exports = router;