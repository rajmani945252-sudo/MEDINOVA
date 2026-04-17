const express = require('express');
const router  = express.Router();
const {
  checkSymptoms, getHealthTips,
  getHealthCard, saveHealthRecord,
  getReminders, addReminder, deleteReminder,
} = require('../controllers/smartController');
const { protect } = require('../middleware/authMiddleware');

router.post('/symptoms',        protect, checkSymptoms);
router.get('/tips',             protect, getHealthTips);
router.get('/health-card',      protect, getHealthCard);
router.post('/health-card',     protect, saveHealthRecord);
router.get('/reminders',        protect, getReminders);
router.post('/reminders',       protect, addReminder);
router.delete('/reminders/:id', protect, deleteReminder);

module.exports = router;