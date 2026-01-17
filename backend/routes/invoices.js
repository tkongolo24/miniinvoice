const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Invoice = require('../models/invoice');
const auth = require('../middleware/auth');
const crypto = require('crypto');
const { sendInvoiceEmail } = require('../services/emailService');

// Get public invoice by share token (no login required)
router.get('/public/:shareToken', async (req, res) => {
  try {
    const invoice = await Invoice.findOne({
      shareToken: req.params.shareToken
    });

    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }

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
      user: req.userId
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
    const invoices = await Invoice.find({ user: req.userId })
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
      user: req.userId
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
      user: req.userId
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

// Create invoice
router.post('/', auth, async (req, res) => {
  try {
    const {
      invoiceNumber,
      clientName,
      clientEmail,
      items,
      currency,
      taxRate
    } = req.body;

    // Validate required fields
    if (!invoiceNumber?.trim()) {
      return res.status(400).json({ message: 'Invoice number is required' });
    }

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

    // Check for duplicate invoice number
    const existingInvoice = await Invoice.findOne({
      invoiceNumber: invoiceNumber.trim(),
      user: req.userId
    });

    if (existingInvoice) {
      return res.status(400).json({ message: 'Invoice number already exists' });
    }

    // Create invoice with share token
    const invoice = new Invoice({
      ...req.body,
      user: req.userId,
      invoiceNumber: invoiceNumber.trim(),
      clientName: clientName.trim(),
      clientEmail: clientEmail.trim().toLowerCase(),
      shareToken: crypto.randomBytes(16).toString('hex')
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
      user: req.userId
    });

    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }

    // If updating invoice number, check for duplicates
    if (req.body.invoiceNumber && req.body.invoiceNumber !== invoice.invoiceNumber) {
      const existingInvoice = await Invoice.findOne({
        invoiceNumber: req.body.invoiceNumber,
        user: req.userId,
        _id: { $ne: req.params.id }
      });

      if (existingInvoice) {
        return res.status(400).json({ message: 'Invoice number already exists' });
      }
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
      user: req.userId
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
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid invoice ID format' });
    }

    const invoice = await Invoice.findOne({
      _id: req.params.id,
      user: req.userId
    });

    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }

    // Get company settings
    const settings = await Settings.findOne({ user: req.userId });

    // Build share URL if token exists
    const shareUrl = invoice.shareToken 
      ? `https://billkazi.me/i/${invoice.shareToken}`
      : null;

    // Send email
    const success = await sendInvoiceEmail(
      invoice.clientEmail,
      {
        invoiceNumber: invoice.invoiceNumber,
        clientName: invoice.clientName,
        total: invoice.total,
        currency: invoice.currency,
        dueDate: invoice.dueDate,
        items: invoice.items
      },
      settings,
      shareUrl
    );

    if (!success) {
      return res.status(500).json({ message: 'Failed to send email' });
    }

    res.json({ message: 'Invoice sent successfully' });
  } catch (error) {
    console.error('Send invoice email error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

