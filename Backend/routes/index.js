const { response } = require('express');
const express = require('express')
const router = express.Router();
const MuMonitorBE = require('../BEService/BE_Service');
const fs = require('fs');

var GlobalOutput = fs.createWriteStream("./Summary.log", {flags:'a'});
// generic error response json
const errorResponse = {
    success: false,
    message: "Error occured",
    data: null
}


// @desc Login/Landing page
// @route GET /
router.get('/', (req,res)=>{
    console.log(req);
    res.send("OK");
})

// @desc Login/Landing page
// @route POST /
router.post('/StartSession',async (req,res)=>{
    
    try{
        console.log(req.body);
        let response = await MuMonitorBE.userAuth(req.body.username);
        console.log(response);
        res.status(200).json(response);
    }catch(exc){
        console.error("Exception occured when trying to connect:");
        console.error(response);
        res.status(500).json(errorResponse)

    }
})

// @desc Login/Landing page
// @route GET /
router.post('/UpdateSession', (req,res)=>{
    //console.log("received updatesession");
    //console.log(req.body);
    GlobalOutput.write(JSON.stringify(req.body));
    GlobalOutput.write('\n\r');
    res.send('ok');
})

module.exports = router;