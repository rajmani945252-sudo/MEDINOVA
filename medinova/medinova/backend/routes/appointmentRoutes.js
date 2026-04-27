const express = require('express');

const {
  bookAppointment,
  getMyAppointments,
  getDoctorAppointments,
  getPatientAppointments,
  updateAppointmentStatus,
} = require('../controllers/appointmentController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/', protect, authorize('patient'), bookAppointment);
router.get('/my', protect, authorize('patient'), getMyAppointments);
router.get('/doctor', protect, authorize('doctor'), getDoctorAppointments);
router.get('/patient/:patientId', protect, authorize('doctor', 'admin'), getPatientAppointments);
router.put('/:id/status', protect, authorize('doctor', 'admin'), updateAppointmentStatus);

module.exports = router;
