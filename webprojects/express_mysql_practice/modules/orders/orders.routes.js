const express = require('express');
const router = express.Router();
const ordersController = require('./orders.controller');
const usersLoggerMiddleware = require('../../middlewares/orders.middleware'); // Middleware to log access to user routes
// Apply the logger middleware to all routes in this router
router.use(usersLoggerMiddleware);
router.get('/', ordersController.getAllOrders);

router.get('/:id', ordersController.getOrderById);
router.get('/user/:userId', ordersController.getOrdersByUserId);
router.get('/orderNumber/:orderNumber', ordersController.getOrderByOrderNumber);
//Level 1 Assignment
router.get('/withEmail/:email', ordersController.getAllOrdersWithUserEmail);
router.get('/countByStatus', ordersController.getCountOrdersByStatus);
//Level 2 Assignment
router.get('/receipts', ordersController.getOrdersReceipt);
router.get('/receipt/:id', ordersController.getOrderReceipt);
router.get('/cancelledProducts', ordersController.getProductsFromCancelledOrders);
//Level 3 Assignment
router.get('/mostProductVariety', ordersController.getOrderWithMostProductVariety);
//Level 4 Assignment
router.get('/pendingLowStock', ordersController.getPendingOrdersWithProductsHavingLessThanFiveStock);
router.get('/cancelledPercentage', ordersController.getPercentageOfOrdersCancelledPerMonth);
module.exports = router;