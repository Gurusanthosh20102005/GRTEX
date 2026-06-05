const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

// CORS Configuration - Allow localhost and Vercel domains dynamically

app.use(cors({
    origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps or curl)
        if (!origin) return callback(null, true);
        
        const normalizedOrigin = origin.replace(/\/$/, '');
        
        // Dynamic matching logic
        const isLocalhost = normalizedOrigin.startsWith('http://localhost:') || normalizedOrigin.startsWith('http://127.0.0.1:');
        const isFrontendUrl = process.env.FRONTEND_URL && normalizedOrigin === process.env.FRONTEND_URL.replace(/\/$/, '');
        const isVercelApp = normalizedOrigin.endsWith('.vercel.app') && normalizedOrigin.includes('grtex');
        
        if (isLocalhost || isFrontendUrl || isVercelApp) {
            callback(null, true);
        } else {
            callback(null, false); // Disallow without throwing Express error
        }
    },
    credentials: true
}));

app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Keep-Alive Health Route for Render Free Tier Sleep Prevention
app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'healthy', timestamp: new Date() });
});

const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');
const cartRoutes = require('./routes/cartRoutes');



// Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/cart', cartRoutes);

app.get('/', (req, res) => {
    res.send('GR Tex API is running');
});

// Start Server
if (require.main === module) {
    app.listen(port, () => {
        console.log(`Server running on port ${port}`);
    });
}

module.exports = app;
