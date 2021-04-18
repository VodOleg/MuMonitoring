const db_ = require('../config/db');
const UtilityFunctions = require('./Utils');
const mailer_ = require('./MailNotifier');

class MuMonitor_Be{
    constructor(){
        this.db = db_;
        this.clientsConfig = null;
        this.customInit();
        this.periodicHandle;
        this.watchDogTimerSec = 60 * 60 * 1;
        this.mailer = mailer_;
    }

    async customInit(){
        // get the configuration to populate to clients from the db
        this.clientsConfig = await this.db.getClientConfiguration();
        this.periodicHandle = setInterval(() => {
            this.periodicTasks();
        }, this.watchDogTimerSec* 1000);
    }

    periodicTasks(){
        //watch dog

        this.db.removeDeadSessions(this.watchDogTimerSec);
    }

    async getSessionswithEmail(creds){
        
        let session = await this.db.getSession(creds.username,creds.sessionKey);
        let ret = null;
        if(UtilityFunctions.isDefined(session) && UtilityFunctions.isDefined(session.muclients)){
            ret = session;
        }
        return ret;
    }

    updateSession(session){
        try{
            let creds = session.creds;
            let muclients = session.clients;
            // notification
            this.getSessionswithEmail(creds).then((session)=>{
                if(UtilityFunctions.isDefined(session) && UtilityFunctions.isDefined(session.email)){
                    muclients.forEach(client => {
                        session.muclients.forEach(dbclient => {
                            
                            if( client.processID !== dbclient.processID){
                                return;
                            }    

                            let notified;


                            //check if defined
                            notified = UtilityFunctions.isDefined(dbclient.notified);
                            //id defined assign if it already notified
                            if(notified){
                                notified = dbclient.notified;
                            }
                            //update client
                            client["notified"]= notified;
                            //if already notified don't continue
                            if (notified){
                                return;
                            }
                            let note =`\n Note: you won't receive new email notifications for this client untill you issue notification reset notification in the web (www.mumonitor.com).\n Session Name: ${creds.username} \nSession Key: ${creds.sessionKey}`;
                            if (client.suspicious){
                                let message = `${client.alias} (PID: ${client.processID}) having suspicious behavior.`+note; 
                                this.mailer.sendMail(session.email, `${client.alias} suspicious behavior`,message);
                                client["notified"] = true;
                            }else if(client.disconnected){
                                this.mailer.sendMail(email, `${client.alias} disconnected`,`${client.alias} (PID: ${client.processID}) disconnected.`+note );
                                client.notified = true
                            }
                        });
                    });
                }
                this.db.updateSession(creds,muclients);
            });

        }catch(exc){
            console.log(`Exception occured when updating session\n ${exc}`);
        }
    }

    logEvent(eventName){
        this.db.updateMetrics(eventName);
    }

    registerEmailForNotifications(sessionName, SessionKey, email){
        this.logEvent("EmailRegistred");
        this.db.registerEmail(sessionName,SessionKey,email);
    }

    async resetNotification(SessionName, SessionKey, processID){
        this.db.resetNotification(SessionName, SessionKey, processID);
    }
    
    async getSessions(SessionName, SessionKey){
        let session = await this.db.getSession(SessionName,SessionKey);
        let ret = null;
        if(UtilityFunctions.isDefined(session) && UtilityFunctions.isDefined(session.muclients)){
            ret = session;
        }
        return ret;
    }
    
    validateSessionName(username){
        let mat = username.match("^[A-Za-z0-9]+$") ;
        let len =  username.length <= 20 && username.length >= 3;
        return len && mat!==null;
    }

    async userAuth(username){
        //check if valid session name
        let resObject;
        let validSessionName = this.validateSessionName(username);
        if (!validSessionName){
            resObject = {
                success:false,
                message:"Invalid Session Name. (3-20 characters, letters and digits only.)",
                data: null
            }
            return resObject;   
        }

        //check if user already exist
        let userExist = await this.db.checkifUserExist(username);
        if (userExist){
            // such session already exist
            resObject = {
                success:false,
                message:"Session ID already exist.",
                data: null
            }
        }else{
            // create user document
            let sessionKey = this.db.createUser(username);
            // send the configurations create response data
            let data_ = {
                ClientConfig: this.clientsConfig.ClientsConfig,
                SessionKey: sessionKey
            }
            resObject = {
                success:true,
                message:"Successsfully initialized Session ID.",
                data: data_
            }
        }
        return resObject;
    }
}

const MuMonitorBE = new MuMonitor_Be();
module.exports = MuMonitorBE;