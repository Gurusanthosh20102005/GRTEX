const express = require('express');
const cors = require('cors');
const path = require('path');
const bcrypt = require('bcryptjs');
const { pool } = require('./config/db');
require('dotenv').config();

// Auto-seed/ensure admin user with admin role exists on startup
async function autoSetupAdmin() {
    try {
        const userResult = await pool.query('SELECT * FROM users WHERE email = $1', ['admin@example.com']);
        if (userResult.rows.length === 0) {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash('admin123', salt);
            await pool.query(
                `INSERT INTO users (name, email, password, role)
                 VALUES ($1, $2, $3, $4)`,
                ['Admin User', 'admin@example.com', hashedPassword, 'admin']
            );
            console.log('Seeded default admin user: admin@example.com / admin123');
        } else {
            await pool.query(
                `UPDATE users SET role = 'admin' WHERE email = 'admin@example.com'`
            );
            console.log('Ensured admin@example.com has admin role');
        }
    } catch (err) {
        console.error('Error in autoSetupAdmin:', err);
    }
}
autoSetupAdmin();

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
