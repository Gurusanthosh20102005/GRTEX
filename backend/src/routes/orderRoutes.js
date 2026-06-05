const express = require('express');
const router = express.Router();
const { createOrder, getOrders, getAllOrders, getOrderById, updateOrderStatus, cancelOrder } = require('../controllers/orderController');
const { protect, admin } = require('../middleware/authMiddleware');

router.post('/', protect, createOrder);
router.get('/', protect, getOrders);
router.get('/all', protect, admin, getAllOrders);
router.get('/:id', protect, getOrderById);
router.put('/:id/status', protect, admin, updateOrderStatus);
router.put('/:id/cancel', protect, cancelOrder);

module.exports = router;
