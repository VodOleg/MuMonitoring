require('dotenv').config({path:'../config/config.env'});
const Discord = require('discord.js');

class DiscordNotifier{
    constructor(url){
        this.webhook = new Discord.WebhookClient({url:url}); 
    }
    sendMessage(message, url){
        
        this.webhook.send(message);
    }
}

