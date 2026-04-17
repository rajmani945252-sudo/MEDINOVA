const express = require('express');
const router  = express.Router();
const { writePrescription, getMyPrescriptions } =
  require('../controllers/prescriptionController');
const { protect } = require('../middleware/authMiddleware');

router.post('/',  protect, writePrescription);
router.get('/my', protect, getMyPrescriptions);

module.exports = router;