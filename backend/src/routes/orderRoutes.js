const express = require('express');
const router = express.Router();
const { createOrder, getOrders, getAllOrders, getOrderById, updateOrderStatus, cancelOrder } = require('../controllers/orderController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, createOrder);
router.get('/', protect, getOrders);
router.get('/all', protect, getAllOrders); // TODO: Add admin check
router.get('/:id', protect, getOrderById);
router.put('/:id/status', protect, updateOrderStatus);
router.put('/:id/cancel', protect, cancelOrder);

module.exports = router;
