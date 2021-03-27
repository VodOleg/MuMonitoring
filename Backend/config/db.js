const mongodb = require('mongodb');
const UF = require('../BEService/Utils');

class DB_ {
    constructor(db_URI, db_name){
        this.dbConnected = false;
        this.connectDB(db_URI,db_name);
        this.conn = null;
        this.collection = {}
    }

    async connectDB(db_URI,db_name){
        try{
            console.log(`trying to connect db to ${db_URI} `)
            mongodb.MongoClient.connect(db_URI, {useUnifiedTopology:true}, (err,client)=>{
                if (err){
                    // error connecting to db
                    console.error("Failed connecting to db "+db_URI);
                    console.log(err);
                }else{
                    // connection was succesfull
                    //console.log(db);
                    this.conn = client.db(db_name);
                    
                    this.dbConnected = true;

                    this.collection = this.conn.collection(process.env.USER_COLLECTION);
                    
                    console.log(`MongoDB Connected`);
                }
            })
            
        }catch (err){
            console.error(err);
            process.exit(1);
        }
    }

    async checkifUserExist(username){
        let items = await this.collection.find({"username":username}).toArray();
        return items.length > 0;
    }

    async getClientConfiguration(){
        while (!this.dbConnected){
            await UF.sleep(1000);
        }
        console.log("requesting clients config")
        let configCollection = this.conn.collection(process.env.CONFIG_COLLECTION);
        let items = await configCollection.find().toArray();
        if (items.length < 1){
            console.error("Did not find clients configuration in the database, exit.");
            process.exit(1);
        }
        //should be only one config, in any other case this shoould be re implemented
        return items[0];
    }

    createUser(username){
        this.collection.insertOne({
            username:username,
            muclients:{

            }
        }
        )
    }

    /** TODO: __________________ */

    removeUser(username){
        // from DB, i don't want to store unactive users
        // users will be added to the db on activity
    }

    updateUser(username, obj){
        // update with new mu clients
        // update clients in different func? 
        // when updating reset the watch dog counter    
    }

    

}

const db = new DB_(process.env.MONGO_URI, process.env.DB_NAME)

module.exports = db;