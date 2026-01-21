const mongoose = require('mongoose');

const invoiceSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    invoiceNumber: {
      type: String,
      required: true,
      unique: true,
    },
    // NEW: Reference to Client (optional for backward compatibility)
    clientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Client',
      default: null,
      index: true,
    },
    // Keep these for backward compatibility and manual entry
    clientName: {
      type: String,
      required: true,
    },
    clientEmail: {
      type: String,
      required: true,
    },
    clientAddress: {
      type: String,
      default: '',
    },
    dateIssued: {
      type: Date,
      required: true,
      default: Date.now,
    },
    dueDate: {
      type: Date,
      required: true,
    },
    items: [
        {
          description: {
            type: String,
            required: true,
          },
          quantity: {
            type: Number,
            required: true,
            min: 1,
          },
          unitPrice: {
            type: Number,
            required: true,
            min: 0,
          },
          productId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',
            default: null,
          },
          taxable: {
            type: Boolean,
            default: true, // Default to taxable
          },
        },
      ],
    subtotal: {
      type: Number,
      required: true,
      default: 0,
    },
    taxRate: {
      type: Number,
      default: 18,
    },
    tax: {
      type: Number,
      default: 0,
    },
    netAmount: {
      type: Number,
      default: 0,
    },
    discount: {
      type: Number,
      default: 0,
    },
    discountType: {
      type: String,
      enum: ['percentage', 'fixed'],
      default: 'percentage',
    },
    hasDiscount: {
      type: Boolean,
      default: false,
    },
    total: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      enum: ['RWF', 'KES', 'NGN', 'CFA'],
      default: 'RWF',
    },
    status: {
      type: String,
      enum: ['paid', 'unpaid', 'overdue'],
      default: 'unpaid',
    },
    notes: {
      type: String,
      default: '',
    },
    template: {
      type: String,
      enum: ['classic', 'modern', 'elegant'],
      default: 'classic',
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
invoiceSchema.index({ userId: 1, status: 1 });
invoiceSchema.index({ userId: 1, clientId: 1 });
invoiceSchema.index({ invoiceNumber: 1 });

const Invoice = mongoose.model('Invoice', invoiceSchema);

module.exports = Invoice;