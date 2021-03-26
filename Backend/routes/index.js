const express = require('express')
const router = express.Router();
const MuMonitorBE = require('../BEService/BE_Service');

// @desc Login/Landing page
// @route GET /
router.get('/', (req,res)=>{
    console.log(req);
    res.send("OK");
})

// @desc Login/Landing page
// @route POST /
router.post('/', (req,res)=>{
    console.log(req.body);
    let authenticated = MuMonitorBE.userAuth(req.body.username);
    let response = authenticated ? "user exists" : "ok";  
    console.log(`sending ${response}`);
    //res.send(response);
    res.status(200).json({message:response});
})

// @desc Login/Landing page
// @route GET /
router.get('/dashboard', (req,res)=>{
    res.render('dashboard')
})

module.exports = router;