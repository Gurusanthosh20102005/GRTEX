const express = require('express');
const router = express.Router();
const { getProducts, getProductById, createProduct, updateProduct, deleteProduct, addReview, getProductReviews } = require('../controllers/productController');
const { protect, admin } = require('../middleware/authMiddleware');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer storage engine configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname.replace(/\s+/g, '_')}`);
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        const filetypes = /jpeg|jpg|png|webp/;
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = filetypes.test(file.mimetype);
        if (mimetype && extname) {
            return cb(null, true);
        }
        cb(new Error('Only images (jpg, jpeg, png, webp) are allowed'));
    }
});

router.get('/', getProducts);
router.get('/:id', getProductById);
router.post('/', protect, admin, createProduct);
router.put('/:id', protect, admin, updateProduct);
router.delete('/:id', protect, admin, deleteProduct);

// Image Upload Endpoint (Returns absolute public URL)
router.post('/upload', protect, admin, upload.single('image'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }
        
        // Return absolute public URL that works on both localhost and production
        const host = req.get('host');
        const protocol = req.protocol;
        const imageUrl = `${protocol}://${host}/uploads/${req.file.filename}`;
        
        res.json({ imageUrl });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

router.post('/:id/reviews', protect, addReview);
router.get('/:id/reviews', getProductReviews);

module.exports = router;
