

const { google } = require('googleapis');
const nodemailer = require('nodemailer');
const OpenAI = require('openai');
require('dotenv').config();

const oAuth2Client = new google.auth.OAuth2({
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    redirectUri: process.env.GOOGLE_REDIRECT_URI
});
oAuth2Client.setCredentials({ refresh_token: process.env.GOOGLE_REFRESH_TOKEN });

const openai = new OpenAI({ apiKey: process.env.OPENAI_SECRECT_KEY });

async function sendMail(data) {
    try {
        const { token } = await oAuth2Client.getAccessToken();
        if (!token) { throw new Error("Token not found , Please login again to get token"); }
        const transport = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASSWORD,
                accessToken: token,
            },
            tls: {
                rejectUnauthorized: false
            }
        });

        const mailOptions = {
            from: data.from,
            to: data.to,
            subject: 'Hello from gmail API using NodeJS',
            text: 'Hello from gmail email using API',
            html: '<h1>Hello from gmail email using API</h1>'
        };

        let response;
        if (data.label === 'Interested' || data.label === 'Not Interested' || data.label === 'More information') {
            response = await openai.chat.completions.create({
                model: "gpt-3.5-turbo-0301",
                max_tokens: 60,
                temperature: 0.5,
                messages: [{
                    role: "user", content: `If the email mentions they are ${data.label.toLowerCase()}, your reply should ask them ${data.label === 'Interested' ? "if they are willing to hop on to a demo call by suggesting a time." : data.label === 'Not Interested' ? "for feedback on why they are not interested." : "if they can give some more information whether they are interested or not as it's not clear from their previous mail."}
                    Write a small text on above request in around 50 - 80 words`
                }],
            });
        }

        if (response) {
            mailOptions.subject = `User is : ${data.label}`;
            mailOptions.text = `${response.choices[0].message.content}`;
            mailOptions.html = `<p>${response.choices[0].message.content}</p><img src="" alt="reachinbox">`;
        }

        const result = await transport.sendMail(mailOptions);
        return result;
    } catch (error) {
        console.log("Can't send email ", error.message);
        throw error;
    }
}

const parseAndSendMail = async (data1) => {
    try {
        const { from, to } = data1;
        const gmail = google.gmail({ version: 'v1', auth: oAuth2Client });
        const message = await gmail.users.messages.get({
            userId: 'kummarikalyan010@gmail.com',
            id: data1.id,
            format: 'full',
        });
        const payload = message.data.payload;
        const headers = payload.headers;
        const subject = headers.find((header) => header.name === 'Subject')?.value;
        let textContent = '';
        if (payload.parts) {
            const textPart = payload.parts.find((part) => part.mimeType === 'text/plain');
            if (textPart) {
                textContent = Buffer.from(textPart.body.data, 'base64').toString('utf-8');
            }
        } else {
            textContent = Buffer.from(payload.body.data, 'base64').toString('utf-8');
        }
        let snippet = message.data.snippet;
        const emailContext = `${subject} ${snippet} ${textContent} `;
        const response = await openai.chat.completions.create({
            model: "gpt-3.5-turbo-0301",
            max_tokens: 60,
            temperature: 0.5,
            messages: [{
                role: "user", content: `based on the following text  just give one word answer, Categorizing the text based on the content and assign a label from the given options -
        Interested,
        Not Interested,
        More information. text is : ${emailContext}`
            }],
        });
        const prediction = response.choices[0]?.message.content;
        let label;
        switch (prediction) {
            case 'Interested':
                label = 'Interested';
                break;
            case 'Not Interested':
                label = 'Not Interested';
                break;
            case 'More information.':
                label = 'More information';
                break;
            default:
                label = 'Not Sure';
        }
        const data = { subject, textContent, snippet: message.data.snippet, label, from, to };
        await sendMail(data);
    } catch (error) {
        console.log("Can't fetch email ", error.message);
    }
};


module.exports = { sendMail, parseAndSendMail, sendMailViaQueue, sendMultipleEmails };
