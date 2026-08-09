const express = require('express'); // Import express
const app = express(); //Initialize express
//routes
const usersRoutes = require('./modules/users/users.routes'); 
const ordersRoutes = require('./modules/orders/orders.routes'); 
const productsRoutes = require('./modules/products/products.routes');
const reportsRoutes = require('./modules/reports/reports.routes');
const errorMiddleware = require('./middlewares/error.middleware'); //middleware for error handling

app.use(express.json());

app.use('/api/users', usersRoutes); 
app.use('/api/orders', ordersRoutes);
app.use('/api/products', productsRoutes);
app.use('/api/reports', reportsRoutes);
app.use(errorMiddleware);

module.exports = app;