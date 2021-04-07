// this class is used for communcation with the backend
// using axios

import axios from 'axios';
import {UtilityFunctions as UF, UtilityFunctions} from './Utils';

class BE_Comm{
    constructor(){
        this.BE_URL = window.location.origin;
        this.axios = require('axios').default;
    }

    async test(){
        let res1 = await this.send_request("SellabelItem",null);
        console.log(res1);
        let res2 = await this.send_request("SellabelItem/test",{test:{JobId:"asd"}});
        console.log(res2.data);
    }

    async tryLogIn(SessionName, SessionKey){
        let user = {
            authenticated:false,
            payload:null
        }
        
        let body={
            'SessionName':SessionName,
            'SessionKey':SessionKey
        }
        let res = await this.send_request('/login',body);
        user.authenticated = this.processResponse(res);
        user.payload = res.data.payload;
        return user;
    }


    processResponse(res){
        return UF.isDefined(res) && UF.isDefined(res.data.response) && res.data.response===true;
    }


    async send_request(controller, body, type='post'){
        let config = {
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': 'null'
            }
        };
        let request = this.BE_URL+controller;
        console.log(`sending request to:`,request);
        let response = null;
        try{
            if (type ==='post'){
                response = await axios.post(request,body,config);
            }else if(type ==='get'){
                response = await axios.get(request,config);
            }
        }catch(exc){
        }
        return response;
    }

    
}

// singleton implementation for the BE module
const BE = new BE_Comm();
Object.freeze(BE);
export default BE;
