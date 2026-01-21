const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    unitPrice: {
      type: Number,
      required: [true, 'Unit price is required'],
      min: [0, 'Price cannot be negative'],
    },
    currency: {
      type: String,
      enum: ['RWF', 'KES', 'NGN', 'CFA'],
      default: 'RWF',
    },
    category: {
      type: String,
      trim: true,
      default: '',
      maxlength: [50, 'Category cannot exceed 50 characters'],
    },
    sku: {
      type: String,
      trim: true,
      default: '',
      maxlength: [50, 'SKU cannot exceed 50 characters'],
    },
    taxable: {
      type: Boolean,
      default: true,
    },
    notes: {
      type: String,
      trim: true,
      default: '',
      maxlength: [500, 'Notes cannot exceed 500 characters'],
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for faster searches
productSchema.index({ userId: 1, name: 1 });
productSchema.index({ userId: 1, category: 1 });

// Virtual for usage count (optional - can add later)
productSchema.virtual('usageCount', {
  ref: 'Invoice',
  localField: '_id',
  foreignField: 'items.productId',
  count: true,
});

productSchema.set('toJSON', { virtuals: true });
productSchema.set('toObject', { virtuals: true });

const Product = mongoose.model('Product', productSchema);

module.exports = Product;