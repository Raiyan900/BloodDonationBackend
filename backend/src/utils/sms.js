const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const fromNumber = process.env.TWILIO_FROM;

let client = null;
function getClient(){
  if (client) return client;
  if (!accountSid || !authToken) return null;
  const Twilio = require('twilio');
  client = Twilio(accountSid, authToken);
  return client;
}

async function sendSms({ to, body }){
  const c = getClient();
  if (!c){ console.log('Twilio not configured, skipping SMS to', to); return; }
  if (!fromNumber){ console.log('TWILIO_FROM not set, skipping SMS'); return; }
  try{
    await c.messages.create({ from: fromNumber, to, body });
    console.log('SMS sent to', to);
  }catch(err){ console.error('SMS send failed', err); }
}

module.exports = { sendSms };
