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
  const { invoiceNumber, clientName, total, currency, dueDate, items, subtotal, tax, discount } = invoiceData;
  
  const currencySymbols = { RWF: 'RWF', KES: 'KES', NGN: 'NGN', CFA: 'CFA' };
  const symbol = currencySymbols[currency] || currency;
  
  const companyName = companyData?.companyName || 'BillKazi User';
  const companyEmail = companyData?.contactEmail || '';
  const companyPhone = companyData?.phone || '';
  const companyAddress = companyData?.address || '';
  const companyCity = companyData?.city || '';
  const companyCountry = companyData?.country || '';
  
  // Build items table
  const itemsHtml = items.map(item => `
    <tr>
      <td style="padding: 12px 16px; border-bottom: 1px solid #e5e7eb; color: #374151;">${item.description}</td>
      <td style="padding: 12px 16px; border-bottom: 1px solid #e5e7eb; text-align: center; color: #6b7280;">${item.quantity}</td>
      <td style="padding: 12px 16px; border-bottom: 1px solid #e5e7eb; text-align: right; color: #6b7280;">${symbol} ${item.unitPrice.toLocaleString()}</td>
      <td style="padding: 12px 16px; border-bottom: 1px solid #e5e7eb; text-align: right; font-weight: 600; color: #111827;">${symbol} ${(item.quantity * item.unitPrice).toLocaleString()}</td>
    </tr>
  `).join('');

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin: 0; padding: 0; background-color: #f3f4f6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3f4f6; padding: 40px 20px;">
        <tr>
          <td align="center">
            <!-- Main Container -->
            <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
              
              <!-- Header -->
              <tr>
                <td style="background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); padding: 40px 40px 30px 40px;">
                  <table width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                      <td>
                        <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700; letter-spacing: -0.5px;">INVOICE</h1>
                        <p style="margin: 8px 0 0 0; color: rgba(255, 255, 255, 0.9); font-size: 16px;">#${invoiceNumber}</p>
                      </td>
                      <td align="right">
                        <div style="background-color: rgba(255, 255, 255, 0.15); backdrop-filter: blur(10px); padding: 12px 20px; border-radius: 8px; border: 1px solid rgba(255, 255, 255, 0.2);">
                          <p style="margin: 0; color: rgba(255, 255, 255, 0.8); font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px;">Amount Due</p>
                          <p style="margin: 4px 0 0 0; color: #ffffff; font-size: 24px; font-weight: 700;">${symbol} ${total.toLocaleString()}</p>
                        </div>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

              <!-- Company & Client Info -->
              <tr>
                <td style="padding: 40px 40px 30px 40px;">
                  <table width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                      <td style="vertical-align: top; width: 50%;">
                        <p style="margin: 0 0 4px 0; color: #6b7280; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600;">From</p>
                        <p style="margin: 0; color: #111827; font-size: 16px; font-weight: 700;">${companyName}</p>
                        ${companyEmail ? `<p style="margin: 4px 0 0 0; color: #6b7280; font-size: 14px;">${companyEmail}</p>` : ''}
                        ${companyPhone ? `<p style="margin: 2px 0 0 0; color: #6b7280; font-size: 14px;">${companyPhone}</p>` : ''}
                        ${companyAddress ? `<p style="margin: 8px 0 0 0; color: #6b7280; font-size: 14px; line-height: 1.5;">${companyAddress}${companyCity ? `<br>${companyCity}` : ''}${companyCountry ? `<br>${companyCountry}` : ''}</p>` : ''}
                      </td>
                      <td style="vertical-align: top; width: 50%; text-align: right;">
                        <p style="margin: 0 0 4px 0; color: #6b7280; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600;">Bill To</p>
                        <p style="margin: 0; color: #111827; font-size: 16px; font-weight: 700;">${clientName}</p>
                        <p style="margin: 4px 0 0 0; color: #6b7280; font-size: 14px;">${clientEmail}</p>
                        <div style="margin-top: 16px; padding: 12px; background-color: #fef3c7; border-left: 3px solid #f59e0b; border-radius: 4px;">
                          <p style="margin: 0; color: #92400e; font-size: 12px; font-weight: 600;">Due Date</p>
                          <p style="margin: 4px 0 0 0; color: #78350f; font-size: 14px; font-weight: 700;">${new Date(dueDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                        </div>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

              <!-- Items Table -->
              <tr>
                <td style="padding: 0 40px 40px 40px;">
                  <table width="100%" cellpadding="0" cellspacing="0" style="border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden;">
                    <thead>
                      <tr style="background-color: #f9fafb;">
                        <th style="padding: 14px 16px; text-align: left; font-size: 12px; font-weight: 700; color: #374151; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 2px solid #e5e7eb;">Description</th>
                        <th style="padding: 14px 16px; text-align: center; font-size: 12px; font-weight: 700; color: #374151; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 2px solid #e5e7eb;">Qty</th>
                        <th style="padding: 14px 16px; text-align: right; font-size: 12px; font-weight: 700; color: #374151; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 2px solid #e5e7eb;">Rate</th>
                        <th style="padding: 14px 16px; text-align: right; font-size: 12px; font-weight: 700; color: #374151; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 2px solid #e5e7eb;">Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${itemsHtml}
                    </tbody>
                  </table>

                  <!-- Totals -->
                  <table width="100%" cellpadding="0" cellspacing="0" style="margin-top: 24px;">
                    <tr>
                      <td width="60%"></td>
                      <td width="40%">
                        <table width="100%" cellpadding="0" cellspacing="0">
                          ${subtotal ? `
                          <tr>
                            <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Subtotal</td>
                            <td style="padding: 8px 0; text-align: right; color: #374151; font-size: 14px; font-weight: 600;">${symbol} ${subtotal.toLocaleString()}</td>
                          </tr>
                          ` : ''}
                          ${discount > 0 ? `
                          <tr>
                            <td style="padding: 8px 0; color: #059669; font-size: 14px;">Discount</td>
                            <td style="padding: 8px 0; text-align: right; color: #059669; font-size: 14px; font-weight: 600;">- ${symbol} ${discount.toLocaleString()}</td>
                          </tr>
                          ` : ''}
                          ${tax > 0 ? `
                          <tr>
                            <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Tax</td>
                            <td style="padding: 8px 0; text-align: right; color: #374151; font-size: 14px; font-weight: 600;">${symbol} ${tax.toLocaleString()}</td>
                          </tr>
                          ` : ''}
                          <tr>
                            <td colspan="2" style="padding-top: 12px; border-top: 2px solid #2563eb;"></td>
                          </tr>
                          <tr>
                            <td style="padding: 12px 0 0 0; color: #111827; font-size: 16px; font-weight: 700;">Total Due</td>
                            <td style="padding: 12px 0 0 0; text-align: right; color: #2563eb; font-size: 24px; font-weight: 700;">${symbol} ${total.toLocaleString()}</td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

              ${shareUrl ? `
              <!-- View Online Button -->
              <tr>
                <td style="padding: 0 40px 40px 40px; text-align: center;">
                  <a href="${shareUrl}" style="display: inline-block; background-color: #2563eb; color: #ffffff; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 14px; box-shadow: 0 2px 4px rgba(37, 99, 235, 0.2);">View Invoice Online</a>
                  <p style="margin: 12px 0 0 0; color: #9ca3af; font-size: 12px;">Or copy this link: <a href="${shareUrl}" style="color: #2563eb; text-decoration: none;">${shareUrl}</a></p>
                </td>
              </tr>
              ` : ''}

              <!-- Footer -->
              <tr>
                <td style="background-color: #f9fafb; padding: 30px 40px; border-top: 1px solid #e5e7eb;">
                  <p style="margin: 0 0 8px 0; color: #374151; font-size: 14px; font-weight: 600;">Questions about this invoice?</p>
                  <p style="margin: 0; color: #6b7280; font-size: 14px; line-height: 1.6;">
                    Contact ${companyName} at ${companyEmail || 'the email address on file'}${companyPhone ? ` or ${companyPhone}` : ''}.
                  </p>
                  <p style="margin: 20px 0 0 0; color: #9ca3af; font-size: 12px; text-align: center;">
                    This invoice was generated and sent via <strong style="color: #2563eb;">BillKazi</strong>
                  </p>
                </td>
              </tr>

            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
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