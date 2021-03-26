const mongoose = require('mongoose');

class DB_ {
    constructor(db_URI){
        this.connectDB(db_URI);
    }

    async connectDB(db_URI){
        try{
            const conn = await mongoose.connect(db_URI,{
                useNewUrlParser: true,
                useUnifiedTopology: true,
                useFindAndModify: false
            })
            console.log(`MongoDB Connected: ${conn.connection.host}`)
        }catch (err){
            console.error(err);
            process.exit(1);
        }
    }

}

const db = new DB_(process.env.MONGO_URI)

module.exports = db;