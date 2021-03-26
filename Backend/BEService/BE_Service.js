const db_ = require('../config/db');

class MuMonitor_Be{
    constructor(){
        this.db = db_;
    }

    userAuth(username){
        //check if user already exist
        this.db.checkifUserExist(username)
    }
}

const MuMonitorBE = new MuMonitor_Be();
module.exports = MuMonitorBE;