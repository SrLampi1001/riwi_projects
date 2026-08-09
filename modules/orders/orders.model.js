const db = require('../../config/db')
// Basic CRUD get all orders, get order by id -> Not creating, updating or deleting orders for this assignment
exports.getAllOrders = async ()=>{
    const [rows] = await db.query('SELECT * FROM orders');
    return rows;
}
exports.getOrderById = async (id)=>{
    const [rows] = await db.query('SELECT * FROM orders WHERE id = ?', [id]);
    return rows[0]; // Return the first order found (or undefined if not found)
}
exports.getOrdersByUserId = async (userId)=>{
    const [rows] = await db.query('SELECT * FROM orders WHERE user_id = ?', [userId]);
    return rows; // Return all orders for the user (or an empty array if not found)
}
exports.getOrderByOrderNumber = async (orderNumber)=>{
    const [rows] = await db.query('SELECT * FROM orders WHERE order_number = ?', [orderNumber]);
    return rows[0]; // Return the first order found (or undefined if not found)
}
// Level 1 Assignment
exports.getAllOrdersWithUserEmail = async (email)=>{
    const [rows] = await db.query(`
        SELECT o.order_number, o.order_date, u.email 
        FROM orders o
        INNER JOIN users u ON o.user_id = u.id
        WHERE u.email = ?
    `, [email]);
    return rows; // Return all orders with user email (or an empty array if not found)
}
exports.getCountOrdersByStatus = async ()=>{
    const [rows] = await db.query(`
        SELECT status, COUNT(*) AS count
        FROM orders
        GROUP BY status
    `);
    return rows; // Return the count of orders by status (or an empty array if not found)
}
//Level 2 Assignment
exports.getOrdersReceipt = async ()=>{
    const [rows] = await db.query(`
        SELECT  o.order_number, o.order_date, p.name, p.sale_price AS Sale_price, p.purchase_price AS Purcharse_price, op.quantity AS Quantity
        FROM orders o 
        INNER JOIN order_product op ON o.id = op.order_id 
        INNER JOIN products p ON op.product_id = p.id 
        ORDER BY o.order_date ASC;
    `);
    return rows; //Returns a receipt of all orders (Or an empty array if not found)
}
exports.getOrderReceipt = async (id)=>{
    const[rows] = await db.query(`
        SELECT  o.order_number, o.order_date, p.name, p.sale_price AS Sale_price, p.purchase_price AS Purcharse_price, op.quantity AS Quantity
        FROM orders o 
        INNER JOIN order_product op ON o.id = op.order_id 
        INNER JOIN products p ON op.product_id = p.id 
        WHERE o.id = ?
        ORDER BY o.order_date ASC;
    `, [id]);
    return rows[0]; //Return the first order found (or undefined if not found)
}
exports.getProductsFromCancelledOrders = async ()=>{
    const [rows] = await db.query(`
        SELECT DISTINCT p.name AS Product_name, o.order_number AS Order_number, o.status AS Order_status
        FROM products p
        INNER JOIN order_product op ON p.id = op.product_id
        INNER JOIN orders o ON op.order_id = o.id
        WHERE o.status = 'cancelled'
        ORDER BY Product_name ASC;
    `);
    return rows; // Return all products from cancelled orders (or an empty array if not found)
}
//Level 3 Assignment
exports.getOrderWithMostProductVariety = async ()=>{
    const [rows] = await db.query(`
        SELECT u.name AS user_name, o.order_number, COUNT(DISTINCT p.id) AS product_variety
        FROM orders o
        INNER JOIN order_product op ON o.id = op.order_id
        INNER JOIN products p ON op.product_id = p.id
        INNER JOIN users u ON o.user_id = u.id
        GROUP BY o.id, u.name, o.order_number
        ORDER BY product_variety DESC
        LIMIT 1;
    `);
    return rows[0]; // Return the order with most product variety (or undefined if not found)
}
//Level 4 Assignment
exports.getPendingOrdersWithProductsHavingLessThanFiveStock = async ()=>{
    const [rows] = await db.query(`
        SELECT o.order_number, o.status AS order_status, u.name AS client, p.name AS product, op.quantity AS product_in_order, p.stock AS product_in_stock
        FROM orders o 
        INNER JOIN order_product op ON op.order_id  = o.id 
        INNER JOIN products p ON p.id = op.product_id 
        INNER JOIN users u ON u.id = o.user_id 
        WHERE o.status  = 'pending' AND p.stock < 5 
        ORDER BY p.stock ASC, o.order_date ASC;
        `);
    return rows; // Return all pending orders with products having less than 5 stock (or an empty array if not found)
}
exports.getPercentageOfOrdersCancelledPerMonth = async ()=>{
    const [rows] = await db.query(`
        SELECT DATE_FORMAT(order_date, '%Y-%m') AS period, COUNT(*) AS orders_total, 
        SUM(
        	CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) AS orders_cancelled, 
        	ROUND(SUM(
            CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) / COUNT(*) * 100, 2) AS cancellations_percentage
        FROM orders o 
        GROUP BY period
        ORDER BY period DESC;
        `);
    return rows; // Return the percentage of orders cancelled per month (or an empty array if not found)
}