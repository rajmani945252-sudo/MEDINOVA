const express = require('express');

const {
  getDashboardStats,
  getAllUsers,
  deleteUser,
  verifyUser,
  getAllAppointments,
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/stats', protect, authorize('admin'), getDashboardStats);
router.get('/users', protect, authorize('admin'), getAllUsers);
router.delete('/users/:id', protect, authorize('admin'), deleteUser);
router.put('/users/:id/verify', protect, authorize('admin'), verifyUser);
router.get('/appointments', protect, authorize('admin'), getAllAppointments);

module.exports = router;
