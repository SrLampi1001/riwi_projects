const service = require('./products.service');
exports.getAllProducts = async (req, res, next)=>{
    try {
        const products = await service.getAllProducts();
        res.json(products);
    } catch (error) {
        next(error);
    }
}
exports.getProductById = async (req, res, next)=>{
    try {
        const { id } = req.params;
        const product = await service.getProductById(id);
        res.json(product);
    } catch (error) {
        next(error);
    }
}
exports.getProductsByName = async (req, res, next)=>{
    try {
        const { name } = req.params;
        const products = await service.getProductsByName(name);
        res.json(products);
    } catch (error) {
        next(error);
    }
}
exports.getProductsByCategoryId = async (req, res, next)=>{
    try {
        const { categoryId } = req.params;
        const products = await service.getProductsByCategoryId(categoryId);
        res.json(products);
    } catch (error) {
        next(error);
    }
}
exports.getProductsNameAndCategoryName = async (req, res, next)=>{
    try {
        const products = await service.getProductsNameAndCategoryName();
        res.json(products);
    } catch (error) {
        next(error);
    }
}
exports.getProductsByCategoryName = async (req, res, next)=>{
    try {
        const { categoryName } = req.params;
        const products = await service.getProductsByCategoryName(categoryName);
        res.json(products);
    } catch (error) {
        next(error);
    }
}
exports.getElectronicProducts = async (req, res, next)=>{
    try {
        const products = await service.getElectronicProducts();
        res.json(products);
    } catch (error) {
        next(error);
    }
}
exports.getProductsByOrderNumber = async (req, res, next)=>{
    try {
        const { orderNumber } = req.params;
        const products = await service.getProductsByOrderNumber(orderNumber);
        res.json(products);
    } catch (error) {
        next(error);
    }
}
//Level 3 Assignment
exports.getProductsFromUserByName = async (req, res, next)=>{
    try{
        const { userName } = req.params;
        const products = await service.getProductsFromUserByName(userName);
        res.json(products);
    } catch (error){
        next(error)
    }
}
exports.getProductsLastSaleDate = async (req, res, next)=>{
    try{
        const products = await service.getProductsLastSaleDate();
        res.json(products);
    } catch (error){
        next(error);
    }
}
exports.getProductLastSaleDate = async (req, res, next)=>{
    try{
        const { id } = req.params;
        const product = await service.getProductLastSaleDate(id);
        res.json(product);
    } catch (error){
        next(error);
    }
}
//Level 3 Assignment
exports.getProductsWIthNoSales = async (req, res, next)=>{
    try{
        const products = await service.getProductsWIthNoSales();
        res.json(products);
    } catch (error){
        next(error);
    }
}
exports.getProductsSoldCheaperThanCurrentPrice = async (req, res, next)=>{
    try{
        const products = await service.getProductsSoldCheaperThanCurrentPrice();
        res.json(products);
    } catch (error){
        next(error);
    }
}
exports.getProductBuyers = async (req, res, next)=>{
    try{
        const { id } = req.params;
        const buyers = await service.getProductBuyers(id);
        res.json(buyers);
    } catch (error){
        next(error);
    }
}
//Level 4 Assignment
exports.getStairProducts = async (req, res, next)=>{
    try{
        const products = await service.getStairProducts();
        res.json(products);
    } catch (error){
        next(error);
    }
}
exports.getMostpairedProducts = async (req, res, next)=>{
    try{
        const products = await service.getMostpairedProducts();
        res.json(products);
    } catch (error){
        next(error);
    }
}