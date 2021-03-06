const mongodb = require('mongodb');
const UF = require('../BEService/Utils');
const BE_ = require('../BEService/BE_Service');
const mailer_ = require('../BEService/MailNotifier');
const UtilityFunctions = require("../BEService/Utils");

class DB_ {
    constructor(db_URI, db_name){
        this.dbConnected = false;
        this.connectDB(db_URI,db_name);
        this.conn = null;
        this.collection = {};
        this.Metrics = {};
        this.Emails = {};
        this.MetricDocumentID = {};
        this.BackEnd = BE_;
        this.mailer = mailer_;
    }

    async connectDB(db_URI,db_name){
        try{
            mongodb.MongoClient.connect(db_URI, {useUnifiedTopology:true}, (err,client)=>{
                if (err){
                    // error connecting to db
                    console.error("Failed connecting to db "+db_URI);
                    console.log(err);
                }else{
                    // connection was succesfull
                    this.conn = client.db(db_name);
                    
                    this.dbConnected = true;

                    this.collection = this.conn.collection(process.env.USER_COLLECTION);
                    this.Metrics = this.conn.collection(process.env.METRICS_COLLECTION);
                    this.Emails = this.conn.collection("Emails");
                    this.updateMetricsID();
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
        let configCollection = this.conn.collection(process.env.CONFIG_COLLECTION);
        let items = await configCollection.find().toArray();
        if (items.length < 1){
            console.error("Did not find clients configuration in the database, exit.");
            process.exit(1);
        }
        //should be only one config, in any other case this shoould be re implemented
        return items[0];
    }

    async updateMetricsID(){
        let metrics = await this.Metrics.find({}).toArray();
        this.MetricDocumentID = new mongodb.ObjectID(metrics[0]._id);
    }

    createUser(username){
        // get random key
        let sessionKey_ = UF.generateKey(6);
        
        this.collection.insertOne({
            username:username,
            sessionKey:sessionKey_,
            muclients:[]
        }
        )
        this.Metrics.updateOne({_id:this.MetricDocumentID}, {$inc : {OverallSessionsLoggedIn:1, OnlineSessions:1}});
        
        return sessionKey_;
    }
    async verifyEmail(new_email){
        let dbreturn = await this.Emails.updateOne({email:new_email}, { $set: {verified:true}});
    }

    async getEmail(email){
        return await this.Emails.findOne({email:email});
    }

    appendEmail(new_email){
        this.Emails.insertOne(new_email);
    }

    banEmail(email_to_ban){
        this.Emails.updateOne({email:email_to_ban}, { $set: {banned:true}});
    }

    async getSession(SessionName, SessionKey){
        let session = await this.collection.findOne({username:SessionName,sessionKey:SessionKey });
        return session;
    }

    async updateMetrics(eventName){
        let attribute = {}
        attribute[eventName] = 1;
        this.Metrics.updateOne({_id:this.MetricDocumentID}, {$inc : attribute});
    }

    async notifySessionClosed(session){
        try{
            if (UtilityFunctions.isDefined(session) && UtilityFunctions.isDefined(session.email)){
                let note =`${session.username} is removed from MuMonitor.\nLast Updated: ${new Date(session.lastupdated).toLocaleString()}.\nNote: The whole session data was removed from service.\n\n\nThis is automated mail from MuMonitor.com.`;
                this.mailer.sendMail(session.email, `${session.username} monitor closed`, note);
            }
        }catch(exc){
            console.error(`Exception trying to notify about session close\n${exc}`);
        }
    }

    //get all sessions from db and remove sessions that werent update in the past watchDogTimerSec
    async removeDeadSessions(timeoutSeconds){
        let sessions = await this.collection.find({}).toArray();
        //remove sessions with 0 clients
        let curretTime = Date.now();
        let timeoutMS = timeoutSeconds*1000;
        sessions.forEach(session => {
            let shouldDelete = !UF.isDefined(session.lastupdated);
            shouldDelete |= !UF.isDefined(session.muclients);
            shouldDelete |= Object.entries(session.muclients).length === 0;
            shouldDelete |= session.muclients.length === 0;
            let timePassedSinceLastUpdate = curretTime-session.lastupdated;
            shouldDelete |= (UF.isDefined(session.lastupdated) && timePassedSinceLastUpdate > (timeoutSeconds*1000 )  );
            if (shouldDelete){
                this.collection.deleteOne({_id: new mongodb.ObjectID(session._id)});
                this.Metrics.updateOne({_id:this.MetricDocumentID}, {$inc : {OnlineSessions:-1}});
                this.notifySessionClosed(session);
            }
        });
    }

    async resetNotification(SessionName, SessionKey, processID){
        let query = {username: SessionName, sessionKey: SessionKey, "muclients.processID":processID};
        let newvalues = { $set: {"muclients.$.notified":false}};
        this.collection.updateOne(query,newvalues);
    }

    registerEmail(sessionName,sessionKey,email){
        let query = { username: sessionName, sessionKey: sessionKey };
        let newvalues = { $set: { email:email } };
        this.collection.updateOne(query, newvalues);
    }

    registerWebHookURL(sessionName,sessionKey,webHookURL){
        let query = { username: sessionName, sessionKey: sessionKey};
        let newvalues = { $set: { WebHookURL:webHookURL } };
        this.collection.updateOne(query, newvalues);
    }

    updateSession(creds, clients){
        // update with new mu clients
        // update clients in different func? 
        // when updating reset the watch dog counter    
        let query = { username: creds.username, sessionKey: creds.sessionKey };
        let newvalues = { $set: { muclients: clients, lastupdated: Date.now() } };
        this.collection.updateOne(query, newvalues);

    }

    

}

const db = new DB_(process.env.MONGO_URI, process.env.DB_NAME)

module.exports = db;