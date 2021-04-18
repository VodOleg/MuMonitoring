
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

    sendMail(to, subject, text){
        let mailOptions = {
            from: process.env.Email,
            to: to,
            subject: subject,
            text: text
        };
        //console.log("sending mail");
        this.transporter.sendMail(mailOptions, (dat,err)=>{
        });
    }
}
const mailer = new MailNotifier();
module.exports = mailer;