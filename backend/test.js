require('dotenv').config(); // loads .env variables

const { Resend } = require('resend');
const resend = new Resend(process.env.RESEND_API_KEY);

async function testEmail() {
  try {
    const result = await resend.emails.send({
      from: 'Deelad Place <onboarding@resend.dev>',
      to: 'deeladplacesoftwork@gmail.com',
      subject: 'Test Email',
      html: '<p>Hello from Resend!</p>',
    });
    console.log(result);
  } catch (err) {
    console.error('Error sending email:', err);
  }
}

testEmail();
