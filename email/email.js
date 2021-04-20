const nodemailer = require('nodemailer');

const sendEmail = async options =>{

    //https://ethereal.email/create <=fake email create site
    //1.create a transporter
    const transporter = nodemailer.createTransport({
        host: "smtp.ethereal.email",
        port: 587,
        //service:'Gmail',
        auth:{
            user:'karson.marks@ethereal.email',
            pass:'egQTax7CNpvFDaCUHW'
        },
        tls: {
            rejectUnauthorized: false
      }

    });

    //2.delete the email options
const mailOptions = {
    from:'Karson Marks <karson.marks@ethereal.email>',
    to:options.email,
    subject:options.subject,
    text:options.message,

}


    //3.acually send email
await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;