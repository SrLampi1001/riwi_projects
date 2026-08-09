# express mysql

Practice project built to get comfortable with **Express** and building **REST API endpoints** that query a **MySQL** database.

This API is organized by modules (`users`, `orders`, `products`, `reports`) and exposes endpoints under `/api/...`.
This project is made following the model, service, controller, route convention.
- The db query is created inside the model (for each databse entity), this query is exceuted as a service inside the services, controller creates the json, and finally route creates the route endpoint to access the query results.

## Tech stack

- Node.js + Express (JSON API)
- MySQL
- `mysql2` (promise-based pool)
- `dotenv` for environment variables

## Project structure
     ├── app.js
     ├── server.js
     ├── package.json
     ├── config/
     │   └── db.js
     ├── middlewares/
     │   ├── error.middleware.js
     │   ├── users.middleware.js
     │   ├── orders.middleware.js
     │   ├── products.middleware.js
     │   └── reports.middleware.js
     └── modules/
         ├── users/
         │   ├── users.model.js
         │   ├── users.service.js
         │   ├── users.controller.js
         │   └── users.routes.js
         ├── orders/
         │   ├── orders.model.js
         │   ├── orders.service.js
         │   ├── orders.controller.js
         │   └── orders.routes.js
         ├── products/
         │   │   ├── users.model.js
         │   ├── users.service.js
         │   ├── users.controller.js
         │   └──users.routes.js products.routes.js
         └── reports/
             ├── reports.model.js
             ├── reports.service.js
             ├── reports.controller.js
             └── reports.routes.js

### Key files

- `server.js`: loads `.env`, starts the HTTP server on `PORT` (default `3000`).  
- `app.js`: Express app wiring (JSON middleware + route mounting + error middleware). 
- `config/db.js`: MySQL connection pool using `mysql2/promise`.  
- `middlewares/error.middleware.js`: basic error handler returning `500` + message.
- `.env`: Contains the environment variables for the databse connection
## Setup

### 1) Install dependencies

```bash
npm install
```

### 2) Create a `.env` file

Create a `.env` file in the project root (it is ignored by git):

```env
# Server
PORT=3000

# MySQL connection (used by config/db.js)
IP=127.0.0.1
USER=root
PASSWORD=your_password
DB_NAME=your_database
```

> Note: This project uses env var names `IP`, `USER`, `PASSWORD`, `DB_NAME` as written in `config/db.js`.
> If you prefer more standard names like `DB_HOST`, `DB_USER`, etc., update `config/db.js` accordingly.

### 3) Ensure MySQL is running

- Start your MySQL server
- Create the database you reference in `DB_NAME`
- Ensure the user/password has access

## Run the server

```bash
node server.js
```

You should see:

```
Server running on port 3000
```

Base URL (default):  
`http://localhost:3000`

## API routes

All routes are mounted under `/api`:

### Users (`/api/users`)

Common:
- `GET /api/users` – list all users
- `GET /api/users/:id` – user by id
- `GET /api/users/email/:email` – user by email

Additional (assignments / reporting-style endpoints):
- `GET /api/users/nameEmailOrders/:id`
- `GET /api/users/noOrders`
- `GET /api/users/totalMoneySpent/:id`
- `GET /api/users/cityWithOrders/:city`
- `GET /api/users/gamerProducts`
- `GET /api/users/averageOrderValue`
- `GET /api/users/averageOrderValue/:id`
- `GET /api/users/yearBestCustomer`
- `GET /api/users/gamingNoHome`
- `GET /api/users/aboveAverageSpending`
- `GET /api/users/inactiveInLastSixMonths`
- `GET /api/users/VipFrecuentAndRegular`

### Orders (`/api/orders`)

Common:
- `GET /api/orders` – list all orders
- `GET /api/orders/:id` – order by id
- `GET /api/orders/user/:userId` – orders by user id
- `GET /api/orders/orderNumber/:orderNumber` – order by order number

Additional:
- `GET /api/orders/withEmail` – orders (optionally filtered by `email` query param)
- `GET /api/orders/countByStatus`
- `GET /api/orders/receipts`
- `GET /api/orders/receipt/:orderId` *(implementation reads `id` from query in controller; see note below)*
- `GET /api/orders/cancelledProducts`
- `GET /api/orders/mostProductVariety`
- `GET /api/orders/pendingLowStock`
- `GET /api/orders/cancelledPercentage`

### Products (`/api/products`)

Common:
- `GET /api/products`
- `GET /api/products/:id`
- `GET /api/products/name/:name`
- `GET /api/products/category/:categoryId`
- `GET /api/products/nameAndCategory`

Additional:
- `GET /api/products/categoryName/:categoryName`
- `GET /api/products/electronic`
- `GET /api/products/orderNumber/:orderNumber`
- `GET /api/products/userName/:userName`
- `GET /api/products/lastSaleDate`
- `GET /api/products/lastSaleDate/:productId`
- `GET /api/products/noSales`
- `GET /api/products/soldCheaper`
- `GET /api/products/buyers/:productId`
- `GET /api/products/stairProducts`
- `GET /api/products/mostPaired`

### Reports (`/api/reports`)

- `GET /api/reports/avg-users-order-value`
- `GET /api/reports/category-revenues`
- `GET /api/reports/category-revenues/:categoryId`
- `GET /api/reports/five-best-selling-products`
- `GET /api/reports/daily-revenue`
- `GET /api/reports/categories-with-no-sales`
- `GET /api/reports/global-reports`
- `GET /api/reports/cities-revenue-clothes-category`
- `GET /api/reports/city-revenue-clothes-category/:city`
- `GET /api/reports/total-profit`
- `GET /api/reports/three-most-profitable-cities`
- `GET /api/reports/most-revenue-month`
- `GET /api/reports/revenue-percentage-each-category`
- `GET /api/reports/average-cities-revenue`

## Example requests

```bash
curl http://localhost:3000/api/users
curl http://localhost:3000/api/orders/user/1
curl http://localhost:3000/api/reports/five-best-selling-products
```

## Notes / known rough edges

This is a learning project, so a few endpoints include comments like “currently it returns nothing” (because the sample data doesn’t produce results for that query).

## Error handling

Unhandled errors are caught by `middlewares/error.middleware.js` and returned as:

- HTTP status: `500`
- JSON body: `err.message` (or a generic `"Internal Server Error"`)

