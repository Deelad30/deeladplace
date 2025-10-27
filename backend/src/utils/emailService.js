const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    this.transport = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: process.env.SMTP_PORT || 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  async sendWelcomeEmail(user) {
    const mailOptions = {
      from: `"Deelad Place" <${process.env.SMTP_FROM}>`,
      to: user.email,
      subject: 'Welcome to Deelad Place SaaS!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #22c55e;">Welcome to Deelad Place SaaS!</h2>
          <p>Hello ${user.name},</p>
          <p>Your account has been successfully created and you can now access the Deelad Place management system.</p>
          <p><strong>Account Details:</strong></p>
          <ul>
            <li>Email: ${user.email}</li>
            <li>Role: ${user.role}</li>
          </ul>
          <p>You can login to your account at: ${process.env.CLIENT_URL}/login</p>
          <br>
          <p>Best regards,<br>Deelad Place Team</p>
        </div>
      `,
    };

    return await this.transporter.sendMail(mailOptions);
  }

  async sendLoginNotification(user, loginTime) {
    const mailOptions = {
      from: `"Deelad Place" <${process.env.SMTP_FROM}>`,
      to: user.email,
      subject: 'New Login to Your Deelad Place Account',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #22c55e;">Security Notification</h2>
          <p>Hello ${user.name},</p>
          <p>There was a new login to your Deelad Place account.</p>
          <p><strong>Login Details:</strong></p>
          <ul>
            <li>Time: ${loginTime}</li>
            <li>Account: ${user.email}</li>
          </ul>
          <p>If this was you, you can ignore this email.</p>
          <p>If this wasn't you, please reset your password immediately.</p>
          <br>
          <p>Best regards,<br>Deelad Place Security Team</p>
        </div>
      `,
    };

    return await this.transporter.sendMail(mailOptions);
  }

  async sendPasswordResetEmail(user, resetToken) {
    const resetLink = `${process.env.CLIENT_URL}/reset-password?token=${resetToken}`;

    const mailOptions = {
      from: `"Deelad Place" <${process.env.SMTP_FROM}>`,
      to: user.email,
      subject: 'Reset Your Deelad Place Password',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #22c55e;">Password Reset Request</h2>
          <p>Hello ${user.name},</p>
          <p>You requested to reset your password. Click the button below to create a new password:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetLink}" style="background-color: #22c55e; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Reset Password
            </a>
          </div>
          <p>This link will expire in 1 hour for security reasons.</p>
          <p>If you didn't request this reset, please ignore this email.</p>
          <br>
          <p>Best regards,<br>Deelad Place Team</p>
        </div>
      `,
    };

    return await this.transporter.sendMail(mailOptions);
  }

  async sendPasswordResetConfirmation(user) {
    const mailOptions = {
      from: `"Deelad Place" <${process.env.SMTP_FROM}>`,
      to: user.email,
      subject: 'Password Reset Successful - Deelad Place',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #22c55e;">Password Reset Successful</h2>
          <p>Hello ${user.name},</p>
          <p>Your Deelad Place account password has been successfully reset.</p>
          <p>If you did not make this change, please contact our support team immediately.</p>
          <br>
          <p>Best regards,<br>Deelad Place Security Team</p>
        </div>
      `,
    };

    return await this.transporter.sendMail(mailOptions);
  }
}

module.exports = new EmailService();