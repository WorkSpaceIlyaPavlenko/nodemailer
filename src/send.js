const dns = require('dns');
dns.setDefaultResultOrder('ipv4first');

const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

const templatesDir = path.join(__dirname, 'templates');
const imagesDir = path.join(__dirname, 'assets');

const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    family: 4,
    auth: {
        user: process.env.LOGIN,
        pass: process.env.PASSWORD,
    },
});

const myInboxes = [
    process.env.GMAIL,
    process.env.OUTLOOK,
    process.env.YANDEX,
    process.env.MAIL,
].filter(Boolean);

const attachments = [
    {
        filename: 'photo.png',
        path: path.join(imagesDir, 'photo.png'),
        cid: 'hero-image'
    },
];

async function main()
{
    const files = fs.readdirSync(templatesDir).filter(f => f.endsWith('.html'));

    for (const file of files)
    {
        const html = fs.readFileSync(path.join(templatesDir, file), 'utf-8');
        const layoutName = path.basename(file, '.html');

        for (const to of myInboxes)
        {
            try {
                const info = await transporter.sendMail({
                    from: `"Layout QA" <${process.env.LOGIN}>`,
                    to,
                    subject: `[${layoutName}] тест для ${to.split('@')[1]}`,
                    html,
                    attachments
                });
                console.log(`✓ ${layoutName} → ${to} → ${info.messageId}`);
            } catch (err) {
                console.error(`✗ ${layoutName} → ${to} → ${err.message}`);
            }
            await new Promise(r => setTimeout(r, 1000));
        }
    }
}

main();