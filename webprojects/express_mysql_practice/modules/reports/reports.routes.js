const express = require('express');
const router = express.Router();
const reportsController = require('./reports.controller');
const reportsLoggerMiddleware = require('../../middlewares/reports.middleware');
// Apply the logger middleware to all routes in this router
router.use(reportsLoggerMiddleware);
//Level 1 Assignment
router.get('/avg-users-order-value', reportsController.getAvgUsersOrderValue);
//Level 2 Assignment
router.get('/category-revenues', reportsController.getCategoriesTotalRevenue)
router.get('/category-revenues/:categoryId', reportsController.getCategoryTotalRevenue)
router.get('/five-best-selling-products', reportsController.getFiveBestSellingProducts)
router.get('/daily-revenue', reportsController.getDailyRevenue)
router.get('/categories-with-no-sales', reportsController.getCategoriesWithNoSales) //This route will return all categories that have no sales, currently it returns nothing because all categories have sales
//Level 3 Assignment
router.get('/global-reports', reportsController.getGlobalReports)
router.get('/cities-revenue-clothes-category', reportsController.getCitiesRevenueFromClothesCategory)
router.get('/city-revenue-clothes-category/:city', reportsController.getCityRevenueFromClothesCategory)
router.get('/total-profit', reportsController.getTotalProfit)
router.get('/three-most-profitable-cities', reportsController.getThreeMostProfitableCities)
//Level 4 Assignment
router.get('/most-revenue-month', reportsController.getMostRevenueMonth)
router.get('/revenue-percentage-each-category', reportsController.getRevenuePercentageForEachCategory)
router.get('/average-cities-revenue', reportsController.getCitiesAverageRevenue)

module.exports = router;