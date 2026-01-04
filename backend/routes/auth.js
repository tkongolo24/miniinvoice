const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/user');
const Token = require('../models/token');
const auth = require('../middleware/auth');
const { sendVerificationEmail, sendMagicLinkEmail, sendPasswordResetEmail } = require('../services/emailService');

// Helper to generate random token
const generateToken = () => crypto.randomBytes(32).toString('hex');

// Helper to create JWT
const createJWT = (userId) => jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '7d' });

// Register with email verification
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create new user
    const user = new User({
      name,
      email,
      password,
      emailVerified: false
    });

    await user.save();

    // Generate and send verification token
    const verificationToken = generateToken();
    const tokenDoc = new Token({
      email: email.toLowerCase(),
      token: verificationToken,
      type: 'verify',
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
    });
    await tokenDoc.save();

    await sendVerificationEmail(email, verificationToken);

    res.status(201).json({
      message: 'Account created. Check your email to verify.',
      email: email
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Verify email
router.post('/verify-email', async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ message: 'Token required' });
    }

    const tokenDoc = await Token.findOne({ token, type: 'verify', used: false });
    
    if (!tokenDoc) {
      return res.status(400).json({ message: 'Invalid or expired token' });
    }

    if (new Date() > tokenDoc.expiresAt) {
      return res.status(400).json({ message: 'Token expired' });
    }

    // Mark user as verified
    await User.updateOne(
      { email: tokenDoc.email },
      { emailVerified: true }
    );

    // Mark token as used
    tokenDoc.used = true;
    await tokenDoc.save();

    res.json({ message: 'Email verified successfully' });
  } catch (error) {
    console.error('Verify email error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    console.log('Login attempt:', { email: req.body.email });
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    if (!user.emailVerified) {
      return res.status(400).json({ message: 'Please verify your email first' });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Create token
    const token = createJWT(user._id);

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Request magic link
router.post('/magic-link', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email required' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    
    if (!user) {
      return res.status(400).json({ message: 'Email not found' });
    }

    if (!user.emailVerified) {
      return res.status(400).json({ message: 'Please verify your email first' });
    }

    // Generate magic link token
    const magicToken = generateToken();
    const tokenDoc = new Token({
      email: email.toLowerCase(),
      token: magicToken,
      type: 'magic-link',
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
    });
    await tokenDoc.save();

    await sendMagicLinkEmail(email.toLowerCase(), magicToken);

    res.json({ message: 'Magic link sent to your email' });
  } catch (error) {
    console.error('Magic link error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Verify magic link
router.post('/verify-magic-link', async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ message: 'Token required' });
    }

    const tokenDoc = await Token.findOne({ token, type: 'magic-link', used: false });
    
    if (!tokenDoc) {
      return res.status(400).json({ message: 'Invalid or expired token' });
    }

    if (new Date() > tokenDoc.expiresAt) {
      return res.status(400).json({ message: 'Token expired' });
    }

    const user = await User.findOne({ email: tokenDoc.email });
    if (!user) {
      return res.status(400).json({ message: 'User not found' });
    }

    // Mark token as used
    tokenDoc.used = true;
    await tokenDoc.save();

    // Create JWT
    const jwtToken = createJWT(user._id);
    res.json({
      token: jwtToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Verify magic link error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Request password reset
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email required' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    
    if (!user) {
      return res.status(400).json({ message: 'Email not found' });
    }

    // Generate reset token
    const resetToken = generateToken();
    const tokenDoc = new Token({
      email: email.toLowerCase(),
      token: resetToken,
      type: 'reset',
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
    });
    await tokenDoc.save();

    await sendPasswordResetEmail(email.toLowerCase(), resetToken);

    res.json({ message: 'Password reset link sent to your email' });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Reset password
router.post('/reset-password', async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({ message: 'Token and new password required' });
    }

    const tokenDoc = await Token.findOne({ token, type: 'reset', used: false });
    
    if (!tokenDoc) {
      return res.status(400).json({ message: 'Invalid or expired token' });
    }

    if (new Date() > tokenDoc.expiresAt) {
      return res.status(400).json({ message: 'Token expired' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await User.updateOne(
      { email: tokenDoc.email },
      { password: hashedPassword }
    );

    // Mark token as used
    tokenDoc.used = true;
    await tokenDoc.save();

    res.json({ message: 'Password reset successfully' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get profile
router.get('/profile', auth, async (req, res) => {
  try {
    console.log('Get profile for user:', req.userId);
    const user = await User.findById(req.userId).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update profile
router.put('/profile', auth, async (req, res) => {
  try {
    console.log('Update profile for user:', req.userId);
    
    const { companyName, phone, address, currency, defaultTemplate } = req.body;

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update only the fields that are provided
    if (companyName !== undefined) user.companyName = companyName;
    if (phone !== undefined) user.phone = phone;
    if (address !== undefined) user.address = address;
    if (currency !== undefined) user.currency = currency;
    if (defaultTemplate !== undefined) user.defaultTemplate = defaultTemplate;

    await user.save({ validateModifiedOnly: true });

    res.json(user);
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;