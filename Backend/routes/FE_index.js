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
    try{
        BE.logEvent("webPageRequested");
        res.sendFile(path.join(__dirname, "./../../mu-monitor-frontend/public", "index.html"));
    }catch(exc){
        res.status(500);
    }
      
})

FE_router.post('/login', (req,res)=>{
    try{
        if (UtilityFunctions.isDefined(req.body) && UtilityFunctions.isDefined(req.body.SessionName) && UtilityFunctions.isDefined(req.body.SessionKey)){
            BE.getSessions(req.body.SessionName, req.body.SessionKey).then((success)=>{
                let bodyresponse = {response:UtilityFunctions.isDefined(success) ? true : false , payload:success};
                res.status(200).json(bodyresponse);
                BE.logEvent("successfullLogin")
            })
        }else{
            res.status(401).json({response:false});
            BE.logEvent("failedLogin")
        }
    }catch(exc){
        res.status(401).json({response:false});;
    }
})

FE_router.post('/registerEmail', (req,res)=>{
    BE.logEvent("registerEmail");
    try{
     if (UtilityFunctions.isDefined(req.body) 
     && UtilityFunctions.isDefined(req.body.SessionName)
     && UtilityFunctions.isDefined(req.body.SessionKey)
     && UtilityFunctions.isDefined(req.body.Email))
     {
         BE.registerEmailForNotifications(req.body.SessionName, req.body.SessionKey, req.body.Email).then((emailObj)=>{
             res.status(200).json({response:true, payload:emailObj});
         });
     }else{
         res.status(401).json({response:false});
     }
    }catch(exc){
        res.status(401).json({response:false});
    }
    
});

FE_router.get('/clientDownloadLink', (req,res)=>{
    try{
        BE.logEvent('clientDownloadLink');
        let link = BE.getDownloadLink();
        res.status(200).json({response:true,link:link});
    }catch(exc){
        res.status(401).json({response:false});
    }
})

FE_router.post('/verifyAndRegister', (req,res)=>{
    BE.logEvent("verifyAndRegister");
    try{
        if (UtilityFunctions.isDefined(req.body) 
        && UtilityFunctions.isDefined(req.body.SessionName)
        && UtilityFunctions.isDefined(req.body.SessionKey)
        && UtilityFunctions.isDefined(req.body.Email))
        {
            BE.verifyAndRegister(req.body.SessionName, req.body.SessionKey, req.body.Email).then((emailObj)=>{
                res.status(200).json({response:true, payload:emailObj});
            });
        }else{
            res.status(401).json({response:false});;
        }
       }catch(exc){
           res.status(401).json({response:false});;
       }
})

FE_router.post('/addWebHook', (req,res)=>{
    BE.logEvent("addWebHook");
    try{
        if (UtilityFunctions.isDefined(req.body) 
        && UtilityFunctions.isDefined(req.body.SessionName)
        && UtilityFunctions.isDefined(req.body.SessionKey)
        && UtilityFunctions.isDefined(req.body.WebHookURL))
        {
            BE.registerWebhook(req.body.SessionName, req.body.SessionKey, req.body.WebHookURL).then((webHookObj)=>{
                res.status(200).json({response:true, payload:webHookObj});
            });
        }
        else
        {
            res.status(401).json({response:false});
        }
    }catch(e){
        res.status(401).json({response:false});
    }
})

FE_router.get('/remove/:email', (req,res)=>{
    BE.logEvent("banningEmail");
    try{
        let email_to_remove = req.params.email;
        BE.banEmail(email_to_remove);
        res.write("Adding "+email_to_remove+" to discard list.");
        res.end();
    }catch(exc){
        res.status(401);
    }
})

FE_router.post('/resetNotified', (req,res)=>{
    BE.logEvent("resetNotified");
    try{
        if (UtilityFunctions.isDefined(req.body) 
        && UtilityFunctions.isDefined(req.body.SessionName)
        && UtilityFunctions.isDefined(req.body.SessionKey)
        && UtilityFunctions.isDefined(req.body.processID))
        {
            BE.resetNotification(req.body.SessionName, req.body.SessionKey, req.body.processID);
            res.status(200).json({response:true});
        }

    }catch(exc){
        res.status(401).json({response:false});;
    }
});

FE_router.post('/getSessions', (req,res)=>{
    BE.logEvent("getSessions");
    try{
        if (UtilityFunctions.isDefined(req.body) && UtilityFunctions.isDefined(req.body.SessionName) && UtilityFunctions.isDefined(req.body.SessionKey)){
            BE.getSessions(req.body.SessionName, req.body.SessionKey).then((success)=>{
                let bodyresponse = {};
                if (UtilityFunctions.isDefined(success)){
                    bodyresponse = {response:true , payload: UtilityFunctions.isDefined(success.muclients) ? success : null};
                }else{
                    bodyresponse = {response:false, payload:null}
                }
                res.status(200).json(bodyresponse);
            })
        }else{
            res.status(401).json({response:false});
        }
    }catch(exc){
        res.status(401).json({response:false});
    }
})

module.exports = FE_router;