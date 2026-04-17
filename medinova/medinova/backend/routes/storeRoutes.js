const express = require('express');
const router  = express.Router();
const {
  getMyMedicines, addMedicine, updateMedicine,
  deleteMedicine, getAllMedicines,
  getStoreOrders, updateOrderStatus
} = require('../controllers/storeController');
const { protect } = require('../middleware/authMiddleware');

router.get('/medicines/all',       protect, getAllMedicines);
router.get('/medicines',           protect, getMyMedicines);
router.post('/medicines',          protect, addMedicine);
router.put('/medicines/:id',       protect, updateMedicine);
router.delete('/medicines/:id',    protect, deleteMedicine);
router.get('/orders',              protect, getStoreOrders);
router.put('/orders/:id/status',   protect, updateOrderStatus);

module.exports = router;