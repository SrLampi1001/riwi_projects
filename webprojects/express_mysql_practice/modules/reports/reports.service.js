const model = require('./reports.model');
//The service only calls the model and returns the data, no business logic.
//Level 1 Assignment
exports.getAvgUsersOrderValue = async ()=>{
    return await model.getAvgUsersOrderValue();
}
//Level 2 Assignment
exports.getCategoriesTotalRevenue = async ()=> {
    const revenues = await model.getCategoriesTotalRevenue();
    if(revenues.length === 0)throw new Error("No Categories found")
    return revenues;
}
exports.getCategoryTotalRevenue = async (categoryId) => {
    const revenue = await model.getCategoryTotalRevenue(categoryId);
    if(revenue.length === 0)throw new Error("No Category found with the given id")
    return revenue[0];
}
exports.getFiveBestSellingProducts = async () => {
    const products = await model.getFiveBestSellingProducts();
    if(products.length === 0) throw new Error("No products found");
    return products;
}
exports.getDailyRevenue = async () => {
    const revenue = await model.getDailyRevenue();
    if(revenue.length === 0) throw new Error("No revenue data found");
    return revenue;
}
exports.getCategoriesWithNoSales = async () => {
    const categories = await model.getCategoriesWithNoSales();
    if(categories.length === 0) throw new Error("No categories found with no sales");
    return categories;
}
//Level 3 Assignment
exports.getGlobalReports = async () => {
    const reports = await model.getGlobalReports();
    if(reports.length === 0) throw new Error("No reports found");
    return reports;
}
exports.getCitiesRevenueFromClothesCategory = async () => {
    const revenues = await model.getCitiesRevenueFromClothesCategory();
    if(revenues.length === 0) throw new Error("No revenue data found for clothes category");
    return revenues;
}
exports.getCityRevenueFromClothesCategory = async (city) => {
    const revenue = await model.getCityRevenueFromClothesCategory(city);
    if(revenue.length === 0) throw new Error("No revenue data found for clothes category in this city");
    return revenue[0];
}
exports.getTotalProfit = async () => {
    const profit = await model.getTotalProfit();
    if(profit.length === 0) throw new Error("No profit data found");
    return profit[0];
}
exports.getThreeMostProfitableCities = async () => {
    const cities = await model.getThreeMostProfitableCities();
    if(cities.length === 0) throw new Error("No profit data found for cities");
    return cities;
}
//Level 4 Assignment
exports.getMostRevenueMonth = async () => {
    const month = await model.getMostRevenueMonth();
    if(month.length === 0) throw new Error("No revenue data found for months");
    return month[0];
}
exports.getRevenuePercentageForEachCategory = async () => {
    const revenues = await model.getRevenuePercentageForEachCategory();
    if(revenues.length === 0) throw new Error("No revenue data found for categories");
    return revenues;
}
exports.getCitiesAverageRevenue = async () => {
    const revenues = await model.getCitiesAverageRevenue();
    if(revenues.length === 0) throw new Error("No revenue data found for cities");
    return revenues;
}