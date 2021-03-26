const db_ = require('../config/db');

class MuMonitor_Be{
    constructor(){
        this.db = db_;
    }

    async userAuth(username){
        //check if user already exist
        let userExist = await this.db.checkifUserExist(username);
        if (userExist){
            return false;
        }else{
            // create user document
            this.db.createUser(username);
            return true;
        }
        
    }
}

const MuMonitorBE = new MuMonitor_Be();
module.exports = MuMonitorBE;