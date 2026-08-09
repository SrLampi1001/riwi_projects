const service = require('./reports.service');
//Level 1 Assignment
exports.getAvgUsersOrderValue = async (req, res, next)=>{
    try {
        const result = await service.getAvgUsersOrderValue();
        res.json(result);
    } catch (error) {
        next(error);
    }
}
//Level 2 Assignment
exports.getCategoriesTotalRevenue = async (req, res, next)=>{
    try{
        const revenues = await service.getCategoriesTotalRevenue();
        res.json(revenues)
    } catch (error){
        next(error);
    }
}
exports.getCategoryTotalRevenue = async (req, res, next)=>{
    try{
        const {categoryId} = req.params;
        const revenue = await service.getCategoryTotalRevenue(categoryId);
        res.json(revenue)
    } catch (error){
        next(error);
    }
}
exports.getFiveBestSellingProducts = async (req, res, next)=>{
    try{
        const products = await service.getFiveBestSellingProducts();
        res.json(products);   
    } catch (error) {
        next(error);
    }
}
exports.getDailyRevenue = async (req, res, next)=>{
    try{
        const revenue = await service.getDailyRevenue();
        res.json(revenue);
    } catch (error) {
        next(error);
    }
}
exports.getCategoriesWithNoSales = async (req, res, next)=>{
    try{
        const categories = await service.getCategoriesWithNoSales();
        res.json(categories);
    } catch (error) {
        next(error);
    }
}
//Level 3 Assignment
exports.getGlobalReports = async (req, res, next)=>{
    try{
        const reports = await service.getGlobalReports();
        res.json(reports);
    } catch (error) {
        next(error);
    }
}
exports.getCitiesRevenueFromClothesCategory = async (req, res, next)=>{
    try{
        const revenues = await service.getCitiesRevenueFromClothesCategory();
        res.json(revenues);
    } catch (error) {
        next(error);
    }
}
exports.getCityRevenueFromClothesCategory = async (req, res, next)=>{
    try{
        const {city} = req.params;
        const revenue = await service.getCityRevenueFromClothesCategory(city);
        res.json(revenue);
    } catch (error) {
        next(error);
    }
}
exports.getTotalProfit = async (req, res, next)=>{
    try{
        const profit = await service.getTotalProfit();
        res.json(profit);
    } catch (error) {
        next(error);
    }
}
exports.getThreeMostProfitableCities = async (req, res, next)=>{
    try{
        const cities = await service.getThreeMostProfitableCities();
        res.json(cities);
    } catch (error) {
        next(error);
    }
}
//Level 4 Assignment
exports.getMostRevenueMonth = async (req, res, next)=>{
    try{
        const month = await service.getMostRevenueMonth();
        res.json(month);
    } catch (error) {
        next(error);
    }
}
exports.getRevenuePercentageForEachCategory = async (req, res, next)=>{
    try{
        const revenues = await service.getRevenuePercentageForEachCategory();
        res.json(revenues);
    } catch (error) {
        next(error);
    }
}
exports.getCitiesAverageRevenue = async (req, res, next)=>{
    try{
        const revenues = await service.getCitiesAverageRevenue();
        res.json(revenues);
    } catch (error) {
        next(error);
    }
}