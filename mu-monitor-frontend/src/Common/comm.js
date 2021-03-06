// this class is used for communcation with the backend
// using axios

import axios from 'axios';
import {UtilityFunctions as UF} from './Utils';

class BE_Comm{
    constructor(){
        this.BE_URL = window.location.origin;
        this.axios = require('axios').default;
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

    async getLatestClientLink(){
        let ret = await this.send_request('/clientDownloadLink', {},"get");
        let response = "";
        if (this.processResponse(ret)){
            response = ret.data.link;
        }
        return response;
    }
    
    async registerWebhook(SessionName,SessionKey,webHookURL){
        let body={
            'SessionName':SessionName,
            'SessionKey':SessionKey,
            'WebHookURL':webHookURL
        }
        let res = await this.send_request('/addWebHook',body);
        if(this.processResponse(res)){
            return res.data.payload;
        }
        return res;
    }

    async registerEmail(SessionName,SessionKey,email){
        let body={
            'SessionName':SessionName,
            'SessionKey':SessionKey,
            'Email':email
        }
        let res = await this.send_request('/registerEmail',body);
        if(this.processResponse(res)){
            return res.data.payload;
        }
        return res;
    }

    async notifyMailVerified(SessionName,SessionKey,email){
        let body={
            'SessionName':SessionName,
            'SessionKey':SessionKey,
            'Email':email
        }
        let res = await this.send_request('/verifyAndRegister',body);
        return res;
    }
    
    async resetNotification(SessionName, SessionKey, processID){
        let body={
            'SessionName':SessionName,
            'SessionKey':SessionKey,
            'processID':processID
        }
        let res = await this.send_request('/resetNotified',body);
        return res;
    }

    async getSessions(SessionName, SessionKey){
        let body={
            'SessionName':SessionName,
            'SessionKey':SessionKey
        }
        let sessions = [];
        let res = await this.send_request('/getSessions',body);
        if (this.processResponse(res)){
            sessions = res.data.payload;
        }
        return sessions;
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
