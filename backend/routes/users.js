const express = require('express');
const UserController = require('../controllers/UserController');
const { authenticateToken, requireRole } = require('../middleware/auth');

const router = express.Router();

router.get('/', authenticateToken, requireRole(['super_admin']), UserController.getAllUsers);
router.get('/search', authenticateToken, UserController.searchUsers);
router.get('/:id', authenticateToken, UserController.getUserById);
router.put('/:id/role', authenticateToken, requireRole(['super_admin']), UserController.updateUserRole);

module.exports = router;