const express = require('express');

const {
  checkSymptoms,
  getHealthTips,
  getHealthCard,
  saveHealthRecord,
  getReminders,
  addReminder,
  deleteReminder,
} = require('../controllers/smartController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/symptoms', protect, authorize('patient'), checkSymptoms);
router.get('/tips', protect, getHealthTips);
router.get('/health-card', protect, authorize('patient'), getHealthCard);
router.post('/health-card', protect, authorize('patient'), saveHealthRecord);
router.get('/reminders', protect, authorize('patient'), getReminders);
router.post('/reminders', protect, authorize('patient'), addReminder);
router.delete('/reminders/:id', protect, authorize('patient'), deleteReminder);

module.exports = router;
