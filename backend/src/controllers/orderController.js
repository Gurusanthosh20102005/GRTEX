const { pool } = require('../config/db');

const createOrder = async (req, res) => {
    try {
        const userId = req.user.id;
        const { items, shippingAddress } = req.body;

        if (!items || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ message: 'Order items are required' });
        }

        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            const orderItemsDetails = [];
            const groups = {
                'Shirt': 0,
                'Pant': 0,
                'T-Shirt': 0,
                'Track Pant': 0
            };
            let subtotal = 0;

            // Loop through each item, lock product row, verify stock, and fetch pricing
            for (const item of items) {
                const productId = item.productId;
                const quantity = parseInt(item.quantity || 1);

                // Lock product row to prevent race conditions during concurrent checkouts
                const productRes = await client.query(
                    'SELECT id, title, price, stock, category FROM products WHERE id = $1 FOR UPDATE',
                    [productId]
                );

                if (productRes.rows.length === 0) {
                    throw new Error(`Product with ID ${productId} not found`);
                }

                const product = productRes.rows[0];
                if (product.stock < quantity) {
                    throw new Error(`Insufficient stock for product "${product.title}". Only ${product.stock} left.`);
                }

                // Deduct stock
                await client.query(
                    'UPDATE products SET stock = stock - $1 WHERE id = $2',
                    [quantity, productId]
                );

                const price = Number(product.price);
                subtotal += price * quantity;

                // Group for combo offer rules
                const title = product.title.toLowerCase();
                if (title.includes('track pant')) {
                    groups['Track Pant'] += quantity;
                } else if (title.includes('t-shirt')) {
                    groups['T-Shirt'] += quantity;
                } else if (title.includes('shirt')) {
                    groups['Shirt'] += quantity;
                } else if (title.includes('pant')) {
                    groups['Pant'] += quantity;
                }

                orderItemsDetails.push({
                    productId,
                    quantity,
                    size: item.size || null,
                    color: item.color || null,
                    priceAtPurchase: price
                });
            }

            // Calculate combo savings
            let savings = 0;
            
            // 1. Shirt - ₹399/shirt, 3 for ₹999
            const shirtBundles = Math.floor(groups['Shirt'] / 3);
            savings += shirtBundles * ((399 * 3) - 999);

            // 2. Pant - ₹599/pant, 2 for ₹999
            const pantBundles = Math.floor(groups['Pant'] / 2);
            savings += pantBundles * ((599 * 2) - 999);

            // 3. T-Shirt - ₹199/t-shirt, 6 for ₹999
            const tshirtBundles = Math.floor(groups['T-Shirt'] / 6);
            savings += tshirtBundles * ((199 * 6) - 999);

            // 4. Track Pant - ₹299/track pant, 4 for ₹999
            const trackBundles = Math.floor(groups['Track Pant'] / 4);
            savings += trackBundles * ((299 * 4) - 999);

            const total = subtotal - savings;

            // Insert into orders table (includes payment_status default/explicit COD)
            const orderRes = await client.query(
                'INSERT INTO orders (user_id, total_amount, shipping_address, payment_status) VALUES ($1, $2, $3, $4) RETURNING id',
                [userId, total, shippingAddress, 'Pending - COD']
            );
            const orderId = orderRes.rows[0].id;

            // Insert into order_items table
            for (const itemDetail of orderItemsDetails) {
                await client.query(
                    'INSERT INTO order_items (order_id, product_id, quantity, size, color, price_at_purchase) VALUES ($1, $2, $3, $4, $5, $6)',
                    [
                        orderId,
                        itemDetail.productId,
                        itemDetail.quantity,
                        itemDetail.size,
                        itemDetail.color,
                        itemDetail.priceAtPurchase
                    ]
                );
            }

            // Clear the user's cart after order placement
            const cartRes = await client.query('SELECT id FROM carts WHERE user_id = $1', [userId]);
            if (cartRes.rows.length > 0) {
                await client.query('DELETE FROM cart_items WHERE cart_id = $1', [cartRes.rows[0].id]);
            }

            await client.query('COMMIT');
            res.status(201).json({ message: 'Order created successfully', orderId });
        } catch (e) {
            await client.query('ROLLBACK');
            throw e;
        } finally {
            client.release();
        }
    } catch (error) {
        console.error(error);
        res.status(400).json({ message: error.message || 'Server error' });
    }
};

const getOrders = async (req, res) => {
    try {
        const userId = req.user.id;
        const result = await pool.query('SELECT * FROM orders WHERE user_id = $1 ORDER BY created_at DESC', [userId]);
        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

const getAllOrders = async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT o.*, u.name as user_name, u.email as user_email 
            FROM orders o 
            LEFT JOIN users u ON o.user_id = u.id 
            ORDER BY o.created_at DESC
        `);
        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

const updateOrderStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, tracking_number } = req.body;

        await pool.query(
            'UPDATE orders SET status = $1, tracking_number = $2 WHERE id = $3',
            [status, tracking_number, id]
        );
        res.json({ message: 'Order updated' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

const getOrderById = async (req, res) => {
    try {
        const { id } = req.params;
        const orderRes = await pool.query(`
            SELECT o.*, u.name as user_name, u.email as user_email 
            FROM orders o 
            LEFT JOIN users u ON o.user_id = u.id 
            WHERE o.id = $1
        `, [id]);

        if (orderRes.rows.length === 0) return res.status(404).json({ message: 'Order not found' });

        const itemsRes = await pool.query(`
            SELECT oi.*, p.title, p.image_url 
            FROM order_items oi 
            LEFT JOIN products p ON oi.product_id = p.id 
            WHERE oi.order_id = $1
        `, [id]);

        const order = orderRes.rows[0];
        order.items = itemsRes.rows;

        res.json(order);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

const cancelOrder = async (req, res) => {
    try {
        const userId = req.user.id;
        const { id } = req.params;

        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            // Fetch order and lock row
            const orderRes = await client.query(
                'SELECT * FROM orders WHERE id = $1 FOR UPDATE',
                [id]
            );

            if (orderRes.rows.length === 0) {
                return res.status(404).json({ message: 'Order not found' });
            }

            const order = orderRes.rows[0];

            // Verify order ownership
            if (order.user_id !== userId) {
                return res.status(403).json({ message: 'Access denied' });
            }

            // Check if status is Pending
            if (order.status !== 'Pending') {
                return res.status(400).json({ message: `Cannot cancel an order with status: ${order.status}` });
            }

            // Check time difference (within 24 hours)
            const createdAt = new Date(order.created_at);
            const now = new Date();
            const diffMs = now - createdAt;
            const diffHours = diffMs / (1000 * 60 * 60);

            if (diffHours > 24) {
                return res.status(400).json({ message: 'Orders can only be cancelled within 24 hours of creation.' });
            }

            // Restore product stock
            const itemsRes = await client.query(
                'SELECT product_id, quantity FROM order_items WHERE order_id = $1',
                [id]
            );

            for (const item of itemsRes.rows) {
                if (item.product_id) {
                    await client.query(
                        'UPDATE products SET stock = stock + $1 WHERE id = $2',
                        [item.quantity, item.product_id]
                    );
                }
            }

            // Update order status to Cancelled
            await client.query(
                "UPDATE orders SET status = 'Cancelled' WHERE id = $1",
                [id]
            );

            await client.query('COMMIT');
            res.json({ message: 'Order cancelled successfully' });
        } catch (e) {
            await client.query('ROLLBACK');
            throw e;
        } finally {
            client.release();
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

module.exports = { createOrder, getOrders, getAllOrders, getOrderById, updateOrderStatus, cancelOrder };
