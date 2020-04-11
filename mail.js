require("dotenv").config();

const nodemailer = require("nodemailer");
const Queue = require("bee-queue");
const queue = new Queue("mail", { isWorker: true });

console.log(process.cwd());

let transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: process.env.SMTP_SECURE || false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
  tls: {
    ciphers: "SSLv3",
  },
});

transporter.verify(function (error) {
  if (error) throw error;
});

queue.process(async function (job, done) {
  console.log(`New Job: ${job}`);
  try {
    let info = await transporter.sendMail({
      from: '"docSys" <' + process.env.SMTP_USER + ">",
      to: job.data.to,
      subject: job.data.subject,
      html: job.data.text,
    });

    return done(null, info.messageId);
  } catch (error) {
    return done(error);
  }
});
