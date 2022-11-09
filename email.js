const nodemailer = require("nodemailer");
let mailOptions = {
    from:"mahseratokpas117@gmail.com",
    to:"lilasapkotarnlm10@gmail.com",
    subject:"Email from nodemailer",
    text:"Sale on samsung",
    html:'<b>Sale janliye tero ko'
};
//Mail transport configuration
let transporter = nodemailer.createTransport