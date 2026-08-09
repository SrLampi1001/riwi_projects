const service = require('./users.service');

exports.getAllUsers = async (req, res, next) => {
  try {
    const users = await service.getAllUsers(); // Call the service to get all users
    res.json(users); // Send the orders as a JSON response
  } catch (error) {
    next(error); // Pass any errors to the error handling middleware
  }
}
exports.getUserById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = await service.getUserById(id);
    res.json(user);
  } catch (error) {
    next(error);
  }
}
exports.getUserByEmail = async (req, res, next) => {
  try {
    const { email } = req.params;
    const user = await service.getUserByEmail(email);
    res.json(user);
  } catch (error) {
    next(error);
  }
}
//Level 1 Assignment
exports.getUserNameEmailAndOrdersNumber = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = await service.getUserNameEmailAndOrdersNumber(id);
    res.json(user);
  } catch (error) {
    next(error);
  }
}
exports.getUsersWithNoOrders = async (req, res, next) => {
  try {
    const users = await service.getUsersWithNoOrders();
    res.json(users);
  } catch (error) {
    next(error);
  }
}
exports.getTotalMoneySpentByUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = await service.getTotalMoneySpentByUser(id);
    res.json(user);
  } catch (error) {
    next(error);
  }
}
exports.getUsersFromCityWithOrders = async (req, res, next) => {
  try {
    const { city } = req.params;
    const users = await service.getUsersFromCityWithOrders(city);
    res.json(users);
  } catch (error) {
    next(error);
  }
}
//Level 2 Assignment
exports.getUsersWithGamerProducts = async (req, res, next) => {
    try {
      const users = await service.getUsersWithGamerProducts();
      res.json(users);
    } catch (error) {
      next(error);
    }
}
exports.getUsersAverageOrderValue = async (req, res, next) => {
    try {
      const users = await service.getUsersAverageOrderValue();
      res.json(users);
    } catch (error) {
      next(error);
    }
}
exports.getUserAverageOrderValue = async (req, res, next) => {
    try {
      const { id } = req.params;
      const user = await service.getUserAverageOrderValue(id);
      res.json(user);
    } catch (error) {
      next(error);
    }
}
//Level 3 Assignment
exports.getYearBestCustomer = async (req, res, next) => {
    try {
      const user = await service.getYearBestCustomer();
      res.json(user);
    } catch (error) {
      next(error);
    }
}
exports.getUsersWithGamingProductsButNoHomeProducts = async (req, res, next) => {
    try {
      const users = await service.getUsersWithGamingProductsButNoHomeProducts();
      res.json(users);
    } catch (error) {
      next(error);
    }
}
//Level 4 Assignment
exports.getUsersWithAboveAverageSpending = async (req, res, next) => {
    try {
      const users = await service.getUsersWithAboveAverageSpending();
      res.json(users);
    } catch (error) {
      next(error);
    }
}
exports.getInactiveInLastSixMonths = async (req, res, next) => {
    try {
      const users = await service.getInactiveInLastSixMonths();
      res.json(users);
    } catch (error) {
      next(error);
    }
}
exports.getVipFrequentAndRegularCustomers = async (req, res, next) => {
    try {
      const users = await service.getVipFrequentAndRegularCustomers();
      res.json(users);
    } catch (error) {
      next(error);
    }
}