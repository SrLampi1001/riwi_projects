# RestorApp - Assessment Test 3 Simulacrum

## About the Project

RestorApp is a **restaurant food ordering web application** developed as an academic assignment to demonstrate proficiency in full-stack web development concepts. The project simulates a real-world food ordering platform where users can browse a menu, add items to their cart, and place orders.

### What It Does
- **User Authentication**: Registration and login system with role-based access (regular users and administrators)
- **Menu Browsing**: Display products organized by categories (burgers, sides, drinks) with images and prices
- **Shopping Cart**: Add, modify, and remove items with real-time subtotal, tax calculation, and total updates
- **Order Management**: Users can place orders and view their order history
- **Admin Dashboard**: Administrators can view order statistics, recent orders, and update order statuses

### What It Solves
This project addresses the challenge of understanding how frontend applications interact with REST APIs by using **JSON Server** to simulate a real backend. It demonstrates:
- How to structure a modular JavaScript application using ES6 classes and modules
- How to perform CRUD operations via REST API calls (`GET`, `POST`, `PUT`, `DELETE`)
- How to manage user sessions and role-based navigation
- How to build responsive UIs with Bootstrap 5 and custom CSS

### Academic Context
This project was created as part of an assessment to showcase skills being learned, including:
- **Frontend Development**: HTML5, CSS3, JavaScript (ES6+)
- **Backend Simulation**: JSON Server for REST API mocking
- **Styling**: Bootstrap 5 framework and custom CSS
- **State Management**: SessionStorage for user session handling
- **Architecture**: Component-based structure with models, utils, and controllers

## Dependencies
- Node.js
- JSON Server

## Installation
- Clone the repository
```bash
    git clone --branch project/web/assessment_test_3 --single-branch https://github.com/SrLampi1001/riwi_projects.git
```
- Install JSON Server
```bash
    npm install json-server
```
- Initialize db.json on localhost:3000
```bash
    npx json-server database/db.json
```
