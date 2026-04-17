const express = require('express');
const router  = express.Router();
const {
  addProduct, getMyProducts, deleteProduct,
  requestMeeting, getMyMeetings,
  getDoctorMeetingRequests, updateMeetingStatus,
  getAllDoctorsForMR
} = require('../controllers/mrController');
const { protect } = require('../middleware/authMiddleware');

router.get('/doctors',              protect, getAllDoctorsForMR);
router.get('/products',             protect, getMyProducts);
router.post('/products',            protect, addProduct);
router.delete('/products/:id',      protect, deleteProduct);
router.post('/meetings',            protect, requestMeeting);
router.get('/meetings',             protect, getMyMeetings);
router.get('/meetings/doctor',      protect, getDoctorMeetingRequests);
router.put('/meetings/:id/status',  protect, updateMeetingStatus);

module.exports = router;