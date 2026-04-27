const express = require('express');

const { getPatientReports } = require('../controllers/reportController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/patient/:patientId', protect, authorize('doctor', 'admin'), getPatientReports);

module.exports = router;
