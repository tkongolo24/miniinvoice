const mongoose = require('mongoose');

const clientSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true, // For fast queries
    },
    name: {
      type: String,
      required: [true, 'Client name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Client email is required'],
      trim: true,
      lowercase: true,
      validate: {
        validator: function(v) {
          return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
        },
        message: 'Invalid email format'
      }
    },
    phone: {
      type: String,
      trim: true,
      default: '',
    },
    address: {
      type: String,
      trim: true,
      default: '',
    },
    city: {
      type: String,
      trim: true,
      default: '',
    },
    country: {
      type: String,
      trim: true,
      default: '',
    },
    vatNumber: {
      type: String,
      trim: true,
      default: '',
    },
    paymentTerms: {
      type: Number,
      default: 30, // Default: 30 days
      min: [0, 'Payment terms cannot be negative'],
      max: [365, 'Payment terms cannot exceed 365 days'],
    },
    notes: {
      type: String,
      trim: true,
      default: '',
      maxlength: [1000, 'Notes cannot exceed 1000 characters'],
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt
  }
);

// Index for faster searches
clientSchema.index({ userId: 1, name: 1 });
clientSchema.index({ userId: 1, email: 1 });

// Virtual for invoice count (we'll populate this in queries)
clientSchema.virtual('invoiceCount', {
  ref: 'Invoice',
  localField: '_id',
  foreignField: 'clientId',
  count: true,
});

// Ensure virtuals are included when converting to JSON
clientSchema.set('toJSON', { virtuals: true });
clientSchema.set('toObject', { virtuals: true });

const Client = mongoose.model('Client', clientSchema);

module.exports = Client;