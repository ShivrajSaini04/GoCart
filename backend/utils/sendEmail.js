
const nodeMailer = require("nodemailer");

const sendMail = async (to, subject, text) => {
    try {
        const transporter = nodeMailer.createTransport({
            service: 'Gmail',
            auth: {
                user: process.env.USER_EMAIL,
                pass: process.env.USER_PASS,
            }
        });
        const mailOption = {
            from: process.env.USER_EMAIL,
            to,
            subject,
            text
        }
        await transporter.sendMail(mailOption); 
    }
    catch (err) {
        console.log("Error while sending email", err);
    }
};

module.exports = sendMail;