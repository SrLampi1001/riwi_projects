const express = require('express');
const router = express.Router();
const productsController = require('./products.controller');
const productsLoggerMiddleware = require('../../middlewares/products.middleware');
// Apply the logger middleware to all routes in this router
router.use(productsLoggerMiddleware);
router.get('/', productsController.getAllProducts);

router.get('/:id', productsController.getProductById);
router.get('/name/:name', productsController.getProductsByName);
router.get('/category/:categoryId', productsController.getProductsByCategoryId);
router.get('/nameAndCategory', productsController.getProductsNameAndCategoryName);
//Level 1 Assignment
router.get('/categoryName/:categoryName', productsController.getProductsByCategoryName);
router.get('/electronic', productsController.getElectronicProducts);
router.get('/orderNumber/:orderNumber', productsController.getProductsByOrderNumber);
//Level 2 Assignment
router.get('/userName/:userName', productsController.getProductsFromUserByName);
router.get('/lastSaleDate', productsController.getProductsLastSaleDate);
router.get('/lastSaleDate/:id', productsController.getProductLastSaleDate);
//Level 3 Assignment
router.get('/noSales', productsController.getProductsWIthNoSales); //This route will return all products that have no sales, currently it returns nothing because all products have sales
router.get('/soldCheaper', productsController.getProductsSoldCheaperThanCurrentPrice); //This route will return all products that have been sold at least once for a price lower than their current price, currently it returns nothing because no products have been sold cheaper than their current price
router.get('/buyers/:id', productsController.getProductBuyers); 
//Level 4 Assignment
router.get('/stairProducts', productsController.getStairProducts); //This route will return all products that represent more than 2% of the total company revenue, currently it returns nothing because no products represent more than 2% of the total company revenue
router.get('/mostPaired', productsController.getMostPairedProducts);
module.exports = router;