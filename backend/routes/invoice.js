const express = require('express');
const router = express.Router();
const Invoice = require('../models/invoice');
const auth = require('../middleware/auth');

// @route   POST /api/invoices
// @desc    Create new invoice
// @access  Private
router.post('/', auth, async (req, res) => {
  try {
    const invoice = new Invoice({
      ...req.body,
      user: req.user._id
    });

    await invoice.save();
    res.status(201).json(invoice);
  } catch (error) {
    console.error('Create invoice error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/invoices
// @desc    Get all user invoices
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const invoices = await Invoice.find({ user: req.user._id })
      .sort({ createdAt: -1 });
    
    res.json(invoices);
  } catch (error) {
    console.error('Get invoices error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/invoices/:id
// @desc    Get single invoice
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const invoice = await Invoice.findOne({
      _id: req.params.id,
      user: req.user._id
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

// @route   PUT /api/invoices/:id
// @desc    Update invoice
// @access  Private
router.put('/:id', auth, async (req, res) => {
  try {
    const invoice = await Invoice.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }

    // Update fields
    Object.keys(req.body).forEach(key => {
      invoice[key] = req.body[key];
    });

    await invoice.save();
    res.json(invoice);
  } catch (error) {
    console.error('Update invoice error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/invoices/:id
// @desc    Delete invoice
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const invoice = await Invoice.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id
    });

    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }

    res.json({ message: 'Invoice deleted' });
  } catch (error) {
    console.error('Delete invoice error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PATCH /api/invoices/:id/status
// @desc    Update invoice status
// @access  Private
router.patch('/:id/status', auth, async (req, res) => {
  try {
    const { status } = req.body;

    if (!['paid', 'unpaid', 'overdue'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const invoice = await Invoice.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }

    invoice.status = status;
    await invoice.save();

    res.json(invoice);
  } catch (error) {
    console.error('Update status error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;