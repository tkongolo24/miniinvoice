const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: false,  // Changed: not required for Google users
    minlength: 6
  },
  googleId: {
    type: String,
    default: null,
    sparse: true
  },
  authMethod: {
    type: String,
    enum: ['password', 'google'],
    default: 'password'
  },
  emailVerified: {
    type: Boolean,
    default: false
  },
  companyName: {
    type: String,
    default: ''
  },
  phone: {
    type: String,
    default: ''
  },
  address: {
    type: String,
    default: ''
  },
  currency: {
    type: String,
    default: 'USD'
  },
  defaultTemplate: {
    type: String,
    enum: ['classic', 'modern', 'elegant'],
    default: 'classic'
  },
  businessRegNumber: {
    type: String,
    default: ''
  },
  contactEmail: {
    type: String,
    default: ''
  },
  logo: {
    type: String,
    default: ''
  },
  invoiceFooter: {
    type: String,
    default: '',
    maxlength: 500
  },
  profileCompleted: {
    type: Boolean,
    default: false
  },
  plan: {
    type: String,
    enum: ['free', 'pro', 'enterprise'],
    default: 'free'
  }
}, {
  timestamps: true
});

// Hash password before saving (only if password exists and is modified)
userSchema.pre('save', async function(next) {
  if (!this.password || !this.isModified('password')) {
    return next();
  }
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  if (!this.password) return false;
  return await bcrypt.compare(candidatePassword, this.password);
};

// Remove password from JSON response
userSchema.methods.toJSON = function() {
  const user = this.toObject();
  delete user.password;
  return user;
};

module.exports = mongoose.model('User', userSchema);