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
    // PHASE 2: Expanded currency support
    currency: {
      type: String,
      enum: ['RWF', 'KES', 'NGN', 'XOF', 'XAF', 'CFA', 'USD', 'EUR', 'GBP'],
      default: 'RWF',
    },
    status: {
      type: String,
      enum: ['paid', 'unpaid', 'overdue'],
      default: 'unpaid',
    },
    // PHASE 2: Payment tracking fields
    paymentDate: {
      type: Date,
      default: null,
    },
    paymentMethod: {
      type: String,
      enum: ['bank_transfer', 'mobile_money', 'cash', 'card', 'other'],
      default: null,
    },
    paymentNotes: {
      type: String,
      default: '',
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
    // NEW: Share token for public invoice links
    shareToken: {
      type: String,
      default: null,
      unique: true,
      sparse: true,
    },
    // 🚀 PAYMENT REMINDERS: Settings for automated email reminders
    reminderSettings: {
      enabled: {
        type: Boolean,
        default: false,
      },
      beforeDue: {
        type: [Number], // Days before due date [3, 7]
        default: [],
      },
      onDue: {
        type: Boolean,
        default: false,
      },
      afterDue: {
        type: [Number], // Days after due date [7, 14]
        default: [],
      },
    },
    // 🚀 PAYMENT REMINDERS: Custom message fields
    customReminderMessage: {
      paymentInstructions: {
        type: String,
        default: '',
        maxlength: 500,
      },
      contactInfo: {
        type: String,
        default: '',
        maxlength: 200,
      },
    },
    // 🚀 PAYMENT REMINDERS: Track which reminders have been sent
    remindersSent: [
      {
        type: {
          type: String,
          enum: ['before_due', 'on_due', 'after_due'],
          required: true,
        },
        daysOffset: {
          type: Number, // e.g., -7 (7 days before), 0 (on due), 7 (7 days after)
          required: true,
        },
        sentAt: {
          type: Date,
          required: true,
          default: Date.now,
        },
        status: {
          type: String,
          enum: ['sent', 'failed'],
          default: 'sent',
        },
        error: {
          type: String,
          default: null,
        },
      },
    ],
    // 🚀 ANALYTICS: Track invoice views
    viewCount: {
      type: Number,
      default: 0,
    },
    lastViewedAt: {
      type: Date,
      default: null,
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
invoiceSchema.index({ shareToken: 1 });
// NEW: Index for reminder cron jobs
invoiceSchema.index({ 'reminderSettings.enabled': 1, status: 1, dueDate: 1 });

const Invoice = mongoose.model('Invoice', invoiceSchema);

module.exports = Invoice;