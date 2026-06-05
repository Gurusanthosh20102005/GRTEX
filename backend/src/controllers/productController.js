const { pool } = require('../config/db');

const getProducts = async (req, res) => {
    try {
        const { category, search, minPrice, maxPrice } = req.query;
        let query = 'SELECT * FROM products WHERE 1=1';
        let params = [];
        let paramCount = 1;

        if (category) {
            query += ` AND category = $${paramCount}`;
            params.push(category);
            paramCount++;
        }

        if (search) {
            query += ` AND (title ILIKE $${paramCount} OR description ILIKE $${paramCount})`;
            params.push(`%${search}%`);
            paramCount++;
        }

        if (minPrice) {
            query += ` AND price >= $${paramCount}`;
            params.push(minPrice);
            paramCount++;
        }

        if (maxPrice) {
            query += ` AND price <= $${paramCount}`;
            params.push(maxPrice);
            paramCount++;
        }

        const result = await pool.query(query, params);
        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

const getProductById = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query('SELECT * FROM products WHERE id = $1', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Product not found' });
        }
        res.json(result.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

const createProduct = async (req, res) => {
    try {
        const { title, description, price, category, material, color, colors, image_url, stock } = req.body;

        // Sanitize numeric fields
        const safePrice = price === '' || price === undefined ? 0 : price;
        const safeStock = stock === '' || stock === undefined ? 0 : stock;

        const result = await pool.query(
            `INSERT INTO products (title, description, price, category, material, color, colors, image_url, stock)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
            [title, description, safePrice, category, material, color, colors, image_url, safeStock]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

const updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, price, category, stock, colors } = req.body;

        // Sanitize numeric fields - Use NULL for updates if you want to keep existing, but here we replace if provided.
        // If undefined, COALESCE handles it. If empty string, we want 0 or it might crash COALESCE($5, stock) if $5 is "" text cast to int?
        // Postgres: COALESCE(?, stock) -> if ? is NULL, use stock.
        // If ? is "", it tries to cast "" to type of stock (int) -> Error.
        // So we must convert "" to NULL or 0.

        const safePrice = price === '' ? null : price;
        const safeStock = stock === '' ? null : stock;
        const safeColors = colors === '' ? null : colors;

        // Note: COALESCE(NULL, old_val) keeps old_val.
        // So passing null for empty string means "don't update". 
        // If user INTENDS to set to 0, they should send "0" or 0.

        const result = await pool.query(
            `UPDATE products 
       SET title = COALESCE($1, title), 
           description = COALESCE($2, description), 
           price = COALESCE($3, price), 
           category = COALESCE($4, category), 
           stock = COALESCE($5, stock),
           colors = COALESCE($6, colors)
       WHERE id = $7 RETURNING *`,
            [title, description, safePrice, category, safeStock, safeColors, id]
        );
        if (result.rows.length === 0) return res.status(404).json({ message: 'Product not found' });
        res.json(result.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

const deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query('DELETE FROM products WHERE id = $1 RETURNING *', [id]);
        if (result.rows.length === 0) return res.status(404).json({ message: 'Product not found' });
        res.json({ message: 'Product deleted' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

const addReview = async (req, res) => {
    try {
        const { id } = req.params; // Product ID
        const { rating, comment } = req.body;
        const userId = req.user.id;

        const result = await pool.query(
            'INSERT INTO reviews (product_id, user_id, rating, comment) VALUES ($1, $2, $3, $4) RETURNING *',
            [id, userId, rating, comment]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

const getProductReviews = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query(
            `SELECT r.*, u.name as user_name 
             FROM reviews r 
             JOIN users u ON r.user_id = u.id 
             WHERE r.product_id = $1 
             ORDER BY r.created_at DESC`,
            [id]
        );
        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = { getProducts, getProductById, createProduct, updateProduct, deleteProduct, addReview, getProductReviews };
