const express = require('express');
const router = express.Router();
const User = require('../models/user');
const auth = require('../middleware/auth');

// Get user settings
router.get('/', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check profile completion
    const profileCompleted = !!(user.companyName && user.address && user.phone);

    res.json({
      email: user.email,
      name: user.name,
      companyName: user.companyName || '',
      phone: user.phone || '',
      address: user.address || '',
      businessRegNumber: user.businessRegNumber || '',
      contactEmail: user.contactEmail || '',
      logo: user.logo || '',
      invoiceFooter: user.invoiceFooter || '',
      profileCompleted: profileCompleted,
      plan: user.plan || 'free'
    });
  } catch (error) {
    console.error('Get settings error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update user settings
router.put('/', auth, async (req, res) => {
  try {
    const {
      name,
      companyName,
      phone,
      address,
      businessRegNumber,
      contactEmail,
      invoiceFooter
    } = req.body;

    const user = await User.findById(req.userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update fields
    if (name !== undefined) user.name = name;
    if (companyName !== undefined) user.companyName = companyName;
    if (phone !== undefined) user.phone = phone;
    if (address !== undefined) user.address = address;
    if (businessRegNumber !== undefined) user.businessRegNumber = businessRegNumber;
    if (contactEmail !== undefined) user.contactEmail = contactEmail;
    if (invoiceFooter !== undefined) user.invoiceFooter = invoiceFooter.substring(0, 500);

    // Update profile completion status directly
    user.profileCompleted = !!(user.companyName && user.address && user.phone);

    await user.save();

    res.json({
      message: 'Settings updated successfully',
      user: {
        email: user.email,
        name: user.name,
        companyName: user.companyName,
        phone: user.phone,
        address: user.address,
        businessRegNumber: user.businessRegNumber,
        contactEmail: user.contactEmail,
        logo: user.logo,
        invoiceFooter: user.invoiceFooter,
        profileCompleted: user.profileCompleted,
        plan: user.plan
      }
    });
  } catch (error) {
    console.error('Update settings error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Logo upload - temporarily disabled
router.post('/logo', auth, async (req, res) => {
  res.status(503).json({ 
    message: 'Logo upload is temporarily disabled. This feature will be available soon.' 
  });
});

// Delete logo
router.delete('/logo', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.logo = '';
    await user.save();

    res.json({ message: 'Logo removed successfully' });
  } catch (error) {
    console.error('Delete logo error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;