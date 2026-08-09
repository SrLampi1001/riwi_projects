const db = require('../../config/db')
// Level 1 Assignment
exports.getAvgUsersOrderValue = async () => {
    const [rows] = await db.query(`
        SELECT u.name, AVG(total) AS avg_order_value, COUNT(o.id) AS total_orders
        FROM users u
        INNER JOIN orders o ON u.id = o.user_id
        GROUP BY u.id
        ORDER BY avg_order_value DESC
    `);
    return rows; // Return the average order value for each user (or an empty array if not found)
}
//Level 2 Assignment
exports.getCategoriesTotalRevenue = async () => {
    const [rows] = await db.query(`
        SELECT c.name, SUM(op.price_at_purchase * op.quantity) AS ingreso_total 
        FROM categories c 
        INNER JOIN products p ON p.category_id = c.id 
        INNER JOIN order_product op ON op.product_id = p.id 
        GROUP BY c.id, c.name 
        ORDER BY ingreso_total DESC;
    `);
    return rows; // Return the total revenue for each product category (or an empty array if not found)
}
exports.getCategoryTotalRevenue = async (category_id) => {
    const [rows] =  await db.query(`
        SELECT c.name, SUM(op.price_at_purchase * op.quantity) AS ingreso_total 
        FROM categories c 
        INNER JOIN products p ON p.category_id = c.id 
        INNER JOIN order_product op ON op.product_id = p.id 
        WHERE c.id = ?
        GROUP BY c.id, c.name
    `, [category_id]);
    return rows[0]; //Return the first category (or undefined if not found)
}
exports.getFiveBestSellingProducts = async () => {
    const [rows] = await db.query(`
        SELECT p.name, SUM(op.quantity) AS total_sold
        FROM products p
        INNER JOIN order_product op ON p.id = op.product_id
        GROUP BY p.id, p.name
        ORDER BY total_sold DESC
        LIMIT 5;
    `);
    return rows; // Return the five best-selling products (or an empty array if not found)
}
exports.getDailyRevenue = async () => {
    const [rows] = await db.query(`
        SELECT DATE(o.created_at) AS date, SUM(o.total) AS daily_revenue
        FROM orders o
        GROUP BY DATE(o.created_at)
        ORDER BY date ASC;
    `);
    return rows; // Return the daily revenue (or an empty array if not found)
}
exports.getCategoriesWithNoSales = async () => {
    const [rows] = await db.query(`
        SELECT c.name AS Category_name
        FROM categories c
        LEFT JOIN products p ON p.category_id = c.id
        LEFT JOIN order_product op ON op.product_id = p.id
        WHERE op.id IS NULL
        GROUP BY c.id, c.name
        ORDER BY c.name ASC;
    `);
    return rows; // Return all categories with no sales (or an empty array if not found)
}
//Level 3 Assignment
exports.getGlobalReports = async () => {
    const [rows] = await db.query(`
        SELECT u.id, u.name, u.city, o.order_number, p.name AS name_product, c.name AS Category, op.quantity, (op.price_at_purchase * op.quantity) AS subtotal_item 
        FROM users u 
        LEFT JOIN orders o  ON o.user_id = u.id 
        LEFT JOIN order_product op ON op.order_id  = o.id 
        LEFT JOIN products p ON p.id = op.product_id 
        LEFT JOIN categories c ON c.id = p.category_id 
        ORDER BY u.id ASC;
        `);
    return rows; // Return a global report with all the data (or an empty array if not found)
}
exports.getCitiesRevenueFromClothesCategory = async () => {
    const [rows] = await db.query(`
       SELECT u.city AS City_name, c.name AS Category, SUM(op.price_at_purchase * op.quantity) AS products_total_revenue 
        FROM categories c 
        INNER JOIN products p ON c.id = p.category_id 
        INNER JOIN order_product op ON op.product_id = p.id 
        INNER JOIN orders o ON o.id = op.order_id
        INNER JOIN users u ON u.id = o.user_id
        WHERE c.id = 6  -- Assuming this ID correspond to clothes category
        GROUP BY u.city`);
    return rows; // Return the total revenue from the "Clothes" category for each city (or an empty array if not found)
}
exports.getCityRevenueFromClothesCategory = async (city) => {
    const [rows] = await db.query(`
        SELECT u.city AS City_name, c.name AS Category, SUM(op.price_at_purchase * op.quantity) AS products_total_revenue
        FROM categories c
        INNER JOIN products p ON c.id = p.category_id
        INNER JOIN order_product op ON op.product_id = p.id
        INNER JOIN orders o ON o.id = op.order_id
        INNER JOIN users u ON u.id = o.user_id
        WHERE c.id = 6 AND u.city = ?`, [city]);
    return rows[0]; // Return the total revenue from the "Clothes" category for the city (or undefined if not found)
}
exports.getTotalProfit = async () => {
    const [rows] = await db.query(`
        SELECT SUM((op.price_at_purchase - p.purchase_price) * op.quantity) AS total_profit
        FROM order_product op
        INNER JOIN products p ON op.product_id = p.id
    `);
    return rows[0]; // Return the total profit (or undefined if not found)
}
exports.getThreeMostProfitableCities = async () => {
    const [rows] = await db.query(`
        SELECT u.city AS City_name, SUM((op.price_at_purchase - p.purchase_price) * op.quantity) AS total_profit
        FROM order_product op
        INNER JOIN products p ON op.product_id = p.id
        INNER JOIN orders o ON o.id = op.order_id
        INNER JOIN users u ON u.id = o.user_id
        GROUP BY u.city
        ORDER BY total_profit DESC
        LIMIT 3;
    `);
    return rows; // Return the three most profitable cities (or an empty array if not found)
}
//Level 4 Assignment
exports.getMostRevenueMonth = async () => {
    const [rows] = await db.query(`
        SELECT DATE_FORMAT(o.order_date, '%Y-%m') AS period, SUM(o.total) AS total_billing 
        FROM orders o 
        GROUP BY period 
        ORDER BY total_billing DESC LIMIT 1;
        `);
    return rows[0]; // Return the month with the most revenue (or undefined if not found)
}
exports.getRevenuePercentageForEachCategory = async () => {
    const [rows] = await db.query(`
        SELECT cr.Category, cr.category_revenue as Category_revenue, (cr.category_revenue / company_revenue)*100 AS percentage
        FROM
        (SELECT SUM(op.price_at_purchase * op.quantity) as category_revenue, c.name AS Category 
        	FROM order_product op 
        	RIGHT JOIN products p on p.id = op.product_id
        	RIGHT JOIN categories c ON p.category_id = c.id
        	GROUP BY c.id) AS cr
        INNER JOIN 
        (SELECT SUM(op.price_at_purchase * op.quantity) AS company_revenue
        		FROM order_product op) AS company
        ORDER BY percentage DESC;
        `);
        /* //The above query is inneficient because it calculates the total company revenue for each category, it could be optimized by calculating the total company revenue once and then using it to calculate the percentage for each category
        //Here the optimized version of the query:
         `
            WITH ventas_categoria AS 
            (SELECT c.id, c.name AS category, SUM(op.price_at_purchase * op.quantity) AS income_category 
                FROM categories c 
                INNER JOIN products p ON p.category_id = c.id 
                INNER JOIN order_product op ON op.product_id = p.id 
                GROUP BY c.id, c.name), 
            total_ventas AS 
            (SELECT SUM(price_at_purchase * quantity) AS grand_total 
                FROM order_product) 
            SELECT vc.category, vc.income_category, tv.grand_total, (vc.income_category / tv.grand_total) * 100 AS percentage 
            FROM ventas_categoria vc 
            CROSS JOIN total_ventas tv 
            ORDER BY percentage DESC;
        ` 
        //The optimized version of the query calculates the total company revenue once and then uses it to calculate the percentage for each category, this way we avoid calculating the total company revenue for each category, which improves the performance of the query.
        */
    return rows; // Return the revenue percentage for each category (or an empty array if not found)
}
exports.getCitiesAverageRevenue = async () => {
    const [rows] = await db.query(`
        WITH ventas_ciudad AS 
        (SELECT u.city, SUM(o.total) AS total_city 
        	FROM users u JOIN orders o ON o.user_id = u.id 
            GROUP BY u.city), 
        promedio_ciudades AS 
        (SELECT AVG(total_city) AS average 
        	FROM ventas_ciudad) 
        SELECT vc.city, vc.total_city, ROUND(pc.average, 2) AS average_citys, ROUND(vc.total_city - pc.average, 2) AS difference, 
        CASE 
        	WHEN vc.total_city > pc.average THEN 'Above Average' 
            WHEN vc.total_city < pc.average THEN 'Below Average' 
        ELSE 'Average' END AS comparison 
        FROM ventas_ciudad vc 
        CROSS JOIN promedio_ciudades pc 
        ORDER BY vc.total_city DESC;
        `);
    return rows; // Return the average revenue for each city and its comparison with the overall average (or an empty array if not found)
}