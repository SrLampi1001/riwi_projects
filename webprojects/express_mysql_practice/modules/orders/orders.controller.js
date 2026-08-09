const service = require('./orders.service'); // Import the service layer for orders
exports.getAllOrders = async (req, res, next) => {
  try {
    const orders = await service.getAllOrders(); // Call the service to get all orders
    res.json(orders); // Send the orders as a JSON response
  } catch (error) {
    next(error); // Pass any errors to the error handling middleware
  }
};
exports.getOrderById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const order = await service.getOrderById(id);
    res.json(order);
  } catch (error) {
    next(error);
  }
};
exports.getOrdersByUserId = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const orders = await service.getOrdersByUserId(userId);
    res.json(orders);
  } catch (error) {
    next(error);
  }
};
exports.getOrderByOrderNumber = async (req, res, next) => {
  try {
    const { orderNumber } = req.params;
    const order = await service.getOrderByOrderNumber(orderNumber);
    res.json(order);
  } catch (error) {
    next(error);
  }
};
//Level 1 Assignment
exports.getAllOrdersWithUserEmail = async (req, res, next) => {
  try {
    const { email } = req.query; // Get the email from query parameters
    const orders = await service.getAllOrdersWithUserEmail(email);
    res.json(orders);
  } catch (error) {
    next(error);
  }
};
exports.getCountOrdersByStatus = async (req, res, next) => {
  try {
    const count = await service.getCountOrdersByStatus();
    res.json(count);
  } catch (error) {
    next(error);
  }
};
//Level 2 Assignment
exports.getOrdersReceipt = async (req, res, next)=>{
  try{
    const receipts = await service.getOrdersReceipt();
    res.json(receipts);
  } catch(error){
    next(error);
  }
};
exports.getOrderReceipt = async (req, res, next)=>{
  try{
    const {id} = req.query; //Get the id from query parameters
    const receipt = await service.getOrderReceipt(id);
    res.json(receipt)
  } catch(error){
    next(error)
  }
}
exports.getProductsFromCancelledOrders = async (req, res, next)=>{
    try{
      const products = await service.getProductsFromCancelledOrders();
      res.json(products);
    } catch (error) {
      next(error);
    }
}
//Level 3 Assignment
exports.getOrderWithMostProductVariety = async (req, res, next)=>{
    try{
      const order = await service.getOrderWithMostProductVariety();
      res.json(order);
    } catch (error) {
      next(error);
    }
}
//Level 4 Assignment
exports.getPendingOrdersWithProductsHavingLessThanFiveStock = async (req, res, next)=>{
    try{
        const orders = await service.getPendingOrdersWithProductsHavingLessThanFiveStock();
        res.json(orders);
    } catch (error){
        next(error);
    }
}
exports.getPercentageOfOrdersCancelledPerMonth = async (req, res, next)=>{
    try{
        const percentages = await service.getPercentageOfOrdersCancelledPerMonth();
        res.json(percentages);
    } catch (error){
        next(error);
    }
}