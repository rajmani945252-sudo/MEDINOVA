const express = require('express');

const {
  addProduct,
  getMyProducts,
  deleteProduct,
  requestMeeting,
  getMyMeetings,
  getDoctorMeetingRequests,
  updateMeetingStatus,
  getAllDoctorsForMR,
} = require('../controllers/mrController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/doctors', protect, authorize('mr'), getAllDoctorsForMR);
router.get('/products', protect, authorize('mr'), getMyProducts);
router.post('/products', protect, authorize('mr'), addProduct);
router.delete('/products/:id', protect, authorize('mr'), deleteProduct);
router.post('/meetings', protect, authorize('mr'), requestMeeting);
router.get('/meetings', protect, authorize('mr'), getMyMeetings);
router.get('/meetings/doctor', protect, authorize('doctor'), getDoctorMeetingRequests);
router.put('/meetings/:id/status', protect, authorize('doctor'), updateMeetingStatus);

module.exports = router;
