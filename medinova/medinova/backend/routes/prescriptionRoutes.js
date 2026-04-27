const express = require('express');

const {
  writePrescription,
  getMyPrescriptions,
  getPatientPrescriptions,
} = require('../controllers/prescriptionController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/', protect, authorize('doctor'), writePrescription);
router.get('/my', protect, authorize('patient'), getMyPrescriptions);
router.get('/patient/:patientId', protect, authorize('doctor', 'admin'), getPatientPrescriptions);

module.exports = router;
