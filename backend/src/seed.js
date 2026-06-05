const { pool } = require('./config/db');
const bcrypt = require('bcryptjs');

const seedProducts = [
    {
        title: 'Premium Cotton Shirt',
        description: 'High-quality cotton shirt. Special Offer: Buy 3 for ₹999!',
        price: 399.00,
        category: 'Men',
        material: 'Cotton',
        color: 'Assorted',
        colors: JSON.stringify(['Blue', 'White', 'Black', 'Red']),
        sizes: 'S, M, L, XL, XXL, XXXL',
        image_url: '/images/shirts.jpeg',
        stock: 100
    },
    {
        title: 'Classic Formal Pant',
        description: 'Comfortable formal pants. Special Offer: Buy 2 for ₹999!',
        price: 599.00,
        category: 'Men',
        material: 'Cotton Blend',
        color: 'Black/Navy',
        colors: JSON.stringify(['Black', 'Navy Blue', 'Grey']),
        sizes: 'S, M, L, XL, XXL, XXXL',
        image_url: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=600&auto=format&fit=crop',
        stock: 100
    },
    {
        title: 'Casual T-Shirt',
        description: 'Soft comfort T-shirt. Special Offer: Buy 6 for ₹999!',
        price: 199.00,
        category: 'Men',
        material: 'Cotton',
        color: 'Assorted',
        colors: JSON.stringify(['White', 'Black', 'Blue', 'Green', 'Yellow']),
        sizes: 'S, M, L, XL, XXL, XXXL',
        image_url: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=600&auto=format&fit=crop',
        stock: 150
    },
    {
        title: 'Sporty Track Pant',
        description: 'Active wear track pants. Special Offer: Buy 4 for ₹999!',
        price: 299.00,
        category: 'Activewear',
        material: 'Polyester',
        color: 'Black/Grey',
        colors: JSON.stringify(['Black', 'Grey', 'Navy']),
        sizes: 'S, M, L, XL, XXL, XXXL',
        image_url: 'https://images.unsplash.com/photo-1556906781-9a412961c28c?w=600&auto=format&fit=crop',
        stock: 120
    },
    {
        title: 'Casual Shorts',
        description: 'Perfect for lounging.',
        price: 159.00,
        category: 'Men',
        material: 'Cotton',
        color: 'Assorted',
        colors: JSON.stringify(['Blue', 'Khaki', 'Black']),
        sizes: 'S, M, L, XL, XXL, XXXL',
        image_url: 'https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=600&auto=format&fit=crop',
        stock: 200
    },
    {
        title: 'Traditional Veshti',
        description: 'Classic white Veshti for special occasions.',
        price: 350.00,
        category: 'Traditional',
        material: 'Cotton',
        color: 'White',
        colors: JSON.stringify(['White']),
        sizes: 'Free Size',
        image_url: 'https://images.unsplash.com/photo-1589810635657-b31947752e2c?w=600&auto=format&fit=crop', // Placeholder style
        stock: 100
    },
    {
        title: 'Comfort Lungies',
        description: 'Traditional casual wear.',
        price: 300.00,
        category: 'Traditional',
        material: 'Cotton',
        color: 'Checkered',
        colors: JSON.stringify(['Blue Check', 'Green Check', 'Red Check']),
        sizes: 'Free Size',
        image_url: 'https://images.unsplash.com/photo-1605296867304-46d5465a13f1?w=600&auto=format&fit=crop', // Placeholder style
        stock: 150
    }
];

const seedDB = async () => {
    try {
        console.log('Seeding Database...');

        const schema = require('fs').readFileSync('./src/schema.sql', 'utf8');
        await pool.query(schema);
        console.log('Schema applied.');

        // Clear tables in dependency order
        await pool.query('DELETE FROM order_items');
        await pool.query('DELETE FROM cart_items');
        await pool.query('DELETE FROM orders');
        await pool.query('DELETE FROM carts');
        await pool.query('DELETE FROM products');
        await pool.query('DELETE FROM users');
        await pool.query('DELETE FROM reviews');

        // Reset ID sequences
        await pool.query('ALTER SEQUENCE products_id_seq RESTART WITH 1');
        await pool.query('ALTER SEQUENCE users_id_seq RESTART WITH 1');
        await pool.query('ALTER SEQUENCE orders_id_seq RESTART WITH 1');
        await pool.query('ALTER SEQUENCE carts_id_seq RESTART WITH 1');
        await pool.query('ALTER SEQUENCE order_items_id_seq RESTART WITH 1');
        await pool.query('ALTER SEQUENCE cart_items_id_seq RESTART WITH 1');
        await pool.query('ALTER SEQUENCE reviews_id_seq RESTART WITH 1');

        // Create Admin User
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('admin123', salt);

        await pool.query(
            `INSERT INTO users (name, email, password, role)
             VALUES ($1, $2, $3, $4)`,
            ['Admin User', 'admin@example.com', hashedPassword, 'admin']
        );
        console.log('Admin user created: admin@example.com / admin123');


        for (const product of seedProducts) {
            await pool.query(
                `INSERT INTO products (title, description, price, category, material, color, colors, sizes, image_url, stock)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
                [product.title, product.description, product.price, product.category, product.material, product.color, product.colors, product.sizes, product.image_url, product.stock]
            );
        }

        console.log('Database seeded successfully!');
        process.exit(0);
    } catch (err) {
        console.error('Error seeding database:', err);
        process.exit(1);
    }
};

seedDB();
