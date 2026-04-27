const express = require('express');

const { getPatientById } = require('../controllers/patientController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/:patientId', protect, authorize('doctor', 'admin'), getPatientById);

module.exports = router;
