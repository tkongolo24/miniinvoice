const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendEmail = async (to, subject, html) => {
  try {
    await sgMail.send({
      to,
      from: 'noreply@billkazi.me',
      subject,
      html,
    });
    return true;
  } catch (error) {
    console.error('SendGrid error:', error);
    return false;
  }
};

const sendVerificationEmail = async (email, token) => {
  const verificationUrl = `https://billkazi.me/verify-email?token=${token}`;
  const html = `
    <h2>Welcome to BillKazi!</h2>
    <p>Please verify your email to activate your account.</p>
    <p><a href="${verificationUrl}" style="background-color: #2563eb; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Verify Email</a></p>
    <p>Or copy this link: ${verificationUrl}</p>
    <p>This link expires in 24 hours.</p>
  `;
  return sendEmail(email, 'Verify your BillKazi email', html);
};

const sendMagicLinkEmail = async (email, token) => {
  const magicUrl = `https://billkazi.me/magic-signin?token=${token}`;
  const html = `
    <h2>Sign in to BillKazi</h2>
    <p>Click the link below to sign in to your account:</p>
    <p><a href="${magicUrl}" style="background-color: #2563eb; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Sign In</a></p>
    <p>Or copy this link: ${magicUrl}</p>
    <p>This link expires in 24 hours.</p>
  `;
  return sendEmail(email, 'Sign in to BillKazi', html);
};

const sendPasswordResetEmail = async (email, token) => {
  const resetUrl = `https://billkazi.me/reset-password?token=${token}`;
  const html = `
    <h2>Reset Your Password</h2>
    <p>Click the link below to reset your password:</p>
    <p><a href="${resetUrl}" style="background-color: #2563eb; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Reset Password</a></p>
    <p>Or copy this link: ${resetUrl}</p>
    <p>This link expires in 24 hours.</p>
    <p>If you didn't request this, ignore this email.</p>
  `;
  return sendEmail(email, 'Reset Your BillKazi Password', html);
};

const sendPaymentReminderEmail = async (clientEmail, invoiceData, companyName) => {
  const { invoiceNumber, clientName, total, currency, dueDate, daysOverdue } = invoiceData;
  
  const currencySymbols = { RWF: 'RWF', KES: 'KES', NGN: 'NGN', CFA: 'CFA'};
  const symbol = currencySymbols[currency] || currency;
  
  const subject = daysOverdue > 0 
    ? `Payment Overdue: Invoice #${invoiceNumber}` 
    : `Payment Reminder: Invoice #${invoiceNumber}`;
  
  const urgencyText = daysOverdue > 0
    ? `<p style="color: #dc2626; font-weight: bold;">This invoice is ${daysOverdue} day${daysOverdue > 1 ? 's' : ''} overdue.</p>`
    : `<p>This invoice is due on ${new Date(dueDate).toLocaleDateString()}.</p>`;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background-color: #2563eb; padding: 20px; text-align: center;">
        <h1 style="color: white; margin: 0;">Payment Reminder</h1>
      </div>
      
      <div style="padding: 30px; background-color: #f9fafb;">
        <p>Hi ${clientName},</p>
        
        <p>This is a friendly reminder about your outstanding invoice from <strong>${companyName || 'us'}</strong>.</p>
        
        ${urgencyText}
        
        <div style="background-color: white; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin: 20px 0;">
          <table style="width: 100%;">
            <tr>
              <td style="padding: 8px 0; color: #6b7280;">Invoice Number:</td>
              <td style="padding: 8px 0; font-weight: bold; text-align: right;">#${invoiceNumber}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #6b7280;">Amount Due:</td>
              <td style="padding: 8px 0; font-weight: bold; text-align: right; color: #2563eb; font-size: 18px;">${symbol} ${total.toFixed(2)}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #6b7280;">Due Date:</td>
              <td style="padding: 8px 0; font-weight: bold; text-align: right;">${new Date(dueDate).toLocaleDateString()}</td>
            </tr>
          </table>
        </div>
        
        <p>Please arrange payment at your earliest convenience. If you've already made the payment, kindly disregard this reminder.</p>
        
        <p>If you have any questions about this invoice, please don't hesitate to reach out.</p>
        
        <p style="margin-top: 30px;">Thank you for your business!</p>
        
        <p style="color: #6b7280; font-size: 12px; margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
          This is an automated reminder sent via BillKazi.
        </p>
      </div>
    </div>
  `;
  
  return sendEmail(clientEmail, subject, html);
};

const sendInvoiceEmail = async (clientEmail, invoiceData, companyData, shareUrl) => {
  const { invoiceNumber, clientName, total, currency, dueDate, items } = invoiceData;
  
  const currencySymbols = { RWF: 'RWF', KES: 'KES', NGN: 'NGN', CFA: 'CFA' };
  const symbol = currencySymbols[currency] || currency;
  
  const companyName = companyData?.companyName || 'BillKazi User';
  const companyEmail = companyData?.contactEmail || '';
  const companyPhone = companyData?.phone || '';
  
  // Build items table
  const itemsHtml = items.map(item => `
    <tr>
      <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;">${item.description}</td>
      <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; text-align: center;">${item.quantity}</td>
      <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; text-align: right;">${symbol} ${item.unitPrice.toFixed(2)}</td>
      <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; text-align: right;">${symbol} ${(item.quantity * item.unitPrice).toFixed(2)}</td>
    </tr>
  `).join('');

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background-color: #2563eb; padding: 20px; text-align: center;">
        <h1 style="color: white; margin: 0;">Invoice</h1>
      </div>
      
      <div style="padding: 30px; background-color: #f9fafb;">
        <p>Hi ${clientName},</p>
        
        <p>Please find your invoice from <strong>${companyName}</strong> below.</p>
        
        <div style="background-color: white; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin: 20px 0;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 20px;">
            <div>
              <p style="margin: 0; color: #6b7280; font-size: 12px;">INVOICE NUMBER</p>
              <p style="margin: 5px 0 0 0; font-weight: bold; font-size: 18px;">#${invoiceNumber}</p>
            </div>
            <div style="text-align: right;">
              <p style="margin: 0; color: #6b7280; font-size: 12px;">DUE DATE</p>
              <p style="margin: 5px 0 0 0; font-weight: bold;">${new Date(dueDate).toLocaleDateString()}</p>
            </div>
          </div>
          
          <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
            <thead>
              <tr style="background-color: #f3f4f6;">
                <th style="padding: 10px; text-align: left; font-size: 12px; color: #6b7280;">DESCRIPTION</th>
                <th style="padding: 10px; text-align: center; font-size: 12px; color: #6b7280;">QTY</th>
                <th style="padding: 10px; text-align: right; font-size: 12px; color: #6b7280;">PRICE</th>
                <th style="padding: 10px; text-align: right; font-size: 12px; color: #6b7280;">TOTAL</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>
          
          <div style="margin-top: 20px; padding-top: 20px; border-top: 2px solid #2563eb;">
            <table style="width: 100%;">
              <tr>
                <td style="padding: 8px 0; font-weight: bold; font-size: 18px;">Total Due:</td>
                <td style="padding: 8px 0; font-weight: bold; text-align: right; color: #2563eb; font-size: 24px;">${symbol} ${total.toFixed(2)}</td>
              </tr>
            </table>
          </div>
        </div>
        
        ${shareUrl ? `
        <div style="text-align: center; margin: 30px 0;">
          <a href="${shareUrl}" style="background-color: #2563eb; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold;">View Invoice Online</a>
        </div>
        <p style="text-align: center; color: #6b7280; font-size: 12px;">Or copy this link: ${shareUrl}</p>
        ` : ''}
        
        <p>If you have any questions about this invoice, please contact us:</p>
        <p style="color: #6b7280;">
          ${companyName}<br>
          ${companyEmail ? `Email: ${companyEmail}<br>` : ''}
          ${companyPhone ? `Phone: ${companyPhone}` : ''}
        </p>
        
        <p style="margin-top: 30px;">Thank you for your business!</p>
        
        <p style="color: #6b7280; font-size: 12px; margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
          This invoice was sent via BillKazi.
        </p>
      </div>
    </div>
  `;
  
  return sendEmail(clientEmail, `Invoice #${invoiceNumber} from ${companyName}`, html);
};

module.exports = {
  sendVerificationEmail,
  sendMagicLinkEmail,
  sendPasswordResetEmail,
  sendPaymentReminderEmail,
  sendInvoiceEmail,
};