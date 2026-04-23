/**
 * Email templates for the application
 */

const baseStyles = `
  margin: 0;
  padding: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif;
`;

const brandColor = '#d91f22';

const layout = (content) => `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  </head>
  <body style="${baseStyles} background-color: #f5f5f5;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 20px 0;">
      <tr>
        <td align="center">
          <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; background-color: #ffffff; border-radius: 8px; overflow: hidden; ${baseStyles}">
            <tr>
              <td align="center" style="padding: 32px 20px; background-color: #ffffff;">
                <img src="https://app.deesoftwork.com.ng/logo.png" alt="Dee Softwork Logo" width="120" style="display: block; max-width: 120px; height: auto;" />
              </td>
            </tr>
            <tr>
              <td style="height: 4px; background-color: ${brandColor};"></td>
            </tr>
            <tr>
              <td style="padding: 40px 32px; color: #111111;">
                ${content}
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
`;

const button = (url, text) => `
  <table cellpadding="0" cellspacing="0" style="margin: 32px 0;">
    <tr>
      <td align="center">
        <a href="${url}" style="display: inline-block; padding: 14px 28px; font-size: 16px; font-weight: 500; color: #ffffff; background-color: ${brandColor}; text-decoration: none; border-radius: 6px;">
          ${text}
        </a>
      </td>
    </tr>
  </table>
`;

exports.welcomeEmail = (user, loginUrl) => layout(`
  <h2 style="margin: 0 0 16px 0; font-size: 24px; font-weight: 600; color: ${brandColor};">Welcome to DeeSoftwork SaaS</h2>
  <p style="margin: 0 0 16px 0; font-size: 16px; line-height: 1.6;">Hello ${user.name},</p>
  <p style="margin: 0 0 24px 0; font-size: 16px; line-height: 1.6;">Your account has been successfully created. You now have access to the DeeSoftwork management system.</p>
  <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 24px;">
    <tr><td style="font-size: 16px; line-height: 1.6;"><strong>Account Details</strong></td></tr>
    <tr>
      <td style="padding-top: 8px; font-size: 15px; line-height: 1.6;">
        Email: ${user.email}<br />
        Registration Date: ${new Date().toLocaleDateString()}
      </td>
    </tr>
  </table>
  ${button(loginUrl, 'Log in to your account')}
  <p style="margin: 0; font-size: 15px; line-height: 1.6;">Best regards,<br /><strong>Dee Softwork Team</strong></p>
`);

exports.loginNotification = (user, loginTime, resetPasswordUrl) => layout(`
  <h2 style="margin: 0 0 16px 0; font-size: 24px; font-weight: 600; color: ${brandColor};">Security Notification</h2>
  <p style="margin: 0 0 16px 0; font-size: 16px; line-height: 1.6;">Hello ${user.name},</p>
  <p style="margin: 0 0 24px 0; font-size: 16px; line-height: 1.6;">We detected a new login to your DeeSoftwork account.</p>
  <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 24px;">
    <tr><td style="font-size: 16px; line-height: 1.6;"><strong>Login Details</strong></td></tr>
    <tr><td style="padding-top: 8px; font-size: 15px; line-height: 1.6;">Time: ${loginTime}<br />Account: ${user.email}</td></tr>
  </table>
  <p style="margin: 0 0 16px 0; font-size: 15px; line-height: 1.6; color: #444444;">If this was you, no action is needed. If you don’t recognize this activity, we recommend resetting your password.</p>
  ${button(resetPasswordUrl, 'Reset Password')}
  <p style="margin: 0; font-size: 15px; line-height: 1.6;">Best regards,<br /><strong>Dee Softwork Security Team</strong></p>
`);

exports.passwordResetEmail = (user, resetLink) => layout(`
  <h2 style="margin: 0 0 16px 0; font-size: 24px; font-weight: 600; color: ${brandColor};">Password Reset Request</h2>
  <p style="margin: 0 0 16px 0; font-size: 16px; line-height: 1.6;">Hello ${user.name},</p>
  <p style="margin: 0 0 24px 0; font-size: 16px; line-height: 1.6;">We received a request to reset your password. Click the button below to create a new one.</p>
  ${button(resetLink, 'Reset Password')}
  <p style="margin: 0 0 16px 0; font-size: 15px; line-height: 1.6; color: #444444;"><strong>This link will expire in 1 hour</strong>. If you didn’t request this, you can safely ignore this email.</p>
  <p style="margin: 0; font-size: 15px; line-height: 1.6;">Best regards,<br /><strong>Dee Softwork Team</strong></p>
`);

exports.passwordResetConfirmation = (user) => layout(`
  <h2 style="margin: 0 0 16px 0; font-size: 24px; font-weight: 600; color: ${brandColor};">Password Changed Successfully</h2>
  <p style="margin: 0 0 16px 0; font-size: 16px; line-height: 1.6;">Hello ${user.name},</p>
  <p style="margin: 0 0 24px 0; font-size: 16px; line-height: 1.6;">The password for your DeeSoftwork account has been successfully changed.</p>
  <p style="margin: 0 0 16px 0; font-size: 15px; line-height: 1.6; color: #444444;">If you did not make this change, please contact our support team immediately.</p>
  <p style="margin: 0; font-size: 15px; line-height: 1.6;">Best regards,<br /><strong>Dee Softwork Security Team</strong></p>
`);

exports.inviteEmail = (data) => layout(`
  <h2 style="margin: 0 0 16px 0; font-size: 24px; font-weight: 600; color: ${brandColor};">You’ve Been Invited</h2>
  <p style="margin: 0 0 16px 0; font-size: 16px; line-height: 1.6;">${data.inviterName} (${data.inviterEmail}) has invited you to join their DeeSoftwork team.</p>
  <p style="margin: 0 0 24px 0; font-size: 16px; line-height: 1.6;">Click the button below to create your account and get started.</p>
  ${button(data.inviteLink, 'Accept Invitation')}
  <p style="margin: 0; font-size: 15px; line-height: 1.6;">Best regards,<br /><strong>Dee Softwork Team</strong></p>
`);

exports.inviteAcceptedEmail = (data) => layout(`
  <h2 style="margin: 0 0 16px 0; font-size: 24px; font-weight: 600; color: ${brandColor};">Welcome to DeeSoftwork</h2>
  <p style="margin: 0 0 16px 0; font-size: 16px; line-height: 1.6;">Hello ${data.name || data.email},</p>
  <p style="margin: 0 0 24px 0; font-size: 16px; line-height: 1.6;">Your account has been successfully activated. You can now log in and start using the system.</p>
  ${button(`${process.env.CLIENT_URL}/login`, 'Log In Now')}
  <p style="margin: 0; font-size: 15px; line-height: 1.6;">Best regards,<br /><strong>Dee Softwork Team</strong></p>
`);

exports.subscriptionPaymentFailed = (user, planType) => layout(`
  <h2 style="margin: 0 0 16px 0; font-size: 24px; font-weight: 600; color: ${brandColor};">Payment Failed</h2>
  <p style="margin: 0 0 16px 0; font-size: 16px; line-height: 1.6;">Hello ${user.name},</p>
  <p style="margin: 0 0 24px 0; font-size: 16px; line-height: 1.6;">We attempted to process your payment for the <strong>${planType}</strong> plan, but it was unsuccessful.</p>
  <p style="margin: 0 0 24px 0; font-size: 16px; line-height: 1.6;">To avoid service interruption, please update your payment details.</p>
  ${button(`${process.env.CLIENT_URL}/account/billing`, 'Update Payment Method')}
  <p style="margin: 0; font-size: 15px; line-height: 1.6;">Best regards,<br /><strong>Dee Softwork Team</strong></p>
`);

exports.subscriptionSuccessEmail = (user, planType) => layout(`
  <h2 style="margin: 0 0 16px 0; font-size: 24px; font-weight: 600; color: ${brandColor};">Subscription Activated!</h2>
  <p style="margin: 0 0 16px 0; font-size: 16px; line-height: 1.6;">Hello ${user.name},</p>
  <p style="margin: 0 0 24px 0; font-size: 16px; line-height: 1.6;">Your subscription for the <strong>${planType}</strong> plan has been successfully activated.</p>
  <p style="margin: 0 0 32px 0; font-size: 16px; line-height: 1.6;">Thank you for choosing DeeSoftwork.</p>
  <p style="margin: 0; font-size: 15px; line-height: 1.6;">Best regards,<br /><strong>Dee Softwork Team</strong></p>
`);

exports.lowStockEmail = (user, item, currentStock, minStock) => layout(`
  <h2 style="margin: 0 0 16px 0; font-size: 24px; font-weight: 600; color: ${brandColor};">Low Stock Alert: ${item.name}</h2>
  <p style="margin: 0 0 16px 0; font-size: 16px; line-height: 1.6;">Hello ${user.name},</p>
  <p style="margin: 0 0 24px 0; font-size: 16px; line-height: 1.6;">This is an automated alert to inform you that the inventory level for <strong>${item.name}</strong> has dropped below the minimum threshold.</p>
  
  <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 24px; background: #fef2f2; border-radius: 8px; border: 1px solid #fee2e2;">
    <tr>
      <td style="padding: 16px;">
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td style="font-size: 14px; color: #7f1d1d; padding-bottom: 4px;">Current Stock</td>
            <td style="font-size: 14px; color: #7f1d1d; padding-bottom: 4px;">Minimum Level</td>
          </tr>
          <tr>
            <td style="font-size: 24px; font-weight: 700; color: #ef4444;">${currentStock} ${item.unit}</td>
            <td style="font-size: 24px; font-weight: 700; color: #991b1b;">${minStock} ${item.unit}</td>
          </tr>
        </table>
      </td>
    </tr>
  </table>

  <p style="margin: 0 0 16px 0; font-size: 15px; line-height: 1.6;">Please arrange for replenishment as soon as possible.</p>
  ${button(`${process.env.CLIENT_URL}/inventory`, 'View Inventory')}
  <p style="margin: 0; font-size: 15px; line-height: 1.6;">Best regards,<br /><strong>Dee Softwork Inventory System</strong></p>
`);

exports.marginAlertEmail = (user, data) => layout(`
  <h2 style="margin: 0 0 16px 0; font-size: 24px; font-weight: 600; color: ${brandColor};">Margin Alert: ${data.product_name}</h2>
  <p style="margin: 0 0 16px 0; font-size: 16px; line-height: 1.6;">Hello ${user.name},</p>
  <p style="margin: 0 0 24px 0; font-size: 16px; line-height: 1.6;">This is an automated alert to inform you that a change in material cost has affected the profit margin for <strong>${data.product_name}</strong>.</p>
  
  <div style="background: #f8fafc; padding: 20px; border-radius: 8px; border: 1px solid #e2e8f0; margin-bottom: 24px;">
    <p style="margin: 0 0 12px 0; font-size: 14px; color: #64748b;">Reason: Price change for <strong>${data.material_name}</strong></p>
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td style="padding-bottom: 8px; font-size: 14px; color: #64748b;">Previous Margin</td>
        <td style="padding-bottom: 8px; font-size: 14px; color: #64748b;">New Margin</td>
      </tr>
      <tr>
        <td style="font-size: 20px; font-weight: 700; color: #1e293b;">${data.old_margin}%</td>
        <td style="font-size: 20px; font-weight: 700; color: ${Number(data.new_margin) < Number(data.old_margin) ? '#ef4444' : '#22c55e'};">
          ${data.new_margin}%
          ${Number(data.new_margin) < Number(data.old_margin) ? ' ↓' : ' ↑'}
        </td>
      </tr>
    </table>
  </div>

  <p style="margin: 0 0 16px 0; font-size: 15px; line-height: 1.6;">The selling price has remained unchanged at your set value. You can review your pricing in the Profitability module.</p>
  ${button(`${process.env.CLIENT_URL}/reports/profitability`, 'View Profitability')}
  <p style="margin: 0; font-size: 15px; line-height: 1.6;">Best regards,<br /><strong>Dee Softwork Management System</strong></p>
`);
