const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Client = require('../models/client');
const Invoice = require('../models/Invoice');

// All routes require authentication
router.use(auth);

// CREATE new client
router.post('/', async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      address,
      city,
      country,
      vatNumber,
      paymentTerms,
      notes,
    } = req.body;

    // Check if client with same email already exists
    const existingClient = await Client.findOne({
      userId: req.userId,
      email: email.toLowerCase(),
    });

    if (existingClient) {
      return res.status(400).json({
        message: 'A client with this email already exists',
      });
    }

    const client = await Client.create({
      userId: req.userId,
      name,
      email,
      phone,
      address,
      city,
      country,
      vatNumber,
      paymentTerms: paymentTerms || 30,
      notes,
    });

    res.status(201).json(client);
  } catch (error) {
    console.error('Error creating client:', error);
    res.status(500).json({
      message: 'Failed to create client',
      error: error.message,
    });
  }
});

// GET all clients
router.get('/', async (req, res) => {
  try {
    const { search } = req.query;
    const query = { userId: req.userId };

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const clients = await Client.find(query).sort({ name: 1 }).lean();

    // Get invoice stats for each client
    const clientsWithStats = await Promise.all(
      clients.map(async (client) => {
        const invoices = await Invoice.find({
          userId: req.userId,
          clientId: client._id,
        }).select('total status');

        const invoiceCount = invoices.length;
        const totalInvoiced = invoices.reduce((sum, inv) => sum + (inv.total || 0), 0);
        const totalPaid = invoices
          .filter((inv) => inv.status === 'paid')
          .reduce((sum, inv) => sum + (inv.total || 0), 0);

        return {
          ...client,
          invoiceCount,
          totalInvoiced,
          totalPaid,
          outstanding: totalInvoiced - totalPaid,
        };
      })
    );

    res.json(clientsWithStats);
  } catch (error) {
    console.error('Error fetching clients:', error);
    res.status(500).json({
      message: 'Failed to fetch clients',
      error: error.message,
    });
  }
});

// GET single client by ID
router.get('/:id', async (req, res) => {
  try {
    const client = await Client.findOne({
      _id: req.params.id,
      userId: req.userId,
    });

    if (!client) {
      return res.status(404).json({ message: 'Client not found' });
    }

    const invoices = await Invoice.find({
      userId: req.userId,
      clientId: client._id,
    }).select('invoiceNumber dateIssued total status currency');

    const invoiceCount = invoices.length;
    const totalInvoiced = invoices.reduce((sum, inv) => sum + (inv.total || 0), 0);
    const totalPaid = invoices
      .filter((inv) => inv.status === 'paid')
      .reduce((sum, inv) => sum + (inv.total || 0), 0);

    res.json({
      ...client.toObject(),
      invoiceCount,
      totalInvoiced,
      totalPaid,
      outstanding: totalInvoiced - totalPaid,
      recentInvoices: invoices.slice(0, 5),
    });
  } catch (error) {
    console.error('Error fetching client:', error);
    res.status(500).json({
      message: 'Failed to fetch client',
      error: error.message,
    });
  }
});

// UPDATE client
router.put('/:id', async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      address,
      city,
      country,
      vatNumber,
      paymentTerms,
      notes,
    } = req.body;

    const client = await Client.findOne({
      _id: req.params.id,
      userId: req.userId,
    });

    if (!client) {
      return res.status(404).json({ message: 'Client not found' });
    }

    // Check if email is being changed and if it already exists
    if (email && email.toLowerCase() !== client.email) {
      const existingClient = await Client.findOne({
        userId: req.userId,
        email: email.toLowerCase(),
        _id: { $ne: client._id },
      });

      if (existingClient) {
        return res.status(400).json({
          message: 'A client with this email already exists',
        });
      }
    }

    if (name) client.name = name;
    if (email) client.email = email;
    if (phone !== undefined) client.phone = phone;
    if (address !== undefined) client.address = address;
    if (city !== undefined) client.city = city;
    if (country !== undefined) client.country = country;
    if (vatNumber !== undefined) client.vatNumber = vatNumber;
    if (paymentTerms !== undefined) client.paymentTerms = paymentTerms;
    if (notes !== undefined) client.notes = notes;

    await client.save();
    res.json(client);
  } catch (error) {
    console.error('Error updating client:', error);
    res.status(500).json({
      message: 'Failed to update client',
      error: error.message,
    });
  }
});

// DELETE client
router.delete('/:id', async (req, res) => {
  try {
    const client = await Client.findOne({
      _id: req.params.id,
      userId: req.userId,
    });

    if (!client) {
      return res.status(404).json({ message: 'Client not found' });
    }

    // Check if client has invoices
    const invoiceCount = await Invoice.countDocuments({
      userId: req.userId,
      clientId: client._id,
    });

    if (invoiceCount > 0) {
      return res.status(400).json({
        message: `Cannot delete client. They have ${invoiceCount} invoice(s). Please delete or reassign those invoices first.`,
        invoiceCount,
      });
    }

    await client.deleteOne();

    res.json({
      message: 'Client deleted successfully',
      deletedClient: client,
    });
  } catch (error) {
    console.error('Error deleting client:', error);
    res.status(500).json({
      message: 'Failed to delete client',
      error: error.message,
    });
  }
});

// GET all invoices for a client
router.get('/:id/invoices', async (req, res) => {
  try {
    const client = await Client.findOne({
      _id: req.params.id,
      userId: req.userId,
    });

    if (!client) {
      return res.status(404).json({ message: 'Client not found' });
    }

    const invoices = await Invoice.find({
      userId: req.userId,
      clientId: client._id,
    }).sort({ dateIssued: -1 });

    const stats = {
      totalInvoices: invoices.length,
      totalAmount: invoices.reduce((sum, inv) => sum + (inv.total || 0), 0),
      paidAmount: invoices
        .filter((inv) => inv.status === 'paid')
        .reduce((sum, inv) => sum + (inv.total || 0), 0),
      unpaidAmount: invoices
        .filter((inv) => inv.status === 'unpaid')
        .reduce((sum, inv) => sum + (inv.total || 0), 0),
      paidCount: invoices.filter((inv) => inv.status === 'paid').length,
      unpaidCount: invoices.filter((inv) => inv.status === 'unpaid').length,
    };

    res.json({
      client,
      invoices,
      stats,
    });
  } catch (error) {
    console.error('Error fetching client invoices:', error);
    res.status(500).json({
      message: 'Failed to fetch client invoices',
      error: error.message,
    });
  }
});

module.exports = router;