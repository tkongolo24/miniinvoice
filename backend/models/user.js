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
    enum: ['free', 'pro'],
    default: 'free'
  },
  // PAYMENT REMINDERS: Subscription tracking
  subscriptionStatus: {
    type: String,
    enum: ['active', 'cancelled', 'expired', 'trial'],
    default: 'active'
  },
  subscriptionStartDate: {
    type: Date,
    default: null
  },
  subscriptionEndDate: {
    type: Date,
    default: null
  },
  // 🚀 PAYMENT REMINDERS: Usage limits for free tier
  monthlyRemindersSent: {
    type: Number,
    default: 0
  },
  reminderResetDate: {
    type: Date,
    default: () => {
      const date = new Date();
      date.setMonth(date.getMonth() + 1);
      date.setDate(1);
      date.setHours(0, 0, 0, 0);
      return date;
    }
  },
  invoiceCounters: {
    type: Map,
    of: Number,
    default: new Map()
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

// 🚀 PAYMENT REMINDERS: Helper method to check if user can send reminders
userSchema.methods.canSendReminder = function() {
  // Pro and Enterprise users have unlimited reminders
  if (this.plan === 'pro' || this.plan === 'enterprise') {
    return true;
  }
  
  // Free users: check monthly limit (10 reminders/month)
  const FREE_MONTHLY_LIMIT = 10;
  
  // Reset counter if we've passed the reset date
  if (new Date() >= this.reminderResetDate) {
    this.monthlyRemindersSent = 0;
    const nextResetDate = new Date();
    nextResetDate.setMonth(nextResetDate.getMonth() + 1);
    nextResetDate.setDate(1);
    nextResetDate.setHours(0, 0, 0, 0);
    this.reminderResetDate = nextResetDate;
  }
  
  return this.monthlyRemindersSent < FREE_MONTHLY_LIMIT;
};

// 🚀 PAYMENT REMINDERS: Helper method to increment reminder count
userSchema.methods.incrementReminderCount = async function() {
  this.monthlyRemindersSent += 1;
  await this.save();
};

module.exports = mongoose.model('User', userSchema);