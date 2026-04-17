const express = require('express');
const router  = express.Router();
const {
  getDashboardStats,
  getAllUsers,
  deleteUser,
  verifyUser,
  getAllAppointments,
} = require('../controllers/adminController');
const { protect } = require('../middleware/authMiddleware');

router.get('/stats',              protect, getDashboardStats);
router.get('/users',              protect, getAllUsers);
router.delete('/users/:id',       protect, deleteUser);
router.put('/users/:id/verify',   protect, verifyUser);
router.get('/appointments',       protect, getAllAppointments);

module.exports = router;