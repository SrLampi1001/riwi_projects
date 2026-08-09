const model = require('./users.model');
//The service only calls the model and returns the data, no business logic.
exports.getAllUsers = async ()=>{
    return await model.getAllUsers();
}
exports.getUserById = async (id)=>{
    const user = await model.getUserById(id);
    if(!user) throw new Error('User not found'); // If no user is found, throw an error to be handled by the error middleware
    return user;
}
exports.getUserByEmail = async (email)=>{
    const user = await model.getUserByEmail(email);
    if(!user) throw new Error('User not found'); // If no user is found, throw an error to be handled by the error middleware
    return user;
}
//Level 1 Assignment
exports.getUserNameEmailAndOrdersNumber = async (id)=>{
    const user = await model.getUserNameEmailAndOrdersNumber(id);
    if(!user) throw new Error('User not found');
    return user;
}
exports.getUsersWithNoOrders = async ()=>{
    const users = await model.getUsersWithNoOrders();
    if(users.length === 0) throw new Error('No users found with no orders');
    return users;
}
exports.getTotalMoneySpentByUser = async (id)=>{
    const user = await model.getTotalMoneySpentByUser(id);
    if(!user) throw new Error('User not found');
    return user;
}
exports.getUsersFromCityWithOrders = async (city)=>{
    const users = await model.getUsersFromCityWithOrders(city);
    if(users.length === 0) throw new Error('No users found from this city with orders');
    return users;
}
//Level 2 Assignment
exports.getUsersWithGamerProducts = async ()=>{
    const users = await model.getUsersWithGamerProducts();
    if(users.length === 0) throw new Error('No users found with gamer products');
    return users;
}
exports.getUsersAverageOrderValue = async ()=>{
    const users = await model.getUsersAverageOrderValue();
    if(users.length === 0) throw new Error('No users found');
    return users;
}
exports.getUserAverageOrderValue = async (id)=>{
    const user = await model.getUserAverageOrderValue(id);
    if(!user) throw new Error('User not found');
    return user;
}
//Level 3 Assignment
exports.getYearBestCustomer = async ()=>{
    const user = await model.getYearBestCustomer();
    if(!user) throw new Error('No best customer found for this year');
    return user;
}
exports.getUsersWithGamingProductsButNoHomeProducts = async ()=>{
    const users = await model.getUsersWithGamingProductsButNoHomeProducts();
    if(users.length === 0) throw new Error('No users found with gaming products but no home products');
    return users;
}
//Level 4 Assignment
exports.getUsersWithAboveAverageSpending = async ()=>{
    const users = await model.getUsersWithAboveAverageSpending();
    if(users.length === 0) throw new Error('No users found with above average spending');
    return users;
}
exports.getInactiveInLastSixMonths = async ()=>{
    const users = await model.getInactiveInLastSixMonths();
    if(users.length === 0) throw new Error('No inactive users found in the last six months');
    return users;
}
exports.getVipFrequentAndRegularCustomers = async ()=>{
    const users = await model.getVipFrequentAndRegularCustomers();
    if(users.length === 0) throw new Error('No VIP, frequent or regular customers found');
    return users;
}