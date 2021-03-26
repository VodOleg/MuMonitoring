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
    MuMonitorBE.userAuth(req.body.username)
    res.send("OK");
})

// @desc Login/Landing page
// @route GET /
router.get('/dashboard', (req,res)=>{
    res.render('dashboard')
})

module.exports = router;