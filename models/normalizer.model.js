const { sanitizeName } = require("./mysqlTable.model")
// Const with the particualities from the project, there is no time to create a general understanding using regex, instead, the code is specialized to the assesment case
const prefix = {
    "customer": "customers",
    "transaction": "transactions",
    "product": "products",
    "supplier": "suppliers",
} 
const transactions_has_products = [ // Properties from transactions_has_products without the prefix
    "total_line_value", "quantity"
]

const createEntities = async (headers, data)=>{
    const entities = { //Entities from the ERD
        "customers": {headers:[{value:"id", primary:true, data:"INT"}], values:[]}, //Initializes id
        "transactions":{headers:[{value:"customers_id", foreign:true, data:"INT"}], values:[]}, 
        "products":{headers:[{value:"id", primary:true, data:"INT"}, {value:"suppliers_id", foreign:true, data:"INT"},{value:"categories_id", foreign:true, data:"INT"}], values:[]},
        "suppliers":{headers:[{value:"id", primary:true, data:"INT"}], values:[]}, 
        "categories":{headers:[{value:"id", primary:true, data:"INT"}], values:[]}, 
        "transactions_has_products":{headers:[{value:"transactions_id", foreign:true, data:"INT"},{value:"products_id", foreign:true, data:"INT"}], values:[]}
    }   //Expect an update where the entities are defined by a separated function
    //headers
    let i = 0;
    for (const header of headers){
        sanitizedHeader = header
        const split = sanitizedHeader.split("_")
        //Conditions to create headers
        if(Object.hasOwn(prefix,split[0].trim())){ //In case the header prefix corresponds to a entity
            //Aditional conditions for each case
            if(prefix[split[0]]==="suppliers"){ //in case it is suppliers, the name is unique
                if(split[1]==="name"){
                    entities["suppliers"].headers.push({value:"name", unique:true, data:"VARCHAR(155)", i })
                    i++;
                    continue //Continue if the prefix was name
                }
            }
            else if(prefix[split[0].trim()]==="transactions"){
                if(split[1]==="id"){
                    entities["transactions"].headers.push({ value:"id",  primary:true, data:"INT", i})
                    i++;
                    continue
                }
            }
            else if(prefix[split[0]]==="products"){ //in case it is products, the name is unique
                if(split[1]==="sku"){
                    entities["products"].headers.push({ value:"sku", unique:true, data:"VARCHAR(155)",i})
                    i++;
                    continue //Continue if the prefix was name
                }
                else if(sanitizedHeader==="product_category"){ // IN case is category
                    entities["categories"].headers.push({ value:"name", unique:true, data:"VARCHAR(155)",i })
                        i++;
                    continue
                }
            }
            if(split[1]==="email"){
                entities[prefix[split[0]]].headers.push({ value:"email", unique:true, data:"VARCHAR(155)",i})
                i++;
                continue
            }
            else if(split[1]==="name"){
                entities[prefix[split[0]]].headers.push({ value:"name", unique:false, data:"VARCHAR(145)",i })
                i++;
                continue
            }
            else if(split[1]==="address"){
                entities[prefix[split[0]]].headers.push({ value:"address", unique:false, data:"VARCHAR(155)", i })
                i++;
                continue
            }
            else if(split[1]==="phone"){
                entities[prefix[split[0]]].headers.push({ value:"phone", unique:true, data:"VARCHAR(15)",i })
                i++;
                continue
            }
        }
        else{
            if(sanitizedHeader==="unit_price"){
                entities["products"].headers.push({ value:"unit_price", unique:false, data:"DECIMAL", i})
                i++;
                continue
            }
            else if(sanitizedHeader==="total_line_value"){
                entities["transactions_has_products"].headers.push({ value:"total_line_value", unique:false, data:"DECIMAL", Default:1, i})
            }
            else if(sanitizedHeader==="quantity"){
                entities["transactions_has_products"].headers.push({ value:"quantity", unique:false, data:"INT", Default:1, i})
            }
            else if(sanitizedHeader==="date"){
                entities["transactions"].headers.push({ value:"date", unique:false, data:"DATE", Default:"CURRENT_TIMESTAMP", i})
            }
        }
        i++;
    }
    //data
    i = 0
    for (const dat of data){
        if(i === 1000000)break //Iteration controller -> breaks if it surparses the million iterations
        let lenght = dat.length;
        const dti = {
            customers:[],
            transactions:[],
            products:[],
            suppliers:[],
            categories:[],
            transactions_has_products:[],
        }
        for (let e=0; e<lenght; e++){   //For each index/column inside a row
            for (const entity in entities){ //For each entity inside entities
                for (const head in entities[entity].headers){   //Look for headers
                    if(entities[entity].headers[head].i === e){ //If the index stored in the header is the same as the current data index
                        if(new RegExp("^TXN-").test(dat[e])){ //removes the prefix TXN-
                            let newStr = dat[e].slice(0, 4)
                            dti[entity].push(newStr)    
                        }else{
                            dti[entity].push(dat[e])    //Store the data inside the corresponding header array
                        }
                    }
                }   //There's no comparation to search for foreign keys.
                // Add comparation to add to foreign keys
            }
        }
        for (const entity in entities){
            let skip = false
            if(entities[entity].values.length > 0){
                const values_inside = [] //Array to insert the values as strings, to compare
                for(const val of entities[entity].values){
                    let str = val.map(e=>`${e}`).join(','); //Creates a string to compare against
                    values_inside.push(str)
                }
                let compare = dti[entity].map(e=>`${e}`).join(',') //The string to compare
                if(values_inside.includes(compare)){    //Asks if the compare string already existend, if yes, skips
                    skip = true;
                }
            }
            if(!skip)entities[entity].values.push(dti[entity])  //If skip is true (meaning the elemnt already exists, then push)
        }
    }
    return entities
}
module.exports = {
    createEntities
}