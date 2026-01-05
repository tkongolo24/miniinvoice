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

// Password validation helper
const validatePassword = (password) => {
  if (password.length < 12) return 'Password must be at least 12 characters';
  if (!/[A-Z]/.test(password)) return 'Password must contain an uppercase letter';
  if (!/[a-z]/.test(password)) return 'Password must contain a lowercase letter';
  if (!/[0-9]/.test(password)) return 'Password must contain a number';
  if (!/[!@#$%^&*]/.test(password)) return 'Password must contain a special character (!@#$%^&*)';
  return null;
};

// Register with email verification
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, confirmPassword } = req.body;

    // Validate inputs
    if (!name || !email || !password || !confirmPassword) {
      return res.status(400).json({ message: 'All fields required' });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ message: 'Passwords do not match' });
    }

    // Validate password strength
    const passwordError = validatePassword(password);
    if (passwordError) {
      return res.status(400).json({ message: passwordError });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Invalid email format' });
    }

    // Check if user exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const user = new User({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      emailVerified: false,
      authMethod: 'password'
    });

    await user.save();

    // Generate and send verification token
    const verificationToken = generateToken();
    const tokenDoc = new Token({
      email: email.toLowerCase(),
      token: verificationToken,
      type: 'verify',
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      used: false
    });
    await tokenDoc.save();

    // Send verification email
    try {
      await sendVerificationEmail(email.toLowerCase(), verificationToken);
    } catch (emailError) {
      console.error('Email send error:', emailError);
      // Don't fail registration if email fails, but log it
      return res.status(201).json({
        message: 'Account created but email failed. Contact support.',
        email: email.toLowerCase()
      });
    }

    res.status(201).json({
      message: 'Account created. Check your email to verify.',
      email: email.toLowerCase()
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
});

// Verify email
router.post('/verify-email', async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ message: 'Token required' });
    }

    const tokenDoc = await Token.findOne({ 
      token, 
      type: 'verify', 
      used: false,
      expiresAt: { $gt: new Date() }
    });
    
    if (!tokenDoc) {
      return res.status(400).json({ message: 'Invalid or expired verification token' });
    }

    // Mark user as verified
    const updateResult = await User.updateOne(
      { email: tokenDoc.email },
      { emailVerified: true }
    );

    if (updateResult.matchedCount === 0) {
      return res.status(400).json({ message: 'User not found' });
    }

    // Mark token as used
    tokenDoc.used = true;
    await tokenDoc.save();

    res.json({ message: 'Email verified successfully. You can now log in.' });
  } catch (error) {
    console.error('Verify email error:', error);
    res.status(500).json({ message: 'Error verifying email' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password required' });
    }

    // Find user
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check if email verified
    if (!user.emailVerified) {
      return res.status(403).json({ message: 'Please verify your email first. Check your inbox.' });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
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
    res.status(500).json({ message: 'Server error during login' });
  }
});

// Google Sign In / Sign Up
router.post('/google-signin', async (req, res) => {
  try {
    const { googleId, email, name } = req.body;

    if (!googleId || !email || !name) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Find existing user by googleId
    let user = await User.findOne({ googleId });

    if (!user) {
      // Check if email already exists with password auth
      const existingEmail = await User.findOne({ email: email.toLowerCase() });
      if (existingEmail) {
        return res.status(400).json({ message: 'Email already registered with password login. Please sign in with password instead.' });
      }

      // Create new user with Google
      user = new User({
        email: email.toLowerCase(),
        name,
        googleId,
        authMethod: 'google',
        emailVerified: true, // Google emails are pre-verified
        password: null
      });

      await user.save();
    }

    // Create JWT token
    const token = createJWT(user._id);

    res.json({
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        authMethod: user.authMethod
      }
    });
  } catch (error) {
    console.error('Google sign-in error:', error);
    res.status(500).json({ message: 'Google sign-in failed' });
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
      expiresAt: new Date(Date.now() + 15 * 60 * 1000), // 15 minutes
      used: false
    });
    await tokenDoc.save();

    try {
      await sendMagicLinkEmail(email.toLowerCase(), magicToken);
    } catch (emailError) {
      console.error('Magic link email error:', emailError);
      return res.status(500).json({ message: 'Failed to send magic link' });
    }

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

    const tokenDoc = await Token.findOne({ 
      token, 
      type: 'magic-link', 
      used: false,
      expiresAt: { $gt: new Date() }
    });
    
    if (!tokenDoc) {
      return res.status(400).json({ message: 'Invalid or expired magic link' });
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
      // Security best practice: don't reveal if email exists
      return res.json({ message: 'If email exists, reset link has been sent' });
    }

    // Generate reset token
    const resetToken = generateToken();
    const tokenDoc = new Token({
      email: email.toLowerCase(),
      token: resetToken,
      type: 'reset',
      expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
      used: false
    });
    await tokenDoc.save();

    try {
      await sendPasswordResetEmail(email.toLowerCase(), resetToken);
    } catch (emailError) {
      console.error('Password reset email error:', emailError);
      return res.status(500).json({ message: 'Failed to send reset email' });
    }

    res.json({ message: 'Password reset link sent to your email' });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Reset password
router.post('/reset-password', async (req, res) => {
  try {
    const { token, newPassword, confirmPassword } = req.body;

    if (!token || !newPassword || !confirmPassword) {
      return res.status(400).json({ message: 'Token, password, and confirmation required' });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ message: 'Passwords do not match' });
    }

    // Validate password strength
    const passwordError = validatePassword(newPassword);
    if (passwordError) {
      return res.status(400).json({ message: passwordError });
    }

    const tokenDoc = await Token.findOne({ 
      token, 
      type: 'reset', 
      used: false,
      expiresAt: { $gt: new Date() }
    });
    
    if (!tokenDoc) {
      return res.status(400).json({ message: 'Invalid or expired reset token' });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    const updateResult = await User.updateOne(
      { email: tokenDoc.email },
      { password: hashedPassword }
    );

    if (updateResult.matchedCount === 0) {
      return res.status(400).json({ message: 'User not found' });
    }

    // Mark token as used
    tokenDoc.used = true;
    await tokenDoc.save();

    res.json({ message: 'Password reset successfully. You can now log in.' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ message: 'Server error during password reset' });
  }
});

// Get profile
router.get('/profile', auth, async (req, res) => {
  try {
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