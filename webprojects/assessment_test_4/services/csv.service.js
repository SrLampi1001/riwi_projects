const fs = require('fs');
const path = require('path');
const { parse } = require('csv-parse');
const tableModel = require('../models/mysqlTable.model');
const { createLog } = require("../models/mongoLogs.model");
const { createEntities } = require("../models/normalizer.model");
const { head } = require('../app');

const processCsv = async (filePath) => {    //Async to be automatically wrapped in a promise
        let headers = null;
        const data = [];
        const stream = fs.createReadStream(filePath); //Creates the stream
        const parser = stream.pipe(parse({ columns: true, trim: true })); //Parses the csv file
        for await (const row of parser){//Async iterator, only works on Node.js 10+
            if(!headers){
                headers = Object.keys(row)
            }
            data.push(Object.values(row))
        }
        return {headers, data}
};

const uploadAndProcessCsv = async (file) => {
    const filePath = file.path;
    try {
        // Parse the entire CSV using the stream
        const {headers, data} = await processCsv(filePath)
        if (headers.length === 0) {
            throw new Error('CSV file is empty or headers could not be read.');
        }
        const entities = await createEntities(headers,data)
        for (const entity in entities){
            const { sanitizedTableName, sanitizedHeaders } = await tableModel.createTable(entity, entities[entity].headers);
            //await createLog("CREATE IF NOT EXISTS") //Creates log for table creation -> temporal
            // Batch insert the data using the model
            //const rowsInserted = await tableModel.batchInsert(sanitizedTableName, sanitizedHeaders, entities[entity].values);
            //await createLog("INSERT");  //Creates log for insertion
        }
        return {
            message: `Successfully processed.'.` //Message to see on enpoint public
        };

    } catch (error) {
        // Rethrow the error to be caught by the controller
        throw error;
    } finally {
        // Step 4: Clean up the uploaded file
        fs.unlinkSync(filePath);
    }
};

module.exports = {
    uploadAndProcessCsv
};