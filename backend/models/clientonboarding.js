const mongoose = require('mongoose');
const crypto = require('crypto');

const clientOnboardingSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    token: {
      type: String,
      required: true,
      unique: true,
      index: true,
      default: () => crypto.randomBytes(16).toString('hex'),
    },
    status: {
      type: String,
      enum: ['pending', 'completed', 'expired'],
      default: 'pending',
      index: true,
    },
    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      index: true,
    },
    submittedData: {
      name: { type: String, default: '' },
      email: { type: String, default: '' },
      phone: { type: String, default: '' },
      address: { type: String, default: '' },
      city: { type: String, default: '' },
      country: { type: String, default: '' },
      vatNumber: { type: String, default: '' },
      notes: { type: String, default: '' },
    },
    clientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Client',
      default: null,
    },
    submittedAt: {
      type: Date,
      default: null,
    },
    notificationSent: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
clientOnboardingSchema.index({ userId: 1, status: 1 });
clientOnboardingSchema.index({ token: 1 });

// Check if expired
clientOnboardingSchema.methods.isExpired = function() {
  return this.status === 'expired' || new Date() > this.expiresAt;
};

// Mark as completed
clientOnboardingSchema.methods.markCompleted = function(clientId) {
  this.status = 'completed';
  this.clientId = clientId;
  this.submittedAt = new Date();
  return this.save();
};

const ClientOnboarding = mongoose.model('ClientOnboarding', clientOnboardingSchema);

module.exports = ClientOnboarding;