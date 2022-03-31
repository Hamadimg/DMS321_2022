const nodemailer = require('nodemailer');

let toEmail = 'depape@buffalo.edu';
let fromEmail = process.env.EMAIL_ADDRESS;

let transporter = nodemailer.createTransport({
    host: process.env.EMAIL_SERVER,
    port: 587,
    secure: false,
    requireTLS: true,
    tls: {  rejectUnauthorized: false },
    auth: {
        user: process.env.EMAIL_ADDRESS,
        pass: process.env.EMAIL_PASSWORD
        }
    });

let mailOptions = {
    from: `DMS 321 demo <${fromEmail}>`,
    to: toEmail,
    subject: 'nodejs test mail',
    };

mailOptions.text = `Hello, this is an email sent by nodejs.
It was sent from the website ubdms321.xyz.
Your lucky number today is 3.
Goodbye.`

transporter.sendMail(mailOptions, function (err,info) {
        if (err)
            console.log(err);
        else
            console.log(`mail sent to ${toEmail}`);
        });


