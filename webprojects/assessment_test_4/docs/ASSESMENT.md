# Assesment Test 4
This project is the riwi assesment test created for the module 4.  
Consist on a simple backend application, using node.js express, multer, mysql2 (optional postgress) and mongodb.  
Additionally, I've implemented envdot to use environment variables

## Assesment test requirements
Working as an engineer in LogiTech Solutions, you have the role to normalize a database constructed on a master excel file, that has grown out of control, and create a system to migrate all the information in a way that is easy to manage, interpret and consult.
### Objectives
- **Analize and structure**: Propose an organized Entity Relational Diagram
- **Persistance**: Implement a SQL and NoSQL databases for data persistance and logging
- **Node**: Create a REST API (or multiple) using express.js
- **Bussiness Inteligence**: Resolve data requirement via queries
- **Logging**: Manage log for transactions using MongoDB
### Tech requirements
- The original model has:
    -   ID Transacción, Fecha
    -   Nombre Cliente, Email Cliente, Dirección
    -   Categoría
    -   Producto, SKU, Nombre Producto, Precio Unitario, Cantidad, Nombre
    -   Proveedor, Contacto Proveedor.
Justify the normalized model
- DER
    -   Create a DER 
- Naming conventions
    - All tables must be in English
    - All table names must be lowercase
    - All id and properties must represent it't property, unless it is foreign (example, no id_clients, but just id, if inside clients entity)
- Masive data migration and organization
    - The system must be able to receive the **COMPLETE** unorganized excel file and create the SQL model, along with the logging.
    - This process must be avaiable inside an endpoint, or an executable script
- Select **one** main entity, and create a complete **crud** on it, using endpoint and ensuring the logging
- The code must be clean and modular
- Robust Error managment
- Queries
    - **Providers**: Know which providers have sold the most (in items quantity) and what is the total inventory value associated to each one, 
    - **Client behaviour**: See the purcharse history from a given client, detailing products, dates and the total spent in each transaction.
    - **Best products**: Generate a list from the most sold products from a given category, order by revenue

### Deliver 
- GitHub Repository
    - Docs folder
        - DER
        - CSV file
        - DDL for SQL and validation script for NoSQL
    - Postman colection (.json)
    - README.md
- **README Documentation** requiremts
    - Must be in english
    - DER justification
        - NoSQL-> why embebent instead of referencing?
        - SQL-> Explain normalization 
    - Complete guide on the migration and enpoint usage
    - Avaiable endpoint details

### acceptance criteria
- The system prevents duplicates and correctly recreated alredy existing regiters
- 3FN (normalization)
- NoSQL is efficient (with writting-reading)
- use .env, http responses are correctly displayed
- the queries solve the bussiness question 
### Additional points
- uses Views
- Documentation on Instalation for tools and search engines with ubuntu
- Front interface 

