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
    clientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Client',
      default: null,
      index: true,
    },
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
          default: true,
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
      enum: ['RWF', 'KES', 'NGN', 'XOF', 'XAF', 'CFA', 'USD', 'EUR', 'GBP'],
      default: 'RWF',
    },
    status: {
      type: String,
      enum: ['paid', 'unpaid', 'overdue'],
      default: 'unpaid',
    },
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
    shareToken: {
      type: String,
      default: null,
      unique: true,
      sparse: true,
    },
    // 🔔 SMART AUTO-REMINDERS
    reminderSettings: {
      enabled: {
        type: Boolean,
        default: false,
      },
      mode: {
        type: String,
        enum: ['auto'],
        default: 'auto',
      },
    },
    // 🔔 CUSTOM MESSAGE
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
    // 🔔 TRACK SENT REMINDERS
    remindersSent: [
      {
        type: {
          type: String,
          enum: ['before_due', 'on_due', 'after_due'],
          required: true,
        },
        daysOffset: {
          type: Number,
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

invoiceSchema.index({ userId: 1, status: 1 });
invoiceSchema.index({ userId: 1, clientId: 1 });
invoiceSchema.index({ invoiceNumber: 1 });
invoiceSchema.index({ shareToken: 1 });
invoiceSchema.index({ 'reminderSettings.enabled': 1, status: 1, dueDate: 1 });

const Invoice = mongoose.model('Invoice', invoiceSchema);

module.exports = Invoice;