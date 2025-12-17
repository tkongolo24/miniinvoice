const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const User = require('../models/user');
const auth = require('../middleware/auth');

// Configure multer for logo upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/logos';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'logo-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Only image files are allowed (jpeg, jpg, png, gif)'));
  }
});

// Get user settings
router.get('/', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
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
    if (companyName !== undefined) user.companyName = companyName;
    if (phone !== undefined) user.phone = phone;
    if (address !== undefined) user.address = address;
    if (businessRegNumber !== undefined) user.businessRegNumber = businessRegNumber;
    if (contactEmail !== undefined) user.contactEmail = contactEmail;
    if (invoiceFooter !== undefined) user.invoiceFooter = invoiceFooter.substring(0, 500);

    // Update profile completion status
    user.profileCompleted = user.checkProfileComplete();

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

// Upload logo
router.post('/logo', auth, upload.single('logo'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const user = await User.findById(req.userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Delete old logo if exists
    if (user.logo) {
      const oldLogoPath = path.join(__dirname, '..', user.logo);
      if (fs.existsSync(oldLogoPath)) {
        fs.unlinkSync(oldLogoPath);
      }
    }

    // Save new logo path
    user.logo = `uploads/logos/${req.file.filename}`;
    await user.save();

    res.json({
      message: 'Logo uploaded successfully',
      logo: user.logo
    });
  } catch (error) {
    console.error('Logo upload error:', error);
    res.status(500).json({ message: 'Server error during logo upload' });
  }
});

// Delete logo
router.delete('/logo', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Delete logo file
    if (user.logo) {
      const logoPath = path.join(__dirname, '..', user.logo);
      if (fs.existsSync(logoPath)) {
        fs.unlinkSync(logoPath);
      }
    }

    user.logo = '';
    await user.save();

    res.json({ message: 'Logo deleted successfully' });
  } catch (error) {
    console.error('Delete logo error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;