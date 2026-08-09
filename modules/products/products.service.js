const model = require('./products.model');
//The service only calls the model and returns the data, no business logic.
exports.getAllProducts = async ()=>{
    return await model.getAllProducts();
} 
exports.getProductById = async (id)=>{
    const product = await model.getProductById(id);
    if(!product) throw new Error('Product not found');
    return product;
}
exports.getProductsByName = async (name)=>{
    const products = await model.getProductsByName(name);
    if(products.length === 0) throw new Error('No products found with this name');
    return products;
}
exports.getProductsByCategoryId = async (categoryId)=>{
    const products = await model.getProductsByCategoryId(categoryId);
    if(products.length === 0) throw new Error('No products found for this category');
    return products;
}
exports.getProductsNameAndCategoryName = async ()=>{
    const products = await model.getProductsNameAndCategoryName();
    if(products.length === 0) throw new Error('No products found');
    return products;
}
exports.getProductsByCategoryName = async (categoryName)=>{
    const products = await model.getProductsByCategoryName(categoryName);
    if(products.length === 0) throw new Error('No products found for this category name');
    return products;
}
exports.getElectronicProducts = async ()=>{
    const products = await model.getElectronicProducts();
    if(products.length === 0) throw new Error('No electronic products found');
    return products;
}
exports.getProductsByOrderNumber = async (orderNumber)=>{
    const products = await model.getProductsByOrderNumber(orderNumber);
    if(products.length === 0) throw new Error('No products found for this order number');
    return products;
}
//Level 2 Assignment
exports.getProductsFromUserByName = async (userName)=>{
    const products = await model.getProductsFromUserByName(userName);
    if(products.length === 0) throw new Error('No products found for this user name');
    return products;
}
exports.getProductsLastSaleDate = async ()=>{
    const product = await model.getProductsLastSaleDate();
    if(!product) throw new Error('No products found');
    return product;
}
exports.getProductLastSaleDate = async (productId)=>{
    const product = await model.getProductLastSaleDate(productId);
    if(!product) throw new Error('No product found with this id');
    return product;
}
//Level 3 Assignment
exports.getProductsWIthNoSales = async ()=>{
    const products = await model.getProductsWIthNoSales();
    if(products.length === 0) throw new Error('No products found with no sales');
    return products;
}
exports.getProductsSoldCheaperThanCurrentPrice = async ()=>{
    const products = await model.getProductsSoldCheaperThanCurrentPrice();
    if(products.length === 0) throw new Error('No products found sold cheaper than current price');
    return products;
}
exports.getProductBuyers = async (productId)=>{
    const buyers = await model.getProductBuyers(productId);
    if(buyers.length === 0) throw new Error('No buyers found for this product');
    return buyers;
}
//Level 4 Assignment
exports.getStairProducts = async ()=>{
    const products = await model.getStairProducts();
    if(products.length === 0) throw new Error('No stair products found');
    return products;
}
exports.getMostPairedProducts = async ()=>{
    const products = await model.getMostPairedProducts();
    if(products.length === 0) throw new Error('No paired products found');
    return products;
}