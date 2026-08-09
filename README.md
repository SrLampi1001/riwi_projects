# Assesment test 4
This project is an assement test created in riwi, to learn more see [here](./docs/ASSESMENT.md)
## Overview
This is a backend project, normalizes a given csv file via an endpoint and creates the respective SQL model, using MySQL to create the schema and the needed entities, along with a NoSQL logging database using mongoDB
> This project is specially made to work with the file provided in the assesment, any other file can show errors and unexpected outputs, please be wary, ([file](./docs/csv/assesment_4_example.csv))
## Tech
This projects uses:  
    - Node.js
        - Express.js
        - dotenv
        - csv-parse
        - mysql2/promises
        - mongodb
        - multer
    - Postman
    - CSV
## Project structure
```
     Assesment_test/
     ├── config/
     │   ├── mongodb.js            # Exports the mongoDB connection
     │   └── mysqldb.js            # Exports the MySQL connection pool
     ├── controllers/
     │   └── csv.controller.js     # Handles the req/res cycle for CSV uploads
     ├── middleware/
     │   ├── upload.middleware.js  # Exports the configured Multer instance
     │   └── error.middleware.js   # Executed on error   
     ├── models/
     │   ├── mongoLog.model.js     # Contains logging logic with mongodb
     │   └── mysqlTable.model.js   # Contains all database creation query functions
     ├── routes/
     │   └── csv.routes.js         # Defines the uploadCsv/ endpoint
     ├── services/
     │   └── csv.service.js        # Contains the core CSV processing logic
     ├── uploads/                  # Folder where the csv are stored temporarly
     │   └── README.md             # Filling file (serves the purporse of uploading the folder in GitHub)
     ├── assets/
     │   └── img/                  # Contains the img for the documentation
     ├── docs/
     │   ├── json/                 # contains the POSTMAN config
     │   ├── csv/                  # Contains the csv file from the assesment
     │   ├── ASSESMENT.md          # Contains an explanation on the assesment requirements
     │   └── README.md             # Explains the ERD
     ├── server.js                 # The server that initializes the app.js on the host
     ├── package.json              # Node dependencies package
     ├── .env                      # The application environment variables
     └── app.js                    # The merging point for all controllers, with the definition of endpoits and middleware
```
## Instalation
#### First Step
- Clone this repository
```bash
    git clone --branch project/web/assessment_test_4 --single-branch https://github.com/SrLampi1001/riwi_projects.git
```
- Alternatively, you can downland the .zip
#### Install dependencies
- Once inside the folder you have the repository in, execute
```bash
    npm install
```
- Make sure the package.json exists, otherwise, the dependencies won't be installed
#### Create .env file
- First, make sure you have both a MySQL and mongoDB server ready and running, if you want, you can create them using docker:
```bash
    #MySQL
    docker run --name server-mysql -e MYSQL_ROOT_PASSWORD=password -p 3306:3306 -d mysql #change the left port if 3306 is already in use
    #mongoDB
    docker run --name mongo-server -p 27017:27017 -d mongo:latest #change the left port if 27017 is already on use
```
- Create the .env file
```
# Server
MYSQL_DB_HOST=mysql_host
MYSQL_DB_USER=mysql_user
MYSQL_PASSWORD=mysql_password
MYSQ_DB_NAME=your_mysql_database
MYSQL_DB_PORT=your_mysql_db_port 
MONGODB_URI=mongodb://<your_host>:<port> #Alternatively mongodb://<user>:<password>@<server_ip>:<port>/<database>
MONGODB_NAME=mongo_database
MONGODB_LOG_COLLECTION=logs_collection
PORT=server_port #Default 3000
```
#### Run the server
- Run the server.js file using node.js
```bash
    node server.js
```
- The server will run on the localhost, you can change the port in the .env file
#### Create and use the csv
- You can create a csv or use the csv present [here](./docs/csv/assesment_4_example.csv)
- Upload the file using Postman in the endpoint `http://localhost:3000/normalizeCsv`
    - Change the "3000" for the port you are using
## Enpoints
- The base for **all** endpoints is the same "http://localhost:3000" (Change the port if you are using other)

| Enpoint | use |
|---- |----|
| /normalizeCsv | Receives a csv file and creates a SQL schema and entities inside the MySQL server provided, along with a logs collection in mongoDB |

> [!WARNING]
> UNCOMPLETED