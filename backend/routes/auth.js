const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const auth = require('../middleware/auth');

// Register
router.post('/register', async (req, res) => {
  try {
    const { email, password, companyName } = req.body;

    console.log('Register attempt:', { email, companyName });

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password required' });
    }

    // Check if user exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create user
    user = new User({
      email,
      password,
      companyName: companyName || 'My Company'
    });

    await user.save();

    // Create token
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: '7d'
    });

    res.status(201).json({ 
      token, 
      user: { 
        id: user._id, 
        email: user.email, 
        companyName: user.companyName 
      } 
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log('Login attempt:', { email });

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password required' });
    }

    // Check user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Create token
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: '7d'
    });

    res.json({ 
      token, 
      user: { 
        id: user._id, 
        email: user.email,
        companyName: user.companyName 
      } 
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
});

// Get user profile
router.get('/profile', auth, async (req, res) => {
  try {
    console.log('Get profile for user:', req.userId);

    const user = await User.findById(req.userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ user });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
});

// Update user profile
router.put('/profile', auth, async (req, res) => {
  try {
    const { companyName, companyEmail, companyPhone, companyAddress, defaultCurrency } = req.body;

    console.log('Update profile for user:', req.userId);

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update fields
    if (companyName !== undefined) user.companyName = companyName;
    if (companyEmail !== undefined) user.companyEmail = companyEmail;
    if (companyPhone !== undefined) user.companyPhone = companyPhone;
    if (companyAddress !== undefined) user.companyAddress = companyAddress;
    if (defaultCurrency !== undefined) user.defaultCurrency = defaultCurrency;

    await user.save();

    res.json({ user });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
});

module.exports = router;
