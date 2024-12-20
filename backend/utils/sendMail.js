const nodemailer = require('nodemailer');
const {EMAIL, EMAIL_PASSWORD} = process.env;

const sendMail = async (email, mailSubject, content) => {
    try {
        const transporter = nodemailer.createTransport({
                service: 'gmail',
                host: 'smtp.gmail.com',
                auth: {
                    user: EMAIL,
                    pass: EMAIL_PASSWORD
                }
        });

        const mailOptions = {
            from: EMAIL,
            to: email,
            subject: mailSubject,
            html: content
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if(error) {
                console.log(error);
            }
            else {
                console.log('Mail sent successfully: ', info.response);
            }
        })
    } catch (error) {
        console.log(error.message);     
    }
}

module.exports = sendMail;