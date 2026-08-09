const express = require('express');
const router = express.Router();
const usersController = require('./users.controller');
const usersLoggerMiddleware = require('../../middlewares/users.middleware'); // Middleware to log access to user routes
// Apply the logger middleware to all routes in this router
router.use(usersLoggerMiddleware);

router.get('/', usersController.getAllUsers); 

router.get('/:id', usersController.getUserById);
router.get('/email/:email', usersController.getUserByEmail);
//Level 1 Assignment
router.get('/nameEmailOrders/:id', usersController.getUserNameEmailAndOrdersNumber);
router.get('/noOrders', usersController.getUsersWithNoOrders);
router.get('/totalMoneySpent/:id', usersController.getTotalMoneySpentByUser);
router.get('/cityWithOrders/:city', usersController.getUsersFromCityWithOrders);
//Level 2 Assignment
router.get('/gamerProducts', usersController.getUsersWithGamerProducts); //This route will return all users that have at least one product with "Gamer" in its name in their orders, currently it returns nothing
router.get('/averageOrderValue', usersController.getUsersAverageOrderValue); 
router.get('/averageOrderValue/:id', usersController.getUserAverageOrderValue);
//Level 3 Assignment
router.get('/yearBestCustomer', usersController.getYearBestCustomer);
router.get('/gamingNoHome', usersController.getUsersWithGamingProductsButNoHomeProducts);
//Level 4 Assignment
router.get('/aboveAverageSpending', usersController.getUsersWithAboveAverageSpending);
router.get('/inactiveInLastSixMonths', usersController.getInactiveInLastSixMonths);
router.get('/VipFrecuentAndRegular', usersController.getVipFrequentAndRegularCustomers);

module.exports = router;