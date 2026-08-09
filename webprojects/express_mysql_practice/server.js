require('dotenv').config();
const app = require('./app');

const PORT = process.env.PORT || 3000; // Use the PORT environment variable or default to 3000 if not set

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});