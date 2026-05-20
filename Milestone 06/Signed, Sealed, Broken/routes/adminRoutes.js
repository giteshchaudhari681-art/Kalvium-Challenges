const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');
const { getAllUsers, deleteUser } = require('../controllers/adminController');

router.get('/admin/users', authMiddleware, adminMiddleware, getAllUsers);
router.delete('/admin/users/:id', authMiddleware, adminMiddleware, deleteUser);

module.exports = router;
