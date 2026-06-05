const express = require('express');
const router = express.Router();
const { getProducts, getProductById, createProduct, updateProduct, deleteProduct, addReview, getProductReviews } = require('../controllers/productController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', getProducts);
router.get('/:id', getProductById);
router.post('/', createProduct); // TODO: Add admin protect
router.put('/:id', updateProduct); // TODO: Add admin protect
router.delete('/:id', deleteProduct); // TODO: Add admin protect

router.post('/:id/reviews', protect, addReview);
router.get('/:id/reviews', getProductReviews);

module.exports = router;
