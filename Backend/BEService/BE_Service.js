const db_ = require('../config/db');

class MuMonitor_Be{
    constructor(){
        this.db = db_;
        this.clientsConfig = null;
        this.customInit();
    }

    async customInit(){
        // get the configuration to populate to clients from the db
        this.clientsConfig = await this.db.getClientConfiguration();
        console.log(this.clientsConfig);
    }


    async userAuth(username){
        //check if user already exist
        let userExist = await this.db.checkifUserExist(username);
        let resObject;
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