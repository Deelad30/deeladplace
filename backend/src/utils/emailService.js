const nodemailer = require("nodemailer");
const { Resend } = require("resend");
require("dotenv").config();

class EmailService {
  constructor() {
    if (process.env.NODE_ENV === "production") {
      this.client = new Resend( process.env.RESEND_API_KEY );
    } else {
      this.transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || "smtp.gmail.com",
        port: parseInt(process.env.SMTP_PORT, 10) || 587,
        secure: process.env.SMTP_SECURE === "true",
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });
    }
  }

  async sendMail({ to, subject, html, from }) {
    if (process.env.NODE_ENV === "production") {
      const sender = from || process.env.SMTP_FROM;
      const result = await this.client.emails.send({
        from: sender,
        to,
        subject,
        html,
      });
      console.log(`✅ Email sent to ${to} via Resend`);
      return result;
    } else {
      const sender = from || process.env.SMTP_FROM;
      const result = await this.transporter.sendMail({
        from: sender,
        to,
        subject,
        html,
      });
      console.log(`✅ Email sent to ${to} via SMTP`);
      return result;
    }
  }

  async verifyConnection() {
    if (process.env.NODE_ENV === "production") {
      console.log("✅ Email service using Resend (production) — verification skipped");
      return;
    }
    try {
      await this.transporter.verify();
      console.log('✅ Email service connected successfully');
    } catch (error) {
      console.error('❌ Email service connection failed:', error.message);
    }
  }

  async sendWelcomeEmail(user) {
    try {
      const mailOptions = {
        from: `"Dee Softwork" <${process.env.SMTP_FROM}>`,
        to: user.email,
        subject: 'Welcome to Dee Softwork App!',
        html:` <!DOCTYPE html> <html> <head> <meta charset="UTF-8" /> <meta name="viewport" content="width=device-width, initial-scale=1.0" /> <title>Welcome to Dee Softwork</title> </head> <body style="margin:0; padding:0; background-color:#f5f5f5;"> <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f5f5f5; padding:20px 0;"> <tr> <td align="center"> <table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px; background-color:#ffffff; border-radius:8px; overflow:hidden; font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif;"> <!-- Header / Logo --> <tr> <td align="center" style="padding:32px 20px; background-color:#ffffff;"> <!-- Replace src with your logo URL --> <img src="https://ibb.co/wNLNjKs0" alt="Dee Softwork Logo" width="120" style="display:block; max-width:120px; height:auto;" /> </td> </tr> <!-- Accent Divider --> <tr> <td style="height:4px; background-color:#d91f22;"></td> </tr> <!-- Content --> <tr> <td style="padding:40px 32px; color:#111111;"> <h2 style="margin:0 0 16px 0; font-size:24px; font-weight:600; color:#d91f22;"> Welcome to Deelad Place SaaS </h2> <p style="margin:0 0 16px 0; font-size:16px; line-height:1.6;"> Hello ${user.name}, </p> <p style="margin:0 0 24px 0; font-size:16px; line-height:1.6;"> Your account has been successfully created. You now have access to the Deelad Place management system. </p> <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;"> <tr> <td style="font-size:16px; line-height:1.6;"> <strong>Account Details</strong> </td> </tr> <tr> <td style="padding-top:8px; font-size:15px; line-height:1.6;"> Email: ${user.email}<br /> Role: ${user.role}<br /> Registration Date: ${new Date().toLocaleDateString()} </td> </tr> </table> <!-- CTA --> <table cellpadding="0" cellspacing="0" style="margin:32px 0;"> <tr> <td align="center"> <a href="${process.env.CLIENT_URL}/login" style=" display:inline-block; padding:14px 28px; font-size:16px; font-weight:500; color:#ffffff; background-color:#d91f22; text-decoration:none; border-radius:6px; " > Log in to your account </a> </td> </tr> </table> <p style="margin:0 0 16px 0; font-size:15px; line-height:1.6; color:#444444;"> If you have any questions, our support team is always happy to help. </p> <p style="margin:0; font-size:15px; line-height:1.6;"> Best regards,<br /> <strong>Dee Softwork Team</strong> </p> </td> </tr> </table> </td> </tr> </table> </body> </html>` ,
        
      };

      const result = await this.sendMail(mailOptions);
      console.log(`✅ Welcome email sent to: ${user.email}`);
      return result;
    } catch (error) {
      console.error('❌ Failed to send welcome email:', error.message);
      throw error;
    }
  }
  async sendLoginNotification(user, loginTime) {
    try {
      const mailOptions = {
        from: `"Dee Softwork" <${process.env.SMTP_FROM}>`,
        to: user.email,
        subject: 'New Login to Your Dee Softwork Account',
html: `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Security Notification</title>
  </head>
  <body style="margin:0; padding:0; background-color:#f5f5f5;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f5f5f5; padding:20px 0;">
      <tr>
        <td align="center">
          <table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px; background-color:#ffffff; border-radius:8px; overflow:hidden; font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif;">

            <!-- Header / Logo -->
            <tr>
              <td align="center" style="padding:32px 20px; background-color:#ffffff;">
                <!-- Replace with your logo URL -->
                <img 
                  src="https://app.deesoftwork.com.ng/logo.png" 
                  alt="Dee Softwork Logo" 
                  width="120" 
                  style="display:block; max-width:120px; height:auto;"
                />
              </td>
            </tr>

            <!-- Accent Divider -->
            <tr>
              <td style="height:4px; background-color:#d91f22;"></td>
            </tr>

            <!-- Content -->
            <tr>
              <td style="padding:40px 32px; color:#111111;">
                <h2 style="margin:0 0 16px 0; font-size:24px; font-weight:600; color:#d91f22;">
                  Security Notification
                </h2>

                <p style="margin:0 0 16px 0; font-size:16px; line-height:1.6;">
                  Hello ${user.name},
                </p>

                <p style="margin:0 0 24px 0; font-size:16px; line-height:1.6;">
                  We detected a new login to your Deelad Place account.
                </p>

                <!-- Login Details -->
                <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
                  <tr>
                    <td style="font-size:16px; line-height:1.6;">
                      <strong>Login Details</strong>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding-top:8px; font-size:15px; line-height:1.6;">
                      Time: ${loginTime}<br />
                      Account: ${user.email}
                    </td>
                  </tr>
                </table>

                <p style="margin:0 0 16px 0; font-size:15px; line-height:1.6; color:#444444;">
                  If this was you, no action is needed.
                </p>

                <p style="margin:0 0 24px 0; font-size:15px; line-height:1.6; color:#444444;">
                  If you don’t recognize this activity, we strongly recommend resetting your password immediately.
                </p>

                <!-- CTA -->
                <table cellpadding="0" cellspacing="0" style="margin-bottom:32px;">
                  <tr>
                    <td align="center">
                      <a 
                        href="${process.env.CLIENT_URL}/reset-password"
                        style="
                          display:inline-block;
                          padding:14px 28px;
                          font-size:16px;
                          font-weight:500;
                          color:#ffffff;
                          background-color:#d91f22;
                          text-decoration:none;
                          border-radius:6px;
                        "
                      >
                        Reset Password
                      </a>
                    </td>
                  </tr>
                </table>

                <p style="margin:0; font-size:15px; line-height:1.6;">
                  Best regards,<br />
                  <strong>Dee Softwork Security Team</strong>
                </p>
              </td>
            </tr>

          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
`
,
      };

      const result = await this.sendMail(mailOptions);
      console.log(`✅ Login notification sent to: ${user.email}`);
      return result;
    } catch (error) {
      console.error('❌ Failed to send login notification:', error.message);
      throw error;
    }
  }

  async sendPasswordResetEmail(user, resetToken) {
    try {
      const resetLink = `${process.env.CLIENT_URL}/reset-password?token=${resetToken}`;

      const mailOptions = {
        from: `"Dee Softwork" <${process.env.SMTP_FROM}>`,
        to: user.email,
        subject: 'Reset Your Dee Softwork Password',
html: `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Password Reset</title>
  </head>
  <body style="margin:0; padding:0; background-color:#f5f5f5;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f5f5f5; padding:20px 0;">
      <tr>
        <td align="center">
          <table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px; background-color:#ffffff; border-radius:8px; overflow:hidden; font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif;">

            <!-- Header / Logo -->
            <tr>
              <td align="center" style="padding:32px 20px; background-color:#ffffff;">
                <!-- Replace with your logo URL -->
                <img 
                  src="https://app.deesoftwork.com.ng/logo.png" 
                  alt="Dee Softwork Logo" 
                  width="120" 
                  style="display:block; max-width:120px; height:auto;"
                />
              </td>
            </tr>

            <!-- Accent Divider -->
            <tr>
              <td style="height:4px; background-color:#d91f22;"></td>
            </tr>

            <!-- Content -->
            <tr>
              <td style="padding:40px 32px; color:#111111;">
                <h2 style="margin:0 0 16px 0; font-size:24px; font-weight:600; color:#d91f22;">
                  Password Reset Request
                </h2>

                <p style="margin:0 0 16px 0; font-size:16px; line-height:1.6;">
                  Hello ${user.name},
                </p>

                <p style="margin:0 0 24px 0; font-size:16px; line-height:1.6;">
                  We received a request to reset your password. Click the button below to create a new one.
                </p>

                <!-- CTA -->
                <table cellpadding="0" cellspacing="0" style="margin:32px 0;">
                  <tr>
                    <td align="center">
                      <a 
                        href="${resetLink}"
                        style="
                          display:inline-block;
                          padding:14px 28px;
                          font-size:16px;
                          font-weight:500;
                          color:#ffffff;
                          background-color:#d91f22;
                          text-decoration:none;
                          border-radius:6px;
                        "
                      >
                        Reset Password
                      </a>
                    </td>
                  </tr>
                </table>

                <p style="margin:0 0 16px 0; font-size:15px; line-height:1.6; color:#444444;">
                  <strong>This link will expire in 1 hour</strong> for security reasons.
                </p>

                <p style="margin:0 0 24px 0; font-size:15px; line-height:1.6; color:#444444;">
                  If you didn’t request a password reset, you can safely ignore this email.
                </p>

                <p style="margin:0; font-size:15px; line-height:1.6;">
                  Best regards,<br />
                  <strong>Dee Softwork Team</strong>
                </p>
              </td>
            </tr>

          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
`

      };

      const result = await this.sendMail(mailOptions);
      console.log(`✅ Password reset email sent to: ${user.email}`);
      return result;
    } catch (error) {
      console.error('❌ Failed to send password reset email:', error.message);
      throw error;
    }
  }

  async sendInviteEmail(data) {
  try {
    const mailOptions = {
      from: `"Dee Softwork" <${process.env.SMTP_FROM}>`,
      to: data.email,
      subject: "You've been invited to Dee Softwork",
html: `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>You’re Invited</title>
  </head>
  <body style="margin:0; padding:0; background-color:#f5f5f5;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f5f5f5; padding:20px 0;">
      <tr>
        <td align="center">
          <table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px; background-color:#ffffff; border-radius:8px; overflow:hidden; font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif;">

            <!-- Header / Logo -->
            <tr>
              <td align="center" style="padding:32px 20px;">
                <!-- Replace with your logo URL -->
                <img
                  src="https://app.deesoftwork.com.ng/logo.png"
                  alt="Dee Softwork Logo"
                  width="120"
                  style="display:block; max-width:120px; height:auto;"
                />
              </td>
            </tr>

            <!-- Accent Divider -->
            <tr>
              <td style="height:4px; background-color:#d91f22;"></td>
            </tr>

            <!-- Content -->
            <tr>
              <td style="padding:40px 32px; color:#111111;">
                <h2 style="margin:0 0 16px 0; font-size:24px; font-weight:600; color:#d91f22;">
                  You’ve Been Invited
                </h2>

                <p style="margin:0 0 16px 0; font-size:16px; line-height:1.6;">
                  ${data.inviterName} (<a href="mailto:${data.inviterEmail}" style="color:#d91f22; text-decoration:none;">${data.inviterEmail}</a>)
                  has invited you to join their Deelad Place team.
                </p>

                <p style="margin:0 0 24px 0; font-size:16px; line-height:1.6;">
                  Click the button below to create your account and get started.
                </p>

                <!-- CTA -->
                <table cellpadding="0" cellspacing="0" style="margin:32px 0;">
                  <tr>
                    <td align="center">
                      <a
                        href="${data.inviteLink}"
                        style="
                          display:inline-block;
                          padding:14px 28px;
                          font-size:16px;
                          font-weight:500;
                          color:#ffffff;
                          background-color:#d91f22;
                          text-decoration:none;
                          border-radius:6px;
                        "
                      >
                        Accept Invitation
                      </a>
                    </td>
                  </tr>
                </table>

                <p style="margin:0 0 24px 0; font-size:15px; line-height:1.6; color:#444444;">
                  If you weren’t expecting this invitation, you can safely ignore this email.
                </p>

                <p style="margin:0; font-size:15px; line-height:1.6;">
                  Best regards,<br />
                  <strong>Dee Softwork Team</strong>
                </p>
              </td>
            </tr>

          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
`
,
    };

    const result = await this.sendMail(mailOptions);
    console.log(`📨 Invite email sent to: ${data.email}`);
    return result;
  } catch (error) {
    console.error('❌ Failed to send invite email:', error.message);
  }
}

async sendInviteAcceptedEmail(data) {
  try {
    const mailOptions = {
      from: `"Dee Softwork" <${process.env.SMTP_FROM}>`,
      to: data.email,
      subject: "Welcome to Dee Softwork!",
html: `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Account Activated</title>
  </head>
  <body style="margin:0; padding:0; background-color:#f5f5f5;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f5f5f5; padding:20px 0;">
      <tr>
        <td align="center">
          <table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px; background-color:#ffffff; border-radius:8px; overflow:hidden; font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif;">

            <!-- Header / Logo -->
            <tr>
              <td align="center" style="padding:32px 20px;">
                <!-- Replace with your logo URL -->
                <img
                  src="https://app.deesoftwork.com.ng/logo.png"
                  alt="Dee Softwork Logo"
                  width="120"
                  style="display:block; max-width:120px; height:auto;"
                />
              </td>
            </tr>

            <!-- Accent Divider -->
            <tr>
              <td style="height:4px; background-color:#d91f22;"></td>
            </tr>

            <!-- Content -->
            <tr>
              <td style="padding:40px 32px; color:#111111;">
                <h2 style="margin:0 0 16px 0; font-size:24px; font-weight:600; color:#d91f22;">
                  Welcome to Deelad Place
                </h2>

                <p style="margin:0 0 16px 0; font-size:16px; line-height:1.6;">
                  Hello ${data.name || data.email},
                </p>

                <p style="margin:0 0 24px 0; font-size:16px; line-height:1.6;">
                  Your account has been successfully activated under tenant ID
                  <strong>${data.tenantId}</strong>.
                </p>

                <p style="margin:0 0 24px 0; font-size:16px; line-height:1.6;">
                  You can now log in and start using the system.
                </p>

                <!-- CTA -->
                <table cellpadding="0" cellspacing="0" style="margin:32px 0;">
                  <tr>
                    <td align="center">
                      <a
                        href="${process.env.CLIENT_URL}/login"
                        style="
                          display:inline-block;
                          padding:14px 28px;
                          font-size:16px;
                          font-weight:500;
                          color:#ffffff;
                          background-color:#d91f22;
                          text-decoration:none;
                          border-radius:6px;
                        "
                      >
                        Log In Now
                      </a>
                    </td>
                  </tr>
                </table>

                <p style="margin:0; font-size:15px; line-height:1.6;">
                  Best regards,<br />
                  <strong>Dee Softwork Team</strong>
                </p>
              </td>
            </tr>

          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
`
,
    };

    const result = await this.sendMail(mailOptions);
    console.log(`📨 Invite acceptance email sent to: ${data.email}`);
    return result;
  } catch (error) {
    console.error('❌ Failed to send invite acceptance email:', error.message);
  }
}


  async sendSubscriptionPaymentFailed(user, planType) {
  try {
    const mailOptions = {
      from: `"Dee Softwork" <${process.env.SMTP_FROM}>`,
      to: user.email,
      subject: 'Subscription Payment Failed',
      html: `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Payment Failed</title>
  </head>
  <body style="margin:0; padding:0; background-color:#f5f5f5;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f5f5f5; padding:20px 0;">
      <tr>
        <td align="center">
          <table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px; background-color:#ffffff; border-radius:8px; overflow:hidden; font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif;">

            <!-- Header / Logo -->
            <tr>
              <td align="center" style="padding:32px 20px;">
                <!-- Replace with your logo URL -->
                <img
                  src="https://app.deesoftwork.com.ng/logo.png"
                  alt="Dee Softwork Logo"
                  width="120"
                  style="display:block; max-width:120px; height:auto;"
                />
              </td>
            </tr>

            <!-- Accent Divider -->
            <tr>
              <td style="height:4px; background-color:#d91f22;"></td>
            </tr>

            <!-- Content -->
            <tr>
              <td style="padding:40px 32px; color:#111111;">
                <h2 style="margin:0 0 16px 0; font-size:24px; font-weight:600; color:#d91f22;">
                  Payment Failed
                </h2>

                <p style="margin:0 0 16px 0; font-size:16px; line-height:1.6;">
                  Hello ${user.name},
                </p>

                <p style="margin:0 0 24px 0; font-size:16px; line-height:1.6;">
                  We attempted to process your payment for the
                  <strong>${planType}</strong> subscription plan, but the transaction was unsuccessful.
                </p>

                <p style="margin:0 0 24px 0; font-size:16px; line-height:1.6;">
                  To avoid any interruption to your service, please update your payment details.
                </p>

                <!-- CTA -->
                <table cellpadding="0" cellspacing="0" style="margin:32px 0;">
                  <tr>
                    <td align="center">
                      <a
                        href="${process.env.CLIENT_URL}/account/billing"
                        style="
                          display:inline-block;
                          padding:14px 28px;
                          font-size:16px;
                          font-weight:500;
                          color:#ffffff;
                          background-color:#d91f22;
                          text-decoration:none;
                          border-radius:6px;
                        "
                      >
                        Update Payment Method
                      </a>
                    </td>
                  </tr>
                </table>

                <p style="margin:0 0 24px 0; font-size:15px; line-height:1.6; color:#444444;">
                  If you believe this is an error, please contact our support team as soon as possible.
                </p>

                <p style="margin:0; font-size:15px; line-height:1.6;">
                  Best regards,<br />
                  <strong>Dee Softwork Team</strong>
                </p>
              </td>
            </tr>

          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
`

    };

    const result = await this.sendMail(mailOptions);
    console.log(`❌ Subscription payment failed email sent to: ${user.email}`);
    return result;
  } catch (error) {
    console.error('❌ Failed to send subscription payment failed email:', error.message);
    throw error;
  }
}


  async sendSubscriptionSuccessEmail(user, planType) {
  try {
    const mailOptions = {
      from: `"Dee Softwork" <${process.env.SMTP_FROM}>`,
      to: user.email,
      subject: 'Subscription Activated!',
html: `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Subscription Activated</title>
  </head>
  <body style="margin:0; padding:0; background-color:#f5f5f5;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f5f5f5; padding:20px 0;">
      <tr>
        <td align="center">
          <table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px; background-color:#ffffff; border-radius:8px; overflow:hidden; font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif;">

            <!-- Header / Logo -->
            <tr>
              <td align="center" style="padding:32px 20px;">
                <!-- Replace with your logo URL -->
                <img
                  src="https://app.deesoftwork.com.ng/logo.png"
                  alt="Dee Softwork Logo"
                  width="120"
                  style="display:block; max-width:120px; height:auto;"
                />
              </td>
            </tr>

            <!-- Accent Divider -->
            <tr>
              <td style="height:4px; background-color:#d91f22;"></td>
            </tr>

            <!-- Content -->
            <tr>
              <td style="padding:40px 32px; color:#111111;">
                <h2 style="margin:0 0 16px 0; font-size:24px; font-weight:600; color:#d91f22;">
                  Subscription Activated
                </h2>

                <p style="margin:0 0 16px 0; font-size:16px; line-height:1.6;">
                  Hello ${user.name},
                </p>

                <p style="margin:0 0 24px 0; font-size:16px; line-height:1.6;">
                  Your subscription for the <strong>${planType}</strong> plan has been successfully activated.
                </p>

                <p style="margin:0 0 32px 0; font-size:16px; line-height:1.6;">
                  You will be billed automatically according to your plan interval.
                </p>

                <p style="margin:0; font-size:15px; line-height:1.6;">
                  Thank you for choosing Deelad Place.<br /><br />
                  Best regards,<br />
                  <strong>Dee Softwork Team</strong>
                </p>
              </td>
            </tr>

          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
`
,
    };

    const result = await this.sendMail(mailOptions);
    console.log(`✅ Subscription success email sent to: ${user.email}`);
    return result;
  } catch (error) {
    console.error('❌ Failed to send subscription success email:', error.message);
    throw error;
  }
}


  async sendPasswordResetConfirmation(user) {
    try {
      const mailOptions = {
        from: `"Dee Softwork" <${process.env.SMTP_FROM}>`,
        to: user.email,
        subject: 'Password Reset Successful - Dee Softwork',
        html: `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Password Reset Successful</title>
  </head>
  <body style="margin:0; padding:0; background-color:#f5f5f5;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f5f5f5; padding:20px 0;">
      <tr>
        <td align="center">
          <table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px; background-color:#ffffff; border-radius:8px; overflow:hidden; font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif;">

            <!-- Header / Logo -->
            <tr>
              <td align="center" style="padding:32px 20px;">
                <!-- Replace with your logo URL -->
                <img
                  src="https://app.deesoftwork.com.ng/logo.png"
                  alt="Dee Softwork Logo"
                  width="120"
                  style="display:block; max-width:120px; height:auto;"
                />
              </td>
            </tr>

            <!-- Accent Divider -->
            <tr>
              <td style="height:4px; background-color:#d91f22;"></td>
            </tr>

            <!-- Content -->
            <tr>
              <td style="padding:40px 32px; color:#111111;">
                <h2 style="margin:0 0 16px 0; font-size:24px; font-weight:600; color:#d91f22;">
                  Password Reset Successful
                </h2>

                <p style="margin:0 0 16px 0; font-size:16px; line-height:1.6;">
                  Hello ${user.name},
                </p>

                <p style="margin:0 0 24px 0; font-size:16px; line-height:1.6;">
                  Your Deelad Place account password has been successfully reset.
                </p>

                <p style="margin:0 0 32px 0; font-size:15px; line-height:1.6; color:#444444;">
                  If you did not make this change, please contact our support team immediately.
                </p>

                <p style="margin:0; font-size:15px; line-height:1.6;">
                  Best regards,<br />
                  <strong>Dee Softwork Security Team</strong>
                </p>
              </td>
            </tr>

          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
`,
      };

      const result = await this.sendMail(mailOptions);
      console.log(`✅ Password reset confirmation sent to: ${user.email}`);
      return result;
    } catch (error) {
      console.error('❌ Failed to send password reset confirmation:', error.message);
      throw error;
    }
  }
}

module.exports = new EmailService();
