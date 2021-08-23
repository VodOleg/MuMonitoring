const db_ = require('../config/db');
const UtilityFunctions = require('./Utils');
const mailer_ = require('./MailNotifier');
const semver_ = require('semver');
const Discord = require('discord.js');

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
        this.db.getClientConfiguration().then((data)=>{
            this.clientsConfig = data;
        });
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

    getDeadClients(dbclients, clients){
        let ret = [];
        try{
            dbclients.forEach(dbclient => {
                if (!UtilityFunctions.isDefined(UtilityFunctions.getEqivelent(clients,dbclient,"processID"))){
                    ret.push(dbclient);
                    return;
                }
            });
        }catch(exc){ 
            console.error(`Exception occured while filtering dbclients and clients for notify\n${exc}`);
        }
        return ret;
    }

    translateClienttoBE(muclients){
        let newclients = [];
        
        for(let i in muclients){
          let selectedItemFromList = muclients[i][muclients[i].length-1]; // last item
          
          for(let j = muclients[i].length-1; j >= 0; j-- ){
            if( muclients[i][j].suspicious ){
              selectedItemFromList = muclients[i][j];
              break;
            }
          }
          newclients.push(selectedItemFromList);
        }
        return newclients;
      }

    updateSession(session){
        try{
            let creds = session.creds;
            let muclients = this.translateClienttoBE(session.clients);
            // notification
            this.getSessionswithEmail(creds).then((dbsession)=>{
                if(UtilityFunctions.isDefined(dbsession) && (UtilityFunctions.isDefined(dbsession.email) || UtilityFunctions.isDefined(dbsession.WebHookURL))){
                    if (muclients.length !== dbsession.muclients.length){
                        let dead_clients = this.getDeadClients(dbsession.muclients , muclients);
                        let mailMessage = "";
                        dead_clients.forEach(element => {
                            mailMessage += `\n${element.alias} (${element.processID}) was removed from MuMonitor due to inactivity.`
                        });
                        if (dead_clients.length > 0 ){
                            if(UtilityFunctions.isDefined(dbsession.email)){
                                mailMessage += `\n\nSession Name: ${dbsession.username} \nSession Key: ${dbsession.sessionKey}${this.renderFooterMail(dbsession.email)}`;
                                this.mailer.sendMail(dbsession.email, `Clients removed From Monitor`,mailMessage);
                            }
                            if (UtilityFunctions.isDefined(dbsession.WebHookURL)){
                                this.sendWebhookMessage(dbsession.WebHookURL, mailMessage);
                            }
                        }
                    }

                    muclients.forEach(client => {
                        dbsession.muclients.forEach(dbclient => {
                            
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
                            let note =`\nNote: you won't receive new email notifications for this client (${client.alias}) untill you issue notification reset at www.mumonitor.com.\nSession Name: ${creds.username} \nSession Key: ${creds.sessionKey} ${this.renderFooterMail(dbsession.email)}`;
                            let pasttime = (Date.now()- new Date(Date.parse(client.monitorStartTime)) );
                            let pastInitialWarmup = (pasttime) > (1 * 60 * 1000) ; // notify only if 1 min passed since monitor started
                            if (client.suspicious && pastInitialWarmup){
                                let message = `${client.alias} (PID: ${client.processID}) having suspicious behavior.`;
                                
                                if(UtilityFunctions.isDefined(dbsession.email)){
                                    this.mailer.sendMail(dbsession.email, `${client.alias} suspicious behavior`,message+note, dbsession.WebHookURL);
                                }
                                if (UtilityFunctions.isDefined(dbsession.WebHookURL)){
                                    this.sendWebhookMessage(dbsession.WebHookURL, message);
                                }
                                client["notified"] = true;
                            }else if(client.disconnected && pastInitialWarmup){

                                let message = `${client.alias} (PID: ${client.processID}) disconnected.`;
                                if(UtilityFunctions.isDefined(dbsession.email)){
                                    this.mailer.sendMail(dbsession.email, `${client.alias} disconnected`,message+note);
                                }
                                if (UtilityFunctions.isDefined(dbsession.WebHookURL)){
                                    this.sendWebhookMessage(dbsession.WebHookURL, message);
                                }
                                
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

    renderFooterMail(email){
        return `\n\n\nThis is automated mail from MuMonitor.com.\nTo remove this mail from MuMonitor mailing list www.mumonitor.com/remove/${email}`;
    }


    async registerEmailForNotifications(sessionName, SessionKey, new_email){
        // first check if email exist
        let email = await this.db.getEmail(new_email);
            // if exist check if already verified
        if (UtilityFunctions.isDefined(email)){
            if(email.verified && !email.banned){
                // if verified and not banned register to session and return the email object
                this.db.registerEmail(sessionName,SessionKey,email.email);
                this.mailer.sendMail(email.email, `Mu Monitor session start`, `MuMonitor Session Started.\n\nSession Name:${sessionName}\nSession Key:${SessionKey}.${this.renderFooterMail(email.email)}`);
                return email;    
            }
            else if(!email.verified && !email.banned){
                //email not verified but not banned
                //generate code and send 
                email["code"]=UtilityFunctions.generateKey(4);
                this.mailer.sendMail(email.email,"MuMonitor Verification", `Your verification code : ${email["code"]}.${this.renderFooterMail(email.email)}`);
                return email;
            }else{
                // tried to register banned email, FE to handle message
                this.logEvent("triesToRegisterBannedEmail");
                console.log(`tried to register banned email ${new_email}` );
                return email;
            }
        }else{
            // if not exist generate code and include in the response also append to db dont register
            let db_email = {
                email: new_email,
                verified: false,
                banned: false,
                registeredAt: Date.now()
            }
            // append new object to db as we going to blend the code into this object
            this.db.appendEmail({...db_email});

            //now generate code and send to frontend and send mail
            db_email["code"]=UtilityFunctions.generateKey(4);
            this.mailer.sendMail(new_email,"MuMonitor Verification", `Your verification code : ${db_email["code"]}.${this.renderFooterMail(new_email)}`);
            return db_email;
        }
        return null;
    }

    async verifyAndRegister(sessionName, SessionKey, new_email){
        this.db.verifyEmail(new_email);
        this.db.registerEmail(sessionName,SessionKey,new_email);
    }

    async registerWebhook(sessionName, SessionKey, webHookURL){
        this.db.registerWebHookURL(sessionName, SessionKey, webHookURL);
    }

    async resetNotification(SessionName, SessionKey, processID){
        this.db.resetNotification(SessionName, SessionKey, processID);
    }
    
    banEmail(email){
        if(UtilityFunctions.isDefined(email)){
            if(UtilityFunctions.isNonEmptyString(email)){
                this.db.banEmail(email);
            }
        }
    }

    getDownloadLink(){
        let clientLink = this.clientsConfig.ClientsConfig.ClientLink;
        return clientLink;
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
        //session name check
        let mat = username.match("^[A-Za-z0-9]+$") ;
        let len =  username.length <= 20 && username.length >= 3;
        let sessionNameValid = len && mat!==null;
        return sessionNameValid;
    }

    validateClientVersion(clientVersion){
        // version check
        let versionValid = true;
        try{
            let clientTrimmed = clientVersion.substring(0, clientVersion.lastIndexOf("."));
            versionValid = semver_.gt(clientTrimmed, this.clientsConfig.ClientsConfig.NewestClientVersion) ||
                                semver_.eq(clientTrimmed, this.clientsConfig.ClientsConfig.NewestClientVersion);
        }catch(e){
            console.error(JSON.stringify(e));
        }
        return versionValid;
    }

    async sendWebhookMessage(url, message){
        let webhook = new Discord.WebhookClient({url:url}); 
        webhook.send(message);
    }

    async userAuth(body){
        //check if valid session name
        let resObject;
        let username = "";
        let clientVersion = "1.0.0.0";
        if(UtilityFunctions.checkNested(body,"username")){
            username = body.username;
        }
        if(UtilityFunctions.checkNested(body,"clientVersion")){
            clientVersion = body.clientVersion;
        }
        let validSessionName = this.validateSessionName(username);
        if (!validSessionName){
            resObject = {
                success:false,
                message:"Invalid Session Name. (3-20 characters, letters and digits only.)",
                data: null
            }
            return resObject;   
        }
        if(!this.validateClientVersion(clientVersion)){
            resObject = {
                success:false,
                message:"Newer client version is availble, please download from the website.",
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