const db = require('../config/mysqldb');

// Helper to sanitize names for SQL
const sanitizeName = (name) => name.replace(/[^a-zA-Z0-9_]/g, '').replace(/\s+/g, '_').toLowerCase(); //Removes Uppercases, spaces and chars incompatible with mySQL naming

const createTable = async (tableName, headers) => { //Execution in case it doesn't exists, normally, if the ddl is executed, this won't be necesary
    const sanitizedTableName = sanitizeName(tableName);
    const sanitizedHeaders = headers.map(h => sanitizeName(h.value));
    let primary = null;
    if(!sanitizedHeaders.includes("id")){
        let foreigns = sanitizedHeaders.filter(h=> new RegExp(`id$`).test(h)).map(h=>`\`${h}\``).join(",");
        primary = `PRIMARY KEY (${foreigns}),`;
    }
    console.log(sanitizedHeaders, sanitizedTableName)
    const query = `
        CREATE TABLE IF NOT EXISTS \`${sanitizedTableName}\` (
            ${primary || ''}
            ${
                sanitizedHeaders.map(h => `\`${h}\` VARCHAR(255)`).join(', ') //Create a new function to see convention names and assign their respective data types
        }
        );
    `; //This function is inneficent as it only allows to create a type of data at the time, unless a convention is used for names
    console.log(query)
    //console.log(await db.execute(query));   //temporal console.log() for debbuging, for log creation
    return { sanitizedTableName, sanitizedHeaders };    //Returns for further use on csv services.
};

const batchInsert = async (tableName, headers, data) => {
    if (data.length === 0) return 0;
    const query = `INSERT INTO \`${tableName}\` (${headers.map(h => `\`${h}\``).join(', ')}) VALUES ?`;
    const [result] = await db.query(query, [data]);
    return result.affectedRows; //Property from db.query return value.
};

module.exports = {
    createTable,
    batchInsert,
    sanitizeName
};