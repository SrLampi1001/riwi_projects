module.exports = (req, res, next)=>{
    console.log(`Orders endpoint accessed at ${new Date().toISOString()}, method: ${req.method}, url: ${req.url}`); // Log the access time for debugging purposes
    next(); // Call next middleware in the chain
}