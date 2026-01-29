const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Client = require('../models/Client');
const ClientOnboarding = require('../models/ClientOnboarding');
const Invoice = require('../models/invoice');

// ==================================================
// ONBOARDING ROUTES (Public - No Auth Required)
// ==================================================

// GET onboarding form by token (PUBLIC)
router.get('/onboard/:token', async (req, res) => {
  try {
    const form = await ClientOnboarding.findOne({
      token: req.params.token,
    }).populate('userId', 'name email companyName');

    if (!form) {
      return res.status(404).json({ message: 'Onboarding form not found' });
    }

    // Check if expired
    if (form.isExpired()) {
      return res.status(410).json({ message: 'This onboarding link has expired' });
    }

    // Check if already completed
    if (form.status === 'completed') {
      return res.status(410).json({ message: 'This onboarding form has already been completed' });
    }

    // Return form details (sanitized)
    res.json({
      businessName: form.userId.companyName || form.userId.name,
      businessEmail: form.userId.email,
      expiresAt: form.expiresAt,
    });
  } catch (error) {
    console.error('Error fetching onboarding form:', error);
    res.status(500).json({
      message: 'Failed to fetch onboarding form',
      error: error.message,
    });
  }
});

// SUBMIT onboarding form (PUBLIC)
router.post('/onboard/:token/submit', async (req, res) => {
  try {
    const { name, email, phone, address, city, country, vatNumber, notes } = req.body;

    // Validate required fields
    if (!name || !email) {
      return res.status(400).json({
        message: 'Name and email are required',
      });
    }

    // Find the form
    const form = await ClientOnboarding.findOne({
      token: req.params.token,
    });

    if (!form) {
      return res.status(404).json({ message: 'Onboarding form not found' });
    }

    // Check if expired
    if (form.isExpired()) {
      return res.status(410).json({ message: 'This onboarding link has expired' });
    }

    // Check if already completed
    if (form.status === 'completed') {
      return res.status(410).json({ message: 'This form has already been completed' });
    }

    // Check if client already exists
    const existingClient = await Client.findOne({
      userId: form.userId,
      email: email.toLowerCase(),
    });

    if (existingClient) {
      return res.status(400).json({
        message: 'A client with this email already exists',
      });
    }

    // Create the client
    const client = await Client.create({
      userId: form.userId,
      name,
      email,
      phone: phone || '',
      address: address || '',
      city: city || '',
      country: country || '',
      vatNumber: vatNumber || '',
      paymentTerms: 30,
      notes: notes || '',
    });

    // Update the form
    form.submittedData = { name, email, phone, address, city, country, vatNumber, notes };
    await form.markCompleted(client._id);

    res.json({
      message: 'Client information submitted successfully!',
      client: {
        name: client.name,
        email: client.email,
      },
    });

    // TODO: Send email notification to user (we'll add this later)
  } catch (error) {
    console.error('Error submitting onboarding form:', error);
    res.status(500).json({
      message: 'Failed to submit form',
      error: error.message,
    });
  }
});

// ==================================================
// AUTHENTICATED ROUTES (Require Auth)
// ==================================================

// All routes below require authentication
router.use(auth);

// CREATE onboarding form
router.post('/onboarding/create', async (req, res) => {
  try {
    const form = await ClientOnboarding.create({
      userId: req.userId,
    });

    res.status(201).json({
      token: form.token,
      link: `${process.env.FRONTEND_URL}/onboard/${form.token}`,
      expiresAt: form.expiresAt,
    });
  } catch (error) {
    console.error('Error creating onboarding form:', error);
    res.status(500).json({
      message: 'Failed to create onboarding form',
      error: error.message,
    });
  }
});

// GET all onboarding forms (user's forms)
router.get('/onboarding/my-forms', async (req, res) => {
  try {
    const forms = await ClientOnboarding.find({
      userId: req.userId,
    })
      .populate('clientId', 'name email')
      .sort({ createdAt: -1 });

    res.json(forms);
  } catch (error) {
    console.error('Error fetching onboarding forms:', error);
    res.status(500).json({
      message: 'Failed to fetch onboarding forms',
      error: error.message,
    });
  }
});

// DELETE onboarding form
router.delete('/onboarding/:token', async (req, res) => {
  try {
    const form = await ClientOnboarding.findOne({
      token: req.params.token,
      userId: req.userId,
    });

    if (!form) {
      return res.status(404).json({ message: 'Onboarding form not found' });
    }

    await form.deleteOne();

    res.json({ message: 'Onboarding form deleted successfully' });
  } catch (error) {
    console.error('Error deleting onboarding form:', error);
    res.status(500).json({
      message: 'Failed to delete onboarding form',
      error: error.message,
    });
  }
});

// ==================================================
// EXISTING CLIENT ROUTES
// ==================================================

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