const { response } = require('express');
const express = require('express')
const router = express.Router();
const MuMonitorBE = require('../BEService/BE_Service');
const fs = require('fs');
const UtilityFunctions = require('../BEService/Utils');

// generic error response json
const errorResponse = {
    success: false,
    message: "Error occured",
    data: null
}

// @desc Login/Landing page
// @route POST /
router.post('/StartSession',async (req,res)=>{
    // TODO: protect from DOS attack? 
   try{
        let response = await MuMonitorBE.userAuth(req.body);
        res.status(200).json(response);
        MuMonitorBE.logEvent("clientConnected");
    }catch(exc){
        console.error("Exception occured when trying to connect:");
        console.error(response);
        res.status(500).json(errorResponse)

    }
})

// @desc Login/Landing page
// @route GET /
router.post('/UpdateSession', (req,res)=>{
    // TODO: protect from DOS attack ?
    if (UtilityFunctions.isDefined(req.body)){
        MuMonitorBE.updateSession(req.body);
    }
    res.send('ok');
})

router.post('/registerEmail', (req,res)=>{
    MuMonitorBE.logEvent("registerEmailFromClient");
    try{
     if (UtilityFunctions.isDefined(req.body) 
     && UtilityFunctions.isDefined(req.body.SessionName)
     && UtilityFunctions.isDefined(req.body.SessionKey)
     && UtilityFunctions.isDefined(req.body.Email))
     {
        MuMonitorBE.registerEmailForNotifications(req.body.SessionName, req.body.SessionKey, req.body.Email).then((emailObj)=>{
             res.status(200).json({response:true, payload:emailObj});
         });
     }else{
         res.status(401).json({response:false});
     }
    }catch(exc){
        res.status(401).json({response:false});
    }
    
});

router.post('/addWebHook', (req,res)=>{
    MuMonitorBE.logEvent("addWebHookFromClient");
    try{
        if (UtilityFunctions.isDefined(req.body) 
        && UtilityFunctions.isDefined(req.body.SessionName)
        && UtilityFunctions.isDefined(req.body.SessionKey)
        && UtilityFunctions.isDefined(req.body.WebHookURL))
        {
            MuMonitorBE.registerWebhook(req.body.SessionName, req.body.SessionKey, req.body.WebHookURL).then((webHookObj)=>{
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

module.exports = router;