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

// ========================================
// 🔔 ENHANCED PAYMENT REMINDER EMAIL
// ========================================
const sendPaymentReminderEmail = async (clientEmail, invoiceData, companyName, reminderType = 'after_due') => {
  const { invoiceNumber, clientName, total, currency, dueDate, daysUntilDue, daysOverdue, customMessage } = invoiceData;
  
  const currencySymbols = { RWF: 'RWF', KES: 'KES', NGN: 'NGN', XOF: 'XOF', XAF: 'XAF', CFA: 'CFA', USD: '$', EUR: '€', GBP: '£' };
  const symbol = currencySymbols[currency] || currency;
  
  // Format amount with commas
  const formattedTotal = total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const formattedDueDate = new Date(dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  
  // ========================================
  // CONFIGURE MESSAGE BASED ON REMINDER TYPE
  // ========================================
  let subject, headerColor, headerText, greeting, mainMessage, urgencyBox, actionText;
  
  if (reminderType === 'before_due') {
    // BEFORE DUE: Gentle heads-up
    const daysText = Math.abs(daysUntilDue) === 1 ? 'day' : 'days';
    subject = `Upcoming Payment: Invoice #${invoiceNumber}`;
    headerColor = '#059669'; // Green
    headerText = '💚 Friendly Reminder';
    greeting = `Hi ${clientName},`;
    mainMessage = `Just a friendly heads-up that invoice #${invoiceNumber} from <strong>${companyName}</strong> is due in <strong>${Math.abs(daysUntilDue)} ${daysText}</strong>.`;
    urgencyBox = `
      <div style="background-color: #d1fae5; border-left: 4px solid #059669; padding: 16px; margin: 20px 0; border-radius: 4px;">
        <p style="margin: 0; color: #047857; font-weight: 600;">📅 Due in ${Math.abs(daysUntilDue)} ${daysText} (${formattedDueDate})</p>
      </div>
    `;
    actionText = 'We wanted to give you a heads-up so you can plan your payment ahead of time.';
    
  } else if (reminderType === 'on_due') {
    // ON DUE DATE: Polite reminder
    subject = `Payment Due Today: Invoice #${invoiceNumber}`;
    headerColor = '#f59e0b'; // Amber
    headerText = '⏰ Payment Due Today';
    greeting = `Hi ${clientName},`;
    mainMessage = `This is a reminder that invoice #${invoiceNumber} from <strong>${companyName}</strong> is <strong>due today</strong>.`;
    urgencyBox = `
      <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 16px; margin: 20px 0; border-radius: 4px;">
        <p style="margin: 0; color: #92400e; font-weight: 600;">⚠️ Due Date: Today (${formattedDueDate})</p>
      </div>
    `;
    actionText = 'Please arrange payment today to avoid any late fees or service interruptions.';
    
  } else {
    // AFTER DUE: More urgent tone
    const daysText = daysOverdue === 1 ? 'day' : 'days';
    subject = `Payment Overdue: Invoice #${invoiceNumber}`;
    headerColor = '#dc2626'; // Red
    headerText = '🔴 Payment Overdue';
    greeting = `Hi ${clientName},`;
    mainMessage = `Invoice #${invoiceNumber} from <strong>${companyName}</strong> is now <strong>${daysOverdue} ${daysText} overdue</strong>.`;
    urgencyBox = `
      <div style="background-color: #fee2e2; border-left: 4px solid #dc2626; padding: 16px; margin: 20px 0; border-radius: 4px;">
        <p style="margin: 0; color: #991b1b; font-weight: 600;">❗ ${daysOverdue} ${daysText} overdue (Due: ${formattedDueDate})</p>
      </div>
    `;
    actionText = 'Please arrange payment as soon as possible to avoid any further complications.';
  }

  // ========================================
  // CUSTOM PAYMENT INSTRUCTIONS (if provided)
  // ========================================
  let customPaymentSection = '';
  if (customMessage?.paymentInstructions) {
    customPaymentSection = `
      <div style="background-color: #eff6ff; border-left: 4px solid #2563eb; padding: 16px; margin: 24px 0; border-radius: 4px;">
        <p style="margin: 0 0 8px 0; color: #1e40af; font-weight: 600; font-size: 14px;">💳 Payment Methods</p>
        <p style="margin: 0; color: #1e3a8a; font-size: 14px; white-space: pre-line; line-height: 1.6;">${customMessage.paymentInstructions}</p>
      </div>
    `;
  }

  let customContactSection = '';
  if (customMessage?.contactInfo) {
    customContactSection = `
      <p style="margin: 20px 0 0 0; color: #6b7280; font-size: 14px; line-height: 1.6;">
        <strong style="color: #374151;">Questions?</strong> ${customMessage.contactInfo}
      </p>
    `;
  }

  // ========================================
  // EMAIL HTML TEMPLATE
  // ========================================
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin: 0; padding: 0; background-color: #f3f4f6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3f4f6; padding: 20px 16px;">
        <tr>
          <td align="center">
            <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1); max-width: 100%;">
              
              <!-- HEADER -->
              <tr>
                <td style="background-color: ${headerColor}; padding: 24px; text-align: center;">
                  <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 700;">${headerText}</h1>
                </td>
              </tr>

              <!-- BODY -->
              <tr>
                <td style="padding: 32px 24px;">
                  <p style="margin: 0 0 16px 0; color: #111827; font-size: 16px; line-height: 1.6;">${greeting}</p>
                  
                  <p style="margin: 0 0 20px 0; color: #374151; font-size: 15px; line-height: 1.6;">${mainMessage}</p>
                  
                  ${urgencyBox}
                  
                  <!-- INVOICE DETAILS CARD -->
                  <div style="background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin: 24px 0;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Invoice Number</td>
                        <td style="padding: 8px 0; text-align: right; color: #111827; font-weight: 600; font-size: 14px;">#${invoiceNumber}</td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Amount Due</td>
                        <td style="padding: 8px 0; text-align: right; color: #2563eb; font-weight: 700; font-size: 18px;">${symbol} ${formattedTotal}</td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Due Date</td>
                        <td style="padding: 8px 0; text-align: right; color: #111827; font-weight: 600; font-size: 14px;">${formattedDueDate}</td>
                      </tr>
                    </table>
                  </div>
                  
                  <p style="margin: 24px 0 16px 0; color: #374151; font-size: 15px; line-height: 1.6;">${actionText}</p>
                  
                  ${customPaymentSection}
                  
                  <p style="margin: 16px 0; color: #6b7280; font-size: 14px; line-height: 1.6;">If you've already made this payment, please disregard this reminder.</p>
                  
                  ${customContactSection}
                  
                  <p style="margin: 32px 0 0 0; color: #374151; font-size: 15px; line-height: 1.6;">Thank you for your business!</p>
                  <p style="margin: 4px 0 0 0; color: #6b7280; font-size: 14px;"><strong>${companyName}</strong></p>
                </td>
              </tr>

              <!-- FOOTER -->
              <tr>
                <td style="background-color: #f9fafb; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb;">
                  <p style="margin: 0; color: #9ca3af; font-size: 12px; line-height: 1.5;">
                    This is an automated payment reminder sent via <span style="color: #2563eb; font-weight: 600;">BillKazi</span>
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
  
  return sendEmail(clientEmail, subject, html);
};

const sendInvoiceEmail = async (clientEmail, invoiceData, companyData, shareUrl) => {
  const { invoiceNumber, clientName, total, currency, dueDate, items, subtotal, tax, discount, taxRate } = invoiceData;
  
  const currencySymbols = { RWF: 'RWF', KES: 'KES', NGN: 'NGN', CFA: 'CFA' };
  const symbol = currencySymbols[currency] || currency;
  
  const companyName = companyData?.companyName || 'BillKazi User';
  const companyEmail = companyData?.contactEmail || '';
  
  // Format amounts
  const formatAmount = (amount) => {
    return amount.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  // Calculate net amount and VAT
  const netAmount = total / (1 + (taxRate || 18) / 100);
  const calculatedTax = total - netAmount;
  
  // Build items table (SIMPLIFIED for mobile - removed rate column)
  const itemsHtml = items.map(item => `
    <tr>
      <td style="padding: 12px 8px; border-bottom: 1px solid #f3f4f6;">
        <p style="margin: 0; color: #111827; font-size: 14px; font-weight: 500;">${item.description}</p>
      </td>
      <td style="padding: 12px 8px; border-bottom: 1px solid #f3f4f6; text-align: center; color: #6b7280; font-size: 14px;">${item.quantity}</td>
      <td style="padding: 12px 8px; border-bottom: 1px solid #f3f4f6; text-align: right; color: #111827; font-size: 14px; font-weight: 600;">${symbol} ${formatAmount(item.quantity * item.unitPrice)}</td>
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
          .container { width: 100% !important; border-radius: 0 !important; }
          .padding { padding: 20px !important; }
          .header-title { font-size: 22px !important; }
          .total-amount { font-size: 24px !important; }
          .items-table th:nth-child(2),
          .items-table td:nth-child(2) { display: none !important; }
          .mobile-stack { display: block !important; width: 100% !important; padding: 0 !important; margin-bottom: 16px !important; }
        }
      </style>
    </head>
    <body style="margin: 0; padding: 0; background-color: #f3f4f6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3f4f6; padding: 20px 16px;">
        <tr>
          <td align="center">
            <table class="container" width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1); max-width: 100%;">
              
              <!-- HEADER: Blue with Invoice # and Total -->
              <tr>
                <td style="background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); padding: 24px;" class="padding">
                  <table width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                      <td style="vertical-align: middle;">
                        <h1 class="header-title" style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 700;">INVOICE</h1>
                        <p style="margin: 4px 0 0 0; color: rgba(255,255,255,0.9); font-size: 14px;">#${invoiceNumber}</p>
                      </td>
                      <td align="right" style="vertical-align: middle;">
                        <p style="margin: 0; color: rgba(255,255,255,0.8); font-size: 11px; text-transform: uppercase;">Total</p>
                        <p class="total-amount" style="margin: 2px 0 0 0; color: #ffffff; font-size: 28px; font-weight: 700; white-space: nowrap;">${symbol} ${formatAmount(total)}</p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

              <!-- DUE DATE (if exists) -->
              ${dueDate ? `
              <tr>
                <td style="background-color: #fef3c7; padding: 12px 24px;" class="padding">
                  <p style="margin: 0; color: #92400e; font-size: 13px; font-weight: 600;">
                    Due: ${new Date(dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </p>
                </td>
              </tr>
              ` : ''}

              <!-- BILL TO & FROM (Compact) -->
              <tr>
                <td style="padding: 24px;" class="padding">
                  <table width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                      <td class="mobile-stack" style="vertical-align: top; width: 50%; padding-right: 12px;">
                        <p style="margin: 0 0 4px 0; color: #9ca3af; font-size: 10px; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600;">From</p>
                        <p style="margin: 0; color: #111827; font-size: 15px; font-weight: 700;">${companyName}</p>
                        ${companyEmail ? `<p style="margin: 2px 0 0 0; color: #6b7280; font-size: 13px;">${companyEmail}</p>` : ''}
                      </td>
                      <td class="mobile-stack" style="vertical-align: top; width: 50%; padding-left: 12px;">
                        <p style="margin: 0 0 4px 0; color: #9ca3af; font-size: 10px; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600;">Bill To</p>
                        <p style="margin: 0; color: #111827; font-size: 15px; font-weight: 700;">${clientName}</p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

              <!-- ITEMS TABLE (Simplified - 3 columns on desktop, 2 on mobile) -->
              <tr>
                <td style="padding: 0 24px 20px 24px;" class="padding">
                  <table width="100%" cellpadding="0" cellspacing="0" class="items-table">
                    <thead>
                      <tr>
                        <th style="padding: 10px 8px; border-bottom: 2px solid #e5e7eb; text-align: left; color: #6b7280; font-size: 11px; font-weight: 600; text-transform: uppercase;">Item</th>
                        <th style="padding: 10px 8px; border-bottom: 2px solid #e5e7eb; text-align: center; color: #6b7280; font-size: 11px; font-weight: 600; text-transform: uppercase;">Qty</th>
                        <th style="padding: 10px 8px; border-bottom: 2px solid #e5e7eb; text-align: right; color: #6b7280; font-size: 11px; font-weight: 600; text-transform: uppercase;">Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${itemsHtml}
                    </tbody>
                  </table>
                </td>
              </tr>

              <!-- TOTALS (Cleaner, less labels) -->
              <tr>
                <td style="padding: 0 24px 24px 24px;" class="padding">
                  <table width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                      <td style="width: 55%;"></td>
                      <td style="width: 45%;">
                        
                        ${discount > 0 ? `
                        <!-- Show discount if applicable -->
                        <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 6px;">
                          <tr>
                            <td style="padding: 6px 0; color: #9ca3af; font-size: 13px;">Subtotal</td>
                            <td style="padding: 6px 0; text-align: right; color: #6b7280; font-size: 13px;">${symbol} ${formatAmount(subtotal)}</td>
                          </tr>
                          <tr>
                            <td style="padding: 6px 0; color: #9ca3af; font-size: 13px;">Discount</td>
                            <td style="padding: 6px 0; text-align: right; color: #ef4444; font-size: 13px;">-${symbol} ${formatAmount(discount)}</td>
                          </tr>
                        </table>
                        ` : ''}

                        <!-- Tax Breakdown (compact) -->
                        <table width="100%" cellpadding="0" cellspacing="0" style="border-top: 1px solid #e5e7eb; padding-top: 8px; margin-top: 8px;">
                          <tr>
                            <td style="padding: 4px 0; color: #9ca3af; font-size: 12px;">Net (excl. VAT)</td>
                            <td style="padding: 4px 0; text-align: right; color: #6b7280; font-size: 12px;">${symbol} ${formatAmount(netAmount)}</td>
                          </tr>
                          <tr>
                            <td style="padding: 4px 0; color: #9ca3af; font-size: 12px;">VAT ${taxRate || 18}%</td>
                            <td style="padding: 4px 0; text-align: right; color: #6b7280; font-size: 12px;">${symbol} ${formatAmount(calculatedTax)}</td>
                          </tr>
                        </table>

                        <!-- TOTAL (Big blue box) -->
                        <table width="100%" cellpadding="0" cellspacing="0" style="background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); border-radius: 8px; margin-top: 12px; padding: 12px;">
                          <tr>
                            <td style="color: rgba(255,255,255,0.9); font-size: 13px; font-weight: 600; text-transform: uppercase;">Total</td>
                            <td style="text-align: right; color: #ffffff; font-size: 20px; font-weight: 700;">${symbol} ${formatAmount(total)}</td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

              ${shareUrl ? `
              <!-- VIEW ONLINE BUTTON -->
              <tr>
                <td style="padding: 0 24px 24px 24px; text-align: center;" class="padding">
                  <a href="${shareUrl}" style="display: inline-block; background-color: #2563eb; color: #ffffff; padding: 12px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 14px;">View Online</a>
                </td>
              </tr>
              ` : ''}

              <!-- FOOTER -->
              <tr>
                <td style="background-color: #f9fafb; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb;" class="padding">
                  <p style="margin: 0; color: #6b7280; font-size: 13px;">Thank you for your business!</p>
                  <p style="margin: 6px 0 0 0; color: #9ca3af; font-size: 11px;">
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