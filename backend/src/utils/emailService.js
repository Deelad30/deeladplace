const nodemailer = require("nodemailer");
const { Resend } = require("resend");
const logger = require("./logger");
const templates = require("./emailTemplates");
require("dotenv").config();

class EmailService {
  constructor() {
    if (process.env.NODE_ENV === "production" && process.env.RESEND_API_KEY) {
      this.client = new Resend(process.env.RESEND_API_KEY);
      logger.info("Email service initialized with Resend (production)");
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
      logger.info(`Email service initialized with SMTP (${process.env.SMTP_HOST || 'local'})`);
    }
  }

  async sendMail({ to, subject, html, from }) {
    const sender = from || process.env.SMTP_FROM || '"Dee Softwork" <no-reply@deesoftwork.com.ng>';
    
    try {
      if (this.client) {
        // Production: Resend
        const result = await this.client.emails.send({
          from: sender,
          to,
          subject,
          html,
        });
        logger.info(`Email sent to ${to} via Resend`, { subject });
        return result;
      } else {
        // Development/Staging: SMTP
        const result = await this.transporter.sendMail({
          from: sender,
          to,
          subject,
          html,
        });
        logger.info(`Email sent to ${to} via SMTP`, { subject });
        return result;
      }
    } catch (error) {
      logger.error('Failed to send email', { error: error.message, to, subject });
      throw error;
    }
  }

  async sendWelcomeEmail(user) {
    const html = templates.welcomeEmail(user, `${process.env.CLIENT_URL}/login`);
    return this.sendMail({
      to: user.email,
      subject: 'Welcome to DeeSoftwork!',
      html
    });
  }

  async sendLoginNotification(user, loginTime) {
    const html = templates.loginNotification(user, loginTime, `${process.env.CLIENT_URL}/reset-password`);
    return this.sendMail({
      to: user.email,
      subject: 'Security Alert: New Login detected',
      html
    });
  }

  async sendPasswordResetEmail(user, resetToken) {
    const resetLink = `${process.env.CLIENT_URL}/reset-password?token=${resetToken}`;
    const html = templates.passwordResetEmail(user, resetLink);
    return this.sendMail({
      to: user.email,
      subject: 'Reset Your Password',
      html
    });
  }

  async sendPasswordResetConfirmation(user) {
    const html = templates.passwordResetConfirmation(user);
    return this.sendMail({
      to: user.email,
      subject: 'Password Reset Successful',
      html
    });
  }

  async sendInviteEmail(data) {
    const html = templates.inviteEmail(data);
    return this.sendMail({
      to: data.email,
      subject: "You've been invited to join team",
      html
    });
  }

  async sendInviteAcceptedEmail(data) {
    const html = templates.inviteAcceptedEmail(data);
    return this.sendMail({
      to: data.email,
      subject: 'Welcome to the team!',
      html
    });
  }

  async sendSubscriptionPaymentFailed(user, planType) {
    const html = templates.subscriptionPaymentFailed(user, planType);
    return this.sendMail({
      to: user.email,
      subject: 'Attention: Subscription Payment Failed',
      html
    });
  }

  async sendSubscriptionSuccessEmail(user, planType) {
    const html = templates.subscriptionSuccessEmail(user, planType);
    return this.sendMail({
      to: user.email,
      subject: 'Subscription Activated - Welcome aboard!',
      html
    });
  }

  async sendLowStockAlert(user, item, currentStock, minStock) {
    const html = templates.lowStockEmail(user, item, currentStock, minStock);
    return this.sendMail({
      to: user.email,
      subject: `Low Stock Alert: ${item.name}`,
      html
    });
  }

  async sendMarginAlert(user, data) {
    const html = templates.marginAlertEmail(user, data);
    return this.sendMail({
      to: user.email,
      subject: `Margin Alert: ${data.product_name}`,
      html
    });
  }
}

module.exports = new EmailService();
