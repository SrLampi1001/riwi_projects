const db = require('../../config/db')
// Basic CRUD get all products, get product by id -> Not creating, updating or deleting product for this assignment
exports.getAllProducts = async ()=>{
    const [rows] = await db.query('SELECT * FROM products');
    return rows;
}
exports.getProductById = async (id)=>{
    const [rows] = await db.query('SELECT * FROM products WHERE id = ?', [id]);
    return rows[0]; // Return the first product found (or undefined if not found)
}
exports.getProductsByName = async (name)=>{
    const [rows] = await db.query('SELECT * FROM products WHERE name LIKE ?', [`%${name}%`]);
    return rows; // Return all products found (or an empty array if not found)
}
exports.getProductsByCategoryId = async (categoryId)=>{
    const [rows] = await db.query('SELECT * FROM products WHERE category_id = ?', [categoryId]);
    return rows; // Return all products found (or an empty array if not found)
}
// Level 1 Assignment
exports.getProductsNameAndCategoryName = async ()=>{
    const [rows] = await db.query(`
        SELECT p.name AS Product_name, c.name AS Category_name
        FROM products p
        INNER JOIN categories c ON p.category_id = c.id
        ORDER BY Product_name ASC
    `);
    return rows; // Return all products with their category name (or an empty array if not found)
}
exports.getProductsByCategoryName = async (categoryName)=>{
    const [rows] = await db.query(`
        SELECT p.name AS Product_name, c.name AS Category_name
        FROM products p
        INNER JOIN categories c ON p.category_id = c.id
        WHERE c.name LIKE ?
        ORDER BY Category_name ASC
    `, [`%${categoryName}%`]);
    return rows; // Return all products found for the category name (or an empty array if not found)
}
exports.getElectronicProducts = async ()=>{
    const [rows] = await db.query(`
        SELECT p.name AS Product_name, c.name AS Category_name
        FROM products p
        INNER JOIN categories c ON p.category_id = c.id
        WHERE p.category_id  IN (1, 2, 3, 4, 5, 7) -- Assuming these IDs correspond to electronic products
        ORDER BY Category_name ASC
    `);
    return rows; // Return all electronic products (or an empty array if not found)
}
exports.getProductsByOrderNumber = async (orderNumber)=>{
    const [rows] = await db.query(`
        SELECT o.order_number AS Order_number, op.product_id AS Product_id, op.quantity AS Quantity
        FROM orders o 
        INNER JOIN order_product op ON o.id = op.order_id 
        WHERE o.order_number = ?
        ORDER BY o.order_number ASC
    `, [orderNumber]);
    return rows; // Return all products found for the order number (or an empty array if not found)
}
//Level 2 Assignment
exports.getProductsFromUserByName = async (userName)=>{
    const [rows] = await db.query(`
        SELECT u.name AS user_name, DISTINCT p.name AS product_name, 
        FROM users u
        INNER JOIN orders o ON u.id = o.user_id
        INNER JOIN order_product op ON o.id = op.order_id
        INNER JOIN products p ON op.product_id = p.id
        WHERE u.name LIKE ?
        ORDER BY user_name ASC
    `, [`%${userName}%`]);
    return rows; // Return all products found for the user name (or an empty array if not found)
}
exports.getProductsLastSaleDate = async ()=>{
    const [rows] = await db.query(`
        SELECT p.name AS product_name, MAX(op.created_at) AS last_sale_date
        FROM products p
        INNER JOIN order_product op ON p.id = op.product_id
        INNER JOIN orders o ON op.order_id = o.id
        GROUP BY p.id, p.name
        ORDER BY last_sale_date DESC
    `);
    return rows; // Return the last sale date for all products (or an empty array if not found)
}
exports.getProductLastSaleDate = async (productId)=>{
        const [rows] = await db.query(`
        SELECT p.name AS product_name, MAX(op.created_at) AS last_sale_date
        FROM products p
        INNER JOIN order_product op ON p.id = op.product_id
        INNER JOIN orders o ON op.order_id = o.id
        WHERE p.id = ?
        GROUP BY p.id, p.name
        ORDER BY last_sale_date DESC
    `, [productId]);
    return rows[0]; // Return the last sale date for the product (or undefined if not found)
}
//Level 3 Assignment
exports.getProductsWIthNoSales = async ()=>{
    const [rows] = await db.query(`
        SELECT p.name AS product_name
        FROM products p
        LEFT JOIN order_product op ON p.id = op.product_id
        WHERE op.product_id IS NULL
        ORDER BY product_name ASC
    `);
    return rows; // Return all products with no sales (or an empty array if not found)
}
exports.getProductsSoldCheaperThanCurrentPrice = async ()=>{
    const [rows] = await db.query(`
        SELECT p.name, p.sale_price AS current_price, op.price_at_purchase AS sold_price, o.order_date AS sale_date 
        FROM products p 
        INNER JOIN order_product op ON op.product_id = p.id 
        INNER JOIN orders o ON o.id = op.order_id 
        WHERE op.price_at_purchase < p.sale_price 
        ORDER BY p.name, o.order_date DESC;
        `);
    return rows; // Return all products that have been sold cheaper than their current price (or an empty array if not found)
}
exports.getProductBuyers = async (productId)=>{
    const [rows] = await db.query(`
        SELECT u.name AS buyer_name, u.email AS buyer_email, op.price_at_purchase AS purchase_price, op.quantity AS purchase_quantity, o.order_date AS purchase_date
        FROM products p 
        INNER JOIN order_product op ON p.id = op.product_id
        INNER JOIN orders o ON op.order_id = o.id
        INNER JOIN users u ON o.user_id = u.id
        WHERE p.id = ?
        ORDER BY o.order_date DESC;
    `, [productId]);
    return rows; // Return all buyers of the product (or an empty array if not found)
}
    //Level 4 Assignment
exports.getStairProducts = async ()=>{
    const [rows] = await db.query(`
        SELECT p.name, pr.product_revenue as Product_revenue, (pr.product_revenue / company_revenue)*100 AS percentage
        FROM
        (SELECT SUM(op.price_at_purchase * op.quantity) as product_revenue, op.product_id as product_id FROM order_product op GROUP BY op.product_id) AS pr
        INNER JOIN 
        (SELECT SUM(op.price_at_purchase * op.quantity) AS company_revenue
                FROM order_product op) AS company
        INNER JOIN products p ON product_id = p.id
        WHERE (pr.product_revenue / company_revenue)*100 > 2
    `);
    return rows; // Return all products that have generated more than 2% of the total revenue (or an empty array if not found)
}
exports.getMostPairedProducts = async ()=>{
    const [rows] = await db.query(`
        SELECT p1.name AS product_1, p2.name AS product_2, COUNT(*) AS times_together 
        FROM order_product op1 
        INNER JOIN order_product op2 ON op1.order_id = op2.order_id AND op1.product_id < op2.product_id 
        INNER JOIN products p1 ON p1.id = op1.product_id 
        INNER JOIN products p2 ON p2.id = op2.product_id 
        GROUP BY p1.id, p1.name, p2.id, p2.name 
        ORDER BY times_together 
        DESC LIMIT 10;
    `);
    return rows; // Return the 10 most paired products (or an empty array if not found)
}