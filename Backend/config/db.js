const mongodb = require('mongodb');

class DB_ {
    constructor(db_URI, db_name){
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
                    this.collection = this.conn.collection(process.env.COLLECTION);
                    
                    console.log(`MongoDB Connected`);
                }
            })
            
        }catch (err){
            console.error(err);
            process.exit(1);
        }
    }

    checkifUserExist(username){
        console.log(username)
        this.collection.findOne({"username":username}, (err, user)=>{
            if(err){
                console.log(err);
            }
            else{
                console.log(user);
            }
        })
    }

}

const db = new DB_(process.env.MONGO_URI, process.env.DB_NAME)
// const db = new DB_(process.env.MONGO_URI, "")

module.exports = db;