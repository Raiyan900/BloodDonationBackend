const nodemailer = require('nodemailer');

let transporter = null;
function ensureTransporter(){
  if (transporter) return transporter;
  const host = process.env.SMTP_HOST;
  if (!host) return null;
  transporter = nodemailer.createTransport({
    host: host,
    port: Number(process.env.SMTP_PORT || 587),
    secure: false,
    auth: process.env.SMTP_USER ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } : undefined
  });
  return transporter;
}

async function sendMail({ to, subject, text, html }){
  const t = ensureTransporter();
  if (!t) { console.log('SMTP not configured, skipping email to', to); return; }
  const from = process.env.FROM_EMAIL || process.env.SMTP_USER || 'no-reply@example.com';
  try{
    await t.sendMail({ from, to, subject, text, html });
    console.log('Email sent to', to);
  }catch(err){ console.error('Email send failed', err); }
}

module.exports = { sendMail };
