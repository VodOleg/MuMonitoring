const { response } = require('express');
const express = require('express')
const FE_router = express.Router();
const MuMonitorBE = require('../BEService/BE_Service');
const fs = require('fs');
const UtilityFunctions = require('../BEService/Utils');
const path = require('path');
// generic error response json
const errorResponse = {
    success: false,
    message: "Error occured",
    data: null
}


// @desc Login/Landing page
// @route GET /
FE_router.get('/', (req,res)=>{
    console.log("trying to get")
    res.sendFile(path.join(__dirname, "mu-monitor-frontend/public", "index.html"));
      
})

FE_router.post('/login', (req,res)=>{
    console.log(`${JSON.stringify(req.body)} trying to login`);
    res.json({res:"OK"})
})

module.exports = FE_router;