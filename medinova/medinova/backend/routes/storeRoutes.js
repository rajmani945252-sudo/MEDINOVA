const express = require('express');

const {
  getMyMedicines,
  addMedicine,
  updateMedicine,
  deleteMedicine,
  getAllMedicines,
  getStoreOrders,
  updateOrderStatus,
} = require('../controllers/storeController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/medicines/all', protect, getAllMedicines);
router.get('/medicines', protect, authorize('store'), getMyMedicines);
router.post('/medicines', protect, authorize('store'), addMedicine);
router.put('/medicines/:id', protect, authorize('store'), updateMedicine);
router.delete('/medicines/:id', protect, authorize('store'), deleteMedicine);
router.get('/orders', protect, authorize('store'), getStoreOrders);
router.put('/orders/:id/status', protect, authorize('store'), updateOrderStatus);

module.exports = router;
