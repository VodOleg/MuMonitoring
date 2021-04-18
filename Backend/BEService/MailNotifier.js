
const nodemailer = require('nodemailer');


class MailNotifier{
    constructor(){
        this.transporter = nodemailer.createTransport({
            service:'gmail',
            auth:{
                user : process.env.Email,
                pass : process.env.EmailPW 
            }
        })
    }

    async sendMail(to, subject, text){
        const db_ = require('../config/db');
        try{
            let emailObj = await db_.getEmail(to);
            if (emailObj.banned){
                return;
            }
    
            let mailOptions = {
                from: "MuMonitor",
                to: to,
                subject: subject,
                text: text
            };
            //console.log("sending mail");
            this.transporter.sendMail(mailOptions, (dat,err)=>{
            });

        }catch(exc){
            console.error(exc);
        }
    }
}
const mailer = new MailNotifier();
module.exports = mailer;