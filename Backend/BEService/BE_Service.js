const db_ = require('../config/db');
const UtilityFunctions = require('./Utils');

class MuMonitor_Be{
    constructor(){
        this.db = db_;
        this.clientsConfig = null;
        this.customInit();
        this.periodicHandle;
        this.watchDogTimerSec = 600;
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

    updateSession(session){
        try{
            let creds = session.creds;
            let muclients = session.clients;
            this.db.updateSession(creds,muclients);
            
            // TODO:
            // Any kind of push notifications should go here...
            //...
            //...

        }catch(exc){
            console.log(`Exception occured when updating session\n ${exc}`);
        }
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
        let len =  username.length <= 20;
        return len && mat!==null;
    }

    async userAuth(username){
        //check if valid session name
        let resObject;
        let validSessionName = this.validateSessionName(username);
        if (!validSessionName){
            resObject = {
                success:false,
                message:"Invalid Session Name. (max 20 characters, letters and digits only.)",
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