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
  const { invoiceNumber, clientName, total, currency, dueDate, items, subtotal, tax, discount, taxRate } = invoiceData;
  
  const currencySymbols = { RWF: 'RWF', KES: 'KES', NGN: 'NGN', CFA: 'CFA' };
  const symbol = currencySymbols[currency] || currency;
  
  const companyName = companyData?.companyName || 'BillKazi User';
  const companyEmail = companyData?.contactEmail || '';
  const companyPhone = companyData?.phone || '';
  const companyAddress = companyData?.address || '';
  const companyCity = companyData?.city || '';
  const companyCountry = companyData?.country || '';
  
  // Format amounts properly (no extra decimals)
  const formatAmount = (amount) => {
    return amount.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  // Calculate tax-inclusive breakdown (matching PDF)
  const netAmount = total / (1 + (taxRate || 18) / 100);
  const calculatedTax = total - netAmount;
  
  // Build items table
  const itemsHtml = items.map(item => `
    <tr>
      <td style="padding: 16px; border-bottom: 1px solid #e5e7eb;">
        <p style="margin: 0; color: #111827; font-size: 15px; font-weight: 500; line-height: 1.4;">${item.description}</p>
      </td>
      <td style="padding: 16px; border-bottom: 1px solid #e5e7eb; text-align: center; color: #6b7280; font-size: 15px;">${item.quantity}</td>
      <td style="padding: 16px; border-bottom: 1px solid #e5e7eb; text-align: right; color: #6b7280; font-size: 15px;">${symbol} ${formatAmount(item.unitPrice)}</td>
      <td style="padding: 16px; border-bottom: 1px solid #e5e7eb; text-align: right; color: #111827; font-size: 15px; font-weight: 600;">${symbol} ${formatAmount(item.quantity * item.unitPrice)}</td>
    </tr>
  `).join('');

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        @media only screen and (max-width: 600px) {
          .container {
            width: 100% !important;
            border-radius: 0 !important;
          }
          .padding-32 {
            padding: 20px !important;
          }
          .header-title {
            font-size: 24px !important;
          }
          .amount-bubble {
            padding: 10px 16px !important;
            margin-top: 16px !important;
            display: block !important;
          }
          .amount-bubble-text {
            font-size: 20px !important;
          }
          .info-table {
            display: block !important;
          }
          .info-table tr {
            display: block !important;
          }
          .info-table td {
            display: block !important;
            width: 100% !important;
            text-align: left !important;
            padding-bottom: 20px !important;
          }
          .items-table th,
          .items-table td {
            padding: 10px 8px !important;
            font-size: 13px !important;
          }
        }
      </style>
    </head>
    <body style="margin: 0; padding: 0; background-color: #f9fafb; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f9fafb; padding: 32px 16px;">
        <tr>
          <td align="center">
            <!-- Main Container -->
            <table class="container" width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08); max-width: 100%;">
              
              <!-- Header -->
              <tr>
                <td style="background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); padding: 32px;" class="padding-32">
                  <table width="100%" cellpadding="0" cellspacing="0" class="info-table">
                    <tr>
                      <td style="vertical-align: middle;">
                        <h1 class="header-title" style="margin: 0; color: #ffffff; font-size: 26px; font-weight: 700; letter-spacing: -0.5px;">INVOICE</h1>
                        <p style="margin: 6px 0 0 0; color: rgba(255, 255, 255, 0.9); font-size: 15px;">#${invoiceNumber}</p>
                      </td>
                      <td align="right" style="vertical-align: middle;">
                        <div class="amount-bubble" style="background-color: rgba(255, 255, 255, 0.15); backdrop-filter: blur(10px); padding: 12px 20px; border-radius: 8px; border: 1px solid rgba(255, 255, 255, 0.2); display: inline-block;">
                          <p style="margin: 0; color: rgba(255, 255, 255, 0.85); font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600;">Total Due</p>
                          <p class="amount-bubble-text" style="margin: 4px 0 0 0; color: #ffffff; font-size: 22px; font-weight: 700; white-space: nowrap;">${symbol} ${formatAmount(total)}</p>
                        </div>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

              <!-- Company & Client Info -->
              <tr>
                <td style="padding: 32px;" class="padding-32">
                  <table width="100%" cellpadding="0" cellspacing="0" class="info-table">
                    <tr>
                      <td style="vertical-align: top; width: 48%; padding-right: 16px;">
                        <p style="margin: 0 0 6px 0; color: #6b7280; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600;">From</p>
                        <p style="margin: 0; color: #111827; font-size: 16px; font-weight: 700; line-height: 1.4;">${companyName}</p>
                        ${companyEmail ? `<p style="margin: 6px 0 0 0; color: #6b7280; font-size: 14px; line-height: 1.5;">${companyEmail}</p>` : ''}
                        ${companyPhone ? `<p style="margin: 4px 0 0 0; color: #6b7280; font-size: 14px; line-height: 1.5;">${companyPhone}</p>` : ''}
                        ${companyAddress ? `<p style="margin: 6px 0 0 0; color: #6b7280; font-size: 14px; line-height: 1.5;">${companyAddress}${companyCity ? `<br>${companyCity}` : ''}${companyCountry ? `<br>${companyCountry}` : ''}</p>` : ''}
                      </td>
                      <td style="vertical-align: top; width: 48%; padding-left: 16px;">
                        <p style="margin: 0 0 6px 0; color: #6b7280; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600;">Bill To</p>
                        <p style="margin: 0; color: #111827; font-size: 16px; font-weight: 700; line-height: 1.4;">${clientName}</p>
                        ${clientEmail ? `<p style="margin: 6px 0 0 0; color: #6b7280; font-size: 14px; line-height: 1.5;">${clientEmail}</p>` : ''}
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

              <!-- Due Date -->
              ${dueDate ? `
              <tr>
                <td style="padding: 0 32px 24px 32px;" class="padding-32">
                  <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 12px 16px; border-radius: 6px;">
                    <p style="margin: 0; color: #92400e; font-size: 13px; font-weight: 600;">
                      <span style="text-transform: uppercase; letter-spacing: 0.3px; font-size: 11px;">Due Date:</span> 
                      <span style="margin-left: 8px; font-size: 14px;">${new Date(dueDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                    </p>
                  </div>
                </td>
              </tr>
              ` : ''}

              <!-- Items Table -->
              <tr>
                <td style="padding: 0 32px 24px 32px;" class="padding-32">
                  <table width="100%" cellpadding="0" cellspacing="0" class="items-table">
                    <thead>
                      <tr>
                        <th style="padding: 12px 16px; border-bottom: 2px solid #e5e7eb; text-align: left; color: #6b7280; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Description</th>
                        <th style="padding: 12px 16px; border-bottom: 2px solid #e5e7eb; text-align: center; color: #6b7280; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Qty</th>
                        <th style="padding: 12px 16px; border-bottom: 2px solid #e5e7eb; text-align: right; color: #6b7280; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Rate</th>
                        <th style="padding: 12px 16px; border-bottom: 2px solid #e5e7eb; text-align: right; color: #6b7280; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${itemsHtml}
                    </tbody>
                  </table>
                </td>
              </tr>

              <!-- Totals Section (Tax-Inclusive like PDF) -->
              <tr>
                <td style="padding: 0 32px 32px 32px;" class="padding-32">
                  <table width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                      <td style="padding: 0; width: 55%;"></td>
                      <td style="padding: 0; width: 45%;">
                        <!-- Items Total -->
                        <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 8px;">
                          <tr>
                            <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Items Total (incl. VAT)</td>
                            <td style="padding: 8px 0; text-align: right; color: #111827; font-size: 14px; font-weight: 600;">${symbol} ${formatAmount(subtotal)}</td>
                          </tr>
                        </table>

                        ${discount > 0 ? `
                        <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 8px;">
                          <tr>
                            <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Subtotal after discount</td>
                            <td style="padding: 8px 0; text-align: right; color: #111827; font-size: 14px; font-weight: 600;">${symbol} ${formatAmount(total)}</td>
                          </tr>
                        </table>
                        ` : ''}

                        <!-- Tax Breakdown -->
                        <table width="100%" cellpadding="0" cellspacing="0" style="border-top: 2px solid #e5e7eb; padding-top: 12px; margin-top: 12px;">
                          <tr>
                            <td style="padding: 6px 0; color: #6b7280; font-size: 13px;">Net Amount (excl. VAT)</td>
                            <td style="padding: 6px 0; text-align: right; color: #6b7280; font-size: 13px;">${symbol} ${formatAmount(netAmount)}</td>
                          </tr>
                          <tr>
                            <td style="padding: 6px 0; color: #6b7280; font-size: 13px;">VAT (${taxRate || 18}%)</td>
                            <td style="padding: 6px 0; text-align: right; color: #6b7280; font-size: 13px;">${symbol} ${formatAmount(calculatedTax)}</td>
                          </tr>
                        </table>

                        <!-- Total Payable -->
                        <table width="100%" cellpadding="0" cellspacing="0" style="background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); border-radius: 8px; margin-top: 16px; padding: 16px;">
                          <tr>
                            <td style="color: rgba(255, 255, 255, 0.9); font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Total Payable</td>
                            <td style="text-align: right; color: #ffffff; font-size: 20px; font-weight: 700;">${symbol} ${formatAmount(total)}</td>
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
                <td style="padding: 0 32px 32px 32px; text-align: center;" class="padding-32">
                  <a href="${shareUrl}" style="display: inline-block; background-color: #2563eb; color: #ffffff; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 14px; box-shadow: 0 2px 4px rgba(37, 99, 235, 0.2);">View Invoice Online</a>
                  <p style="margin: 12px 0 0 0; color: #9ca3af; font-size: 12px;">Or copy this link: <a href="${shareUrl}" style="color: #2563eb; text-decoration: none;">${shareUrl}</a></p>
                </td>
              </tr>
              ` : ''}

              <!-- Footer -->
              <tr>
                <td style="background-color: #f9fafb; padding: 24px 32px; text-align: center; border-top: 1px solid #e5e7eb;" class="padding-32">
                  <p style="margin: 0; color: #6b7280; font-size: 13px;">Thank you for your business!</p>
                  <p style="margin: 8px 0 0 0; color: #9ca3af; font-size: 12px;">
                    Powered by <span style="color: #2563eb; font-weight: 600;">BillKazi</span>
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