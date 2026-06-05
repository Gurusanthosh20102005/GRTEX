const { pool } = require('../config/db');

// Helper to get or create cart
const getOrCreateCart = async (userId) => {
    let res = await pool.query('SELECT * FROM carts WHERE user_id = $1', [userId]);
    if (res.rows.length === 0) {
        res = await pool.query('INSERT INTO carts (user_id) VALUES ($1) RETURNING *', [userId]);
    }
    return res.rows[0];
};

const getCart = async (req, res) => {
    try {
        const userId = req.user.id; // Assumes auth middleware
        const cart = await getOrCreateCart(userId);
        const items = await pool.query(
            `SELECT ci.id, ci.quantity, ci.size, ci.color, p.title, p.price, p.image_url, p.id as product_id
       FROM cart_items ci
       JOIN products p ON ci.product_id = p.id
       WHERE ci.cart_id = $1`,
            [cart.id]
        );
        res.json({ cartId: cart.id, items: items.rows });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

const addToCart = async (req, res) => {
    try {
        const userId = req.user.id;
        const { productId, quantity, size, color } = req.body;
        const cart = await getOrCreateCart(userId);

        // Check if item exists with SAME product_id AND size AND color
        const existing = await pool.query(
            'SELECT * FROM cart_items WHERE cart_id = $1 AND product_id = $2 AND size = $3 AND color = $4',
            [cart.id, productId, size, color]
        );

        if (existing.rows.length > 0) {
            // Update quantity
            await pool.query(
                'UPDATE cart_items SET quantity = quantity + $1 WHERE id = $2',
                [quantity, existing.rows[0].id]
            );
        } else {
            // Insert
            await pool.query(
                'INSERT INTO cart_items (cart_id, product_id, quantity, size, color) VALUES ($1, $2, $3, $4, $5)',
                [cart.id, productId, quantity, size, color]
            );
        }
        res.json({ message: 'Item added to cart' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

const removeFromCart = async (req, res) => {
    try {
        const { itemId } = req.params;
        await pool.query('DELETE FROM cart_items WHERE id = $1', [itemId]);
        res.json({ message: 'Item removed' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = { getCart, addToCart, removeFromCart };
