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
        // get random key
        let sessionKey_ = UF.generateKey(6);
        
        this.collection.insertOne({
            username:username,
            sessionKey:sessionKey_,
            muclients:{

            }
        }
        )
        return sessionKey_;
    }

    async getSession(SessionName, SessionKey){
        let session = await this.collection.findOne({username:SessionName,sessionKey:SessionKey });
        return session;
    }

    

    //get all sessions from db and remove sessions that werent update in the past watchDogTimerSec
    async removeDeadSessions(timeoutSeconds){
        let sessions = await this.collection.find({}).toArray();
        //console.log(sessions);
        //remove sessions with 0 clients
        let curretTime = Date.now();
        let timeoutMS = timeoutSeconds*1000;
        console.log("Removing dead sessions.")
        sessions.forEach(session => {
            let shouldDelete = !UF.isDefined(session.lastupdated);
            shouldDelete |= !UF.isDefined(session.muclients);
            shouldDelete |= Object.entries(session.muclients).length === 0;
            shouldDelete |= session.muclients.length === 0;
            let timePassedSinceLastUpdate = curretTime-session.lastupdated;
            shouldDelete |= (UF.isDefined(session.lastupdated) && timePassedSinceLastUpdate > (timeoutSeconds*1000 )  );
            if (shouldDelete){
                console.log(`deleting ${session.username}`)
                this.collection.deleteOne({_id: new mongodb.ObjectID(session._id)});
            }else{
                //console.log(`failed to delete ${session.username} timePassed = ${timePassedSinceLastUpdate}`)
            }
        });
    }

    updateSession(creds, clients){
        // update with new mu clients
        // update clients in different func? 
        // when updating reset the watch dog counter    
        let query = { username: creds.username, sessionKey: creds.sessionKey };
        let newvalues = { $set: { muclients: clients, lastupdated: Date.now() } };
        this.collection.updateOne(query, newvalues);

        //dbo.collection("customers").updateOne(myquery, newvalues, function(err, res) {
    }

    

}

const db = new DB_(process.env.MONGO_URI, process.env.DB_NAME)

module.exports = db;