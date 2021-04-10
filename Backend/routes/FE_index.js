const { response } = require('express');
const express = require('express')
const FE_router = express.Router();
const MuMonitorBE = require('../BEService/BE_Service');
const fs = require('fs');
const UtilityFunctions = require('../BEService/Utils');
const path = require('path');
const BE = require('../BEService/BE_Service');

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
    res.sendFile(path.join(__dirname, "./../../mu-monitor-frontend/public", "index.html"));
      
})

FE_router.post('/login', (req,res)=>{
    if (UtilityFunctions.isDefined(req.body) && UtilityFunctions.isDefined(req.body.SessionName) && UtilityFunctions.isDefined(req.body.SessionKey)){
        BE.getSessions(req.body.SessionName, req.body.SessionKey).then((success)=>{
            let bodyresponse = {response:UtilityFunctions.isDefined(success) ? true : false , payload:success};
            res.status(200).json(bodyresponse);
        })
    }else{
        res.status(401).json({response:false});
    }
})


FE_router.post('/getSessions', (req,res)=>{
    if (UtilityFunctions.isDefined(req.body) && UtilityFunctions.isDefined(req.body.SessionName) && UtilityFunctions.isDefined(req.body.SessionKey)){
        BE.getSessions(req.body.SessionName, req.body.SessionKey).then((success)=>{
            let bodyresponse = {};
            if (UtilityFunctions.isDefined(success)){
                bodyresponse = {response:true , payload: UtilityFunctions.isDefined(success.muclients) ? success.muclients : null};
            }else{
                bodyresponse = {response:false, payload:null}
            }
            res.status(200).json(bodyresponse);
        })
    }else{
        res.status(401).json({response:false});
    }
})

module.exports = FE_router;