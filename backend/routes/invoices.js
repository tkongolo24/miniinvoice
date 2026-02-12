const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Invoice = require('../models/invoice');
const Settings = require('../models/settings');
const User = require('../models/user'); 
const auth = require('../middleware/auth');
const crypto = require('crypto');
const { sendInvoiceEmail } = require('../services/emailService');
const { generateInvoiceNumber } = require('../utils/invoiceNumberGenerator'); 

// 🚀 PAYMENT REMINDERS: Get reminder history for an invoice
router.get('/:id/reminders', auth, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid invoice ID format' });
    }

    const invoice = await Invoice.findOne({
      _id: req.params.id,
      userId: req.userId
    });

    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }

    // Calculate next scheduled reminder
    let nextReminder = null;
    const now = new Date();
    const dueDate = new Date(invoice.dueDate);

    if (invoice.reminderSettings?.enabled && invoice.status !== 'paid') {
      const daysUntilDue = Math.ceil((dueDate - now) / (1000 * 60 * 60 * 24));
      
      // Check before due reminders
      if (invoice.reminderSettings.beforeDue) {
        for (const days of invoice.reminderSettings.beforeDue.sort((a, b) => b - a)) {
          const alreadySent = invoice.remindersSent.some(
            r => r.type === 'before_due' && r.daysOffset === -days
          );
          if (!alreadySent && daysUntilDue <= days && daysUntilDue > 0) {
            nextReminder = {
              type: 'before_due',
              daysOffset: -days,
              scheduledDate: new Date(dueDate.getTime() - days * 24 * 60 * 60 * 1000),
              description: `${days} days before due date`
            };
            break;
          }
        }
      }

      // Check on due reminder
      if (!nextReminder && invoice.reminderSettings.onDue) {
        const alreadySent = invoice.remindersSent.some(
          r => r.type === 'on_due' && r.daysOffset === 0
        );
        if (!alreadySent && daysUntilDue === 0) {
          nextReminder = {
            type: 'on_due',
            daysOffset: 0,
            scheduledDate: dueDate,
            description: 'On due date'
          };
        }
      }

      // Check after due reminders
      if (!nextReminder && invoice.reminderSettings.afterDue) {
        for (const days of invoice.reminderSettings.afterDue.sort((a, b) => a - b)) {
          const alreadySent = invoice.remindersSent.some(
            r => r.type === 'after_due' && r.daysOffset === days
          );
          if (!alreadySent && daysUntilDue < 0 && Math.abs(daysUntilDue) <= days) {
            nextReminder = {
              type: 'after_due',
              daysOffset: days,
              scheduledDate: new Date(dueDate.getTime() + days * 24 * 60 * 60 * 1000),
              description: `${days} days after due date`
            };
            break;
          }
        }
      }
    }

    res.json({
      reminderSettings: invoice.reminderSettings,
      remindersSent: invoice.remindersSent,
      nextReminder
    });
  } catch (error) {
    console.error('Get reminders error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// 🚀 PAYMENT REMINDERS: Update reminder settings for an invoice
router.patch('/:id/reminders', auth, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid invoice ID format' });
    }

    const { enabled, beforeDue, onDue, afterDue } = req.body;

    // Find invoice
    const invoice = await Invoice.findOne({
      _id: req.params.id,
      userId: req.userId
    });

    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }

    // Get user to check plan
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // FREE TIER VALIDATION: Only allow onDue reminder
    if (user.plan === 'free') {
      if (enabled && (beforeDue?.length > 0 || afterDue?.length > 0)) {
        return res.status(403).json({
          message: 'Free plan only allows reminder on due date. Upgrade to Pro for unlimited reminders.',
          upgradePath: '/settings/billing'
        });
      }

      // Free users can only enable onDue
      invoice.reminderSettings = {
        enabled: enabled || false,
        beforeDue: [],
        onDue: onDue || false,
        afterDue: []
      };
    } else {
      // PRO/ENTERPRISE: Allow all reminder types
      invoice.reminderSettings = {
        enabled: enabled !== undefined ? enabled : invoice.reminderSettings?.enabled || false,
        beforeDue: beforeDue || invoice.reminderSettings?.beforeDue || [],
        onDue: onDue !== undefined ? onDue : invoice.reminderSettings?.onDue || false,
        afterDue: afterDue || invoice.reminderSettings?.afterDue || []
      };
    }

    await invoice.save();

    res.json({
      message: 'Reminder settings updated',
      reminderSettings: invoice.reminderSettings,
      plan: user.plan
    });
  } catch (error) {
    console.error('Update reminders error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Export invoices as CSV (Basic)
router.get('/export/csv', auth, async (req, res) => {
  try {
    const { status, startDate, endDate } = req.query;

    // Build query
    const query = { userId: req.userId };

    if (status && status !== 'all') {
      query.status = status;
    }

    if (startDate || endDate) {
      query.dateIssued = {};
      if (startDate) query.dateIssued.$gte = new Date(startDate);
      if (endDate) query.dateIssued.$lte = new Date(endDate);
    }

    // Fetch invoices
    const invoices = await Invoice.find(query)
      .sort({ dateIssued: -1 })
      .lean();

    if (invoices.length === 0) {
      return res.status(404).json({ message: 'No invoices found to export' });
    }

    // Create CSV headers
    const csvHeaders = [
      'Invoice Number',
      'Client Name',
      'Client Email',
      'Date Issued',
      'Due Date',
      'Status',
      'Currency',
      'Subtotal',
      'Tax Rate (%)',
      'Tax Amount',
      'Discount Rate (%)',
      'Discount Amount',
      'Total',
      'Notes',
    ].join(',');

    // Create CSV rows
    const csvRows = invoices.map((invoice) => {
      const clientName = invoice.clientName || 'N/A';
      const clientEmail = invoice.clientEmail || 'N/A';
      
      // Calculate amounts
      const subtotal = invoice.subtotal || 0;
      const taxRate = invoice.taxRate || 0;
      const discountRate = invoice.discountRate || 0;
      
      const taxAmount = (subtotal * taxRate) / 100;
      const discountAmount = (subtotal * discountRate) / 100;

      return [
        `"${invoice.invoiceNumber || 'N/A'}"`,
        `"${clientName.replace(/"/g, '""')}"`,
        `"${clientEmail}"`,
        `"${new Date(invoice.dateIssued).toLocaleDateString()}"`,
        `"${new Date(invoice.dueDate).toLocaleDateString()}"`,
        `"${invoice.status}"`,
        `"${invoice.currency}"`,
        subtotal.toFixed(2),
        taxRate.toFixed(2),
        taxAmount.toFixed(2),
        discountRate.toFixed(2),
        discountAmount.toFixed(2),
        (invoice.total || 0).toFixed(2),
        `"${(invoice.notes || '').replace(/"/g, '""')}"`,
      ].join(',');
    });

    // Combine headers and rows
    const csv = [csvHeaders, ...csvRows].join('\n');

    // Set headers for file download
    const filename = `invoices_${new Date().toISOString().split('T')[0]}.csv`;
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    res.send(csv);
  } catch (error) {
    console.error('Error exporting CSV:', error);
    res.status(500).json({
      message: 'Failed to export invoices',
      error: error.message,
    });
  }
});

// Export comprehensive tax report as CSV
router.get('/export/tax-report', auth, async (req, res) => {
  try {
    const { year } = req.query;
    
    // Build query for the year
    const query = { userId: req.userId };
    
    if (year) {
      const startOfYear = new Date(`${year}-01-01`);
      const endOfYear = new Date(`${year}-12-31`);
      query.dateIssued = { $gte: startOfYear, $lte: endOfYear };
    }

    // Fetch all invoices
    const invoices = await Invoice.find(query).sort({ dateIssued: 1 }).lean();

    if (invoices.length === 0) {
      return res.status(404).json({ message: 'No invoices found for tax report' });
    }

    const sections = [];

    // ==========================================
    // SECTION 1: INVOICE SUMMARY
    // ==========================================
    sections.push('=== INVOICE SUMMARY ===');
    sections.push([
      'Invoice Number',
      'Date Issued',
      'Due Date',
      'Client Name',
      'Client Email',
      'Status',
      'Payment Date',
      'Payment Method',
      'Currency',
      'Subtotal',
      'Tax Rate (%)',
      'Tax Amount',
      'Discount (%)',
      'Discount Amount',
      'Total Amount',
      'Notes'
    ].join(','));

    invoices.forEach(inv => {
      const subtotal = inv.subtotal || 0;
      const taxRate = inv.taxRate || 0;
      const discountRate = inv.discountRate || 0;
      const taxAmount = (subtotal * taxRate) / 100;
      const discountAmount = (subtotal * discountRate) / 100;

      sections.push([
        `"${inv.invoiceNumber || 'N/A'}"`,
        `"${new Date(inv.dateIssued).toLocaleDateString()}"`,
        `"${new Date(inv.dueDate).toLocaleDateString()}"`,
        `"${(inv.clientName || '').replace(/"/g, '""')}"`,
        `"${inv.clientEmail || ''}"`,
        `"${inv.status}"`,
        `"${inv.paymentDate ? new Date(inv.paymentDate).toLocaleDateString() : 'Not Paid'}"`,
        `"${inv.paymentMethod || 'N/A'}"`,
        `"${inv.currency}"`,
        subtotal.toFixed(2),
        taxRate.toFixed(2),
        taxAmount.toFixed(2),
        discountRate.toFixed(2),
        discountAmount.toFixed(2),
        (inv.total || 0).toFixed(2),
        `"${(inv.notes || '').replace(/"/g, '""')}"`
      ].join(','));
    });

    sections.push(''); // Empty line

    // ==========================================
    // SECTION 2: MONTHLY REVENUE SUMMARY
    // ==========================================
    sections.push('=== MONTHLY REVENUE SUMMARY ===');
    sections.push(['Month', 'Total Invoices', 'Total Revenue', 'Total Tax Collected', 'Paid Amount', 'Outstanding'].join(','));

    const monthlyData = {};
    invoices.forEach(inv => {
      const month = new Date(inv.dateIssued).toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
      if (!monthlyData[month]) {
        monthlyData[month] = {
          count: 0,
          revenue: 0,
          tax: 0,
          paid: 0,
          outstanding: 0
        };
      }
      
      const subtotal = inv.subtotal || 0;
      const taxRate = inv.taxRate || 0;
      const taxAmount = (subtotal * taxRate) / 100;
      const total = inv.total || 0;

      monthlyData[month].count += 1;
      monthlyData[month].revenue += total;
      monthlyData[month].tax += taxAmount;
      
      if (inv.status === 'paid') {
        monthlyData[month].paid += total;
      } else {
        monthlyData[month].outstanding += total;
      }
    });

    Object.entries(monthlyData).forEach(([month, data]) => {
      sections.push([
        `"${month}"`,
        data.count,
        data.revenue.toFixed(2),
        data.tax.toFixed(2),
        data.paid.toFixed(2),
        data.outstanding.toFixed(2)
      ].join(','));
    });

    sections.push(''); // Empty line

    // ==========================================
    // SECTION 3: CLIENT SUMMARY
    // ==========================================
    sections.push('=== CLIENT SUMMARY ===');
    sections.push(['Client Name', 'Client Email', 'Total Invoices', 'Total Invoiced', 'Total Paid', 'Outstanding'].join(','));

    const clientData = {};
    invoices.forEach(inv => {
      const clientKey = inv.clientEmail || inv.clientName;
      if (!clientData[clientKey]) {
        clientData[clientKey] = {
          name: inv.clientName,
          email: inv.clientEmail,
          count: 0,
          invoiced: 0,
          paid: 0,
          outstanding: 0
        };
      }

      const total = inv.total || 0;
      clientData[clientKey].count += 1;
      clientData[clientKey].invoiced += total;
      
      if (inv.status === 'paid') {
        clientData[clientKey].paid += total;
      } else {
        clientData[clientKey].outstanding += total;
      }
    });

    Object.values(clientData).forEach(client => {
      sections.push([
        `"${(client.name || '').replace(/"/g, '""')}"`,
        `"${client.email || ''}"`,
        client.count,
        client.invoiced.toFixed(2),
        client.paid.toFixed(2),
        client.outstanding.toFixed(2)
      ].join(','));
    });

    sections.push(''); // Empty line

    // ==========================================
    // SECTION 4: TAX BREAKDOWN
    // ==========================================
    sections.push('=== TAX BREAKDOWN BY RATE ===');
    sections.push(['Tax Rate (%)', 'Number of Invoices', 'Taxable Amount', 'Tax Collected'].join(','));

    const taxData = {};
    invoices.forEach(inv => {
      const taxRate = inv.taxRate || 0;
      if (!taxData[taxRate]) {
        taxData[taxRate] = {
          count: 0,
          taxableAmount: 0,
          taxCollected: 0
        };
      }

      const subtotal = inv.subtotal || 0;
      const taxAmount = (subtotal * taxRate) / 100;

      taxData[taxRate].count += 1;
      taxData[taxRate].taxableAmount += subtotal;
      taxData[taxRate].taxCollected += taxAmount;
    });

    Object.entries(taxData).forEach(([rate, data]) => {
      sections.push([
        rate,
        data.count,
        data.taxableAmount.toFixed(2),
        data.taxCollected.toFixed(2)
      ].join(','));
    });

    sections.push(''); // Empty line

    // ==========================================
    // SECTION 5: DETAILED LINE ITEMS
    // ==========================================
    sections.push('=== DETAILED LINE ITEMS ===');
    sections.push(['Invoice Number', 'Date', 'Client', 'Item Description', 'Quantity', 'Unit Price', 'Line Total', 'Taxable'].join(','));

    invoices.forEach(inv => {
      if (inv.items && inv.items.length > 0) {
        inv.items.forEach(item => {
          const lineTotal = (item.quantity || 0) * (item.unitPrice || 0);
          sections.push([
            `"${inv.invoiceNumber || 'N/A'}"`,
            `"${new Date(inv.dateIssued).toLocaleDateString()}"`,
            `"${(inv.clientName || '').replace(/"/g, '""')}"`,
            `"${(item.description || '').replace(/"/g, '""')}"`,
            item.quantity || 0,
            (item.unitPrice || 0).toFixed(2),
            lineTotal.toFixed(2),
            `"${item.taxable ? 'Yes' : 'No'}"`
          ].join(','));
        });
      }
    });

    sections.push(''); // Empty line

    // ==========================================
    // SECTION 6: YEAR-END TOTALS
    // ==========================================
    sections.push('=== YEAR-END TOTALS ===');
    
    const totals = invoices.reduce((acc, inv) => {
      const subtotal = inv.subtotal || 0;
      const taxRate = inv.taxRate || 0;
      const taxAmount = (subtotal * taxRate) / 100;
      const total = inv.total || 0;

      acc.totalInvoices += 1;
      acc.totalRevenue += total;
      acc.totalTax += taxAmount;
      
      if (inv.status === 'paid') {
        acc.totalPaid += total;
        acc.paidInvoices += 1;
      } else {
        acc.totalOutstanding += total;
        acc.unpaidInvoices += 1;
      }
      
      return acc;
    }, {
      totalInvoices: 0,
      paidInvoices: 0,
      unpaidInvoices: 0,
      totalRevenue: 0,
      totalTax: 0,
      totalPaid: 0,
      totalOutstanding: 0
    });

    sections.push(['Metric', 'Value'].join(','));
    sections.push(['Total Invoices', totals.totalInvoices].join(','));
    sections.push(['Paid Invoices', totals.paidInvoices].join(','));
    sections.push(['Unpaid Invoices', totals.unpaidInvoices].join(','));
    sections.push(['Total Revenue', totals.totalRevenue.toFixed(2)].join(','));
    sections.push(['Total Tax Collected', totals.totalTax.toFixed(2)].join(','));
    sections.push(['Total Paid', totals.totalPaid.toFixed(2)].join(','));
    sections.push(['Total Outstanding', totals.totalOutstanding.toFixed(2)].join(','));

    // Combine all sections
    const csv = sections.join('\n');

    // Set headers for file download
    const currentYear = year || new Date().getFullYear();
    const filename = `tax_report_${currentYear}_${new Date().toISOString().split('T')[0]}.csv`;
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    res.send(csv);
  } catch (error) {
    console.error('Error exporting tax report:', error);
    res.status(500).json({
      message: 'Failed to export tax report',
      error: error.message,
    });
  }
});

// Get public invoice by share token (no login required)
router.get('/public/:shareToken', async (req, res) => {
  try {
    const invoice = await Invoice.findOne({
      shareToken: req.params.shareToken
    });

    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }

    // 🚀 ANALYTICS: Increment view count
    invoice.viewCount = (invoice.viewCount || 0) + 1;
    invoice.lastViewedAt = new Date();
    await invoice.save();

    res.json(invoice);
  } catch (error) {
    console.error('Get public invoice error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Generate share token for an invoice
router.post('/:id/share', auth, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid invoice ID format' });
    }

    const invoice = await Invoice.findOne({
      _id: req.params.id,
      userId: req.userId
    });

    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }

    // Generate token if it doesn't exist
    if (!invoice.shareToken) {
      invoice.shareToken = crypto.randomBytes(16).toString('hex');
      await invoice.save();
    }

    res.json({ 
      shareToken: invoice.shareToken,
      shareUrl: `${process.env.FRONTEND_URL || 'https://billkazi.me'}/invoice/${invoice.shareToken}`
    });
  } catch (error) {
    console.error('Generate share token error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all user's invoices
router.get('/', auth, async (req, res) => {
  try {
    const invoices = await Invoice.find({ userId: req.userId })
      .sort({ dateIssued: -1 });
    res.json(invoices);
  } catch (error) {
    console.error('Get invoices error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single invoice
router.get('/:id', auth, async (req, res) => {
  try {
    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid invoice ID format' });
    }

    const invoice = await Invoice.findOne({
      _id: req.params.id,
      userId: req.userId
    });

    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }

    res.json(invoice);
  } catch (error) {
    console.error('Get invoice error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update invoice status - PATCH /api/invoices/:id/status
router.patch('/:id/status', auth, async (req, res) => {
  try {
    const { status } = req.body;
    
    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid invoice ID format' });
    }
    
    // Validate status
    if (!['paid', 'unpaid'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status. Must be paid or unpaid' });
    }

    // Find invoice
    const invoice = await Invoice.findOne({
      _id: req.params.id,
      userId: req.userId
    });
    
    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }

    // Update status
    invoice.status = status;
    await invoice.save();

    res.json(invoice);
  } catch (error) {
    console.error('Status update error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// PHASE 2: Mark invoice as paid with payment details
router.patch('/:id/payment', auth, async (req, res) => {
  try {
    const { status, paymentDate, paymentMethod, paymentNotes } = req.body;
    
    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid invoice ID format' });
    }
    
    // Validate status
    if (!['paid', 'unpaid'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status. Must be paid or unpaid' });
    }

    // Find invoice
    const invoice = await Invoice.findOne({
      _id: req.params.id,
      userId: req.userId
    });
    
    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }

    // Update payment status and details
    invoice.status = status;
    
    if (status === 'paid') {
      // Mark as paid - record payment details
      invoice.paymentDate = paymentDate ? new Date(paymentDate) : new Date();
      invoice.paymentMethod = paymentMethod || null;
      invoice.paymentNotes = paymentNotes || '';
    } else {
      // Mark as unpaid - clear payment details
      invoice.paymentDate = null;
      invoice.paymentMethod = null;
      invoice.paymentNotes = '';
    }
    
    await invoice.save();

    res.json(invoice);
  } catch (error) {
    console.error('Payment status update error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create invoice
router.post('/', auth, async (req, res) => {
  try {
    const {
      clientName,
      clientEmail,
      clientId,
      items,
      currency,
      taxRate,
      // 🚀 PAYMENT REMINDERS: Accept reminder settings
      reminderSettings
    } = req.body;

    if (!clientName?.trim()) {
      return res.status(400).json({ message: 'Client name is required' });
    }

    if (!clientEmail?.trim()) {
      return res.status(400).json({ message: 'Client email is required' });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(clientEmail)) {
      return res.status(400).json({ message: 'Invalid email format' });
    }

    // Validate items
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'At least one item is required' });
    }

    // Validate each item
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (!item.description?.trim()) {
        return res.status(400).json({ message: `Item ${i + 1}: Description is required` });
      }
      if (!item.quantity || item.quantity <= 0) {
        return res.status(400).json({ message: `Item ${i + 1}: Quantity must be greater than 0` });
      }
      if (!item.unitPrice || item.unitPrice < 0) {
        return res.status(400).json({ message: `Item ${i + 1}: Unit price cannot be negative` });
      }
    }
    
    // Get user and generate invoice number
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // 🚀 PAYMENT REMINDERS: Validate free tier limits
    if (reminderSettings?.enabled && user.plan === 'free') {
      if (reminderSettings.beforeDue?.length > 0 || reminderSettings.afterDue?.length > 0) {
        return res.status(403).json({
          message: 'Free plan only allows reminder on due date. Upgrade to Pro for unlimited reminders.',
          upgradePath: '/settings/billing'
        });
      }
    }

    const invoiceNumber = await generateInvoiceNumber(user);
    console.log('✅ Generated invoice number:', invoiceNumber);

    // Create invoice with generated number and share token
    const invoice = new Invoice({
      ...req.body,
      userId: req.userId,
      invoiceNumber: invoiceNumber, 
      clientName: clientName.trim(),
      clientEmail: clientEmail.trim().toLowerCase(),
      shareToken: crypto.randomBytes(16).toString('hex'),
      // 🚀 PAYMENT REMINDERS: Save reminder settings
      reminderSettings: reminderSettings || {
        enabled: false,
        beforeDue: [],
        onDue: false,
        afterDue: []
      }
    });

    await invoice.save();
    res.status(201).json(invoice);
  } catch (error) {
    console.error('Create invoice error:', error);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    
    res.status(500).json({ message: 'Server error' });
  }
});

// Update invoice
router.put('/:id', auth, async (req, res) => {
  try {
    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid invoice ID format' });
    }

    const invoice = await Invoice.findOne({
      _id: req.params.id,
      userId: req.userId
    });

    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }

    // Prevent changing invoice number on updates
    if (req.body.invoiceNumber && req.body.invoiceNumber !== invoice.invoiceNumber) {
      return res.status(400).json({ 
        message: 'Invoice number cannot be changed after creation' 
      });
    }

    // Update invoice
    Object.assign(invoice, req.body);
    await invoice.save();

    res.json(invoice);
  } catch (error) {
    console.error('Update invoice error:', error);
    
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete invoice
router.delete('/:id', auth, async (req, res) => {
  try {
    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid invoice ID format' });
    }

    const invoice = await Invoice.findOneAndDelete({
      _id: req.params.id,
      userId: req.userId
    });

    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }

    res.json({ message: 'Invoice deleted successfully' });
  } catch (error) {
    console.error('Delete invoice error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Send invoice via email
router.post('/:id/send-email', auth, async (req, res) => {
  try {
    console.log('📧 Starting email send process...');
    
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid invoice ID format' });
    }

    console.log('🔍 Step 1: Finding invoice...');
    const invoice = await Invoice.findOne({
      _id: req.params.id,
      userId: req.userId
    });

    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }
    console.log('✅ Invoice found:', invoice.invoiceNumber);

    console.log('🔍 Step 2: Finding user settings...');
    const User = require('../models/user');
    const user = await User.findById(req.userId).select('-password');
    console.log('🔍 User result:', user);
    console.log('🔍 Company name:', user?.companyName);

    // Build settings object from user data
    const settings = user ? {
      companyName: user.companyName,
      contactEmail: user.contactEmail,
      phone: user.phone,
      address: user.address
    } : null;

    console.log('🔍 Step 3: Building share URL...');
    const shareUrl = invoice.shareToken 
      ? `https://billkazi.me/i/${invoice.shareToken}`
      : null;
    console.log('🔍 Share URL:', shareUrl);

    console.log('🔍 Step 4: Preparing email data...');
    const emailData = {
      invoiceNumber: invoice.invoiceNumber,
      clientName: invoice.clientName,
      total: invoice.total,
      subtotal: invoice.subtotal,
      tax: invoice.tax,
      discount: invoice.discount,
      currency: invoice.currency,
      dueDate: invoice.dueDate,
      items: invoice.items
    };
    console.log('🔍 Email data prepared');

    console.log('🔍 Step 5: Sending email...');
    const success = await sendInvoiceEmail(
      invoice.clientEmail,
      emailData,
      settings,
      shareUrl
    );

    if (!success) {
      console.log('❌ Email sending failed');
      return res.status(500).json({ message: 'Failed to send email' });
    }

    console.log('✅ Email sent successfully!');
    res.json({ message: 'Invoice sent successfully' });
  } catch (error) {
    console.error('❌ Send invoice email error:', error);
    console.error('❌ Error stack:', error.stack);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;