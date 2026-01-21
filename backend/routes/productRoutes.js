const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Product = require('../models/product');

// All routes require authentication
router.use(auth);

// CREATE new product
router.post('/', async (req, res) => {
  try {
    const {
      name,
      description,
      unitPrice,
      currency,
      category,
      sku,
      taxable,
      notes,
    } = req.body;

    // Validate required fields
    if (!name?.trim()) {
      return res.status(400).json({ message: 'Product name is required' });
    }

    if (!unitPrice || unitPrice < 0) {
      return res.status(400).json({ message: 'Valid unit price is required' });
    }

    // Check if product with same name already exists for this user
    const existingProduct = await Product.findOne({
      userId: req.userId,
      name: name.trim(),
    });

    if (existingProduct) {
      return res.status(400).json({
        message: 'A product with this name already exists',
      });
    }

    const product = await Product.create({
      userId: req.userId,
      name: name.trim(),
      description: description?.trim() || '',
      unitPrice: parseFloat(unitPrice),
      currency: currency || 'RWF',
      category: category?.trim() || '',
      sku: sku?.trim() || '',
      taxable: taxable !== undefined ? taxable : true,
      notes: notes?.trim() || '',
    });

    res.status(201).json(product);
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({
      message: 'Failed to create product',
      error: error.message,
    });
  }
});

// GET all products
router.get('/', async (req, res) => {
  try {
    const { search, category, currency } = req.query;
    const query = { userId: req.userId };

    // Search filter
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { sku: { $regex: search, $options: 'i' } },
      ];
    }

    // Category filter
    if (category) {
      query.category = category;
    }

    // Currency filter
    if (currency) {
      query.currency = currency;
    }

    const products = await Product.find(query)
      .sort({ name: 1 })
      .lean();

    res.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({
      message: 'Failed to fetch products',
      error: error.message,
    });
  }
});

// GET single product by ID
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findOne({
      _id: req.params.id,
      userId: req.userId,
    });

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json(product);
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({
      message: 'Failed to fetch product',
      error: error.message,
    });
  }
});

// UPDATE product
router.put('/:id', async (req, res) => {
  try {
    const {
      name,
      description,
      unitPrice,
      currency,
      category,
      sku,
      taxable,
      notes,
    } = req.body;

    const product = await Product.findOne({
      _id: req.params.id,
      userId: req.userId,
    });

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Check if name is being changed and if it already exists
    if (name && name.trim() !== product.name) {
      const existingProduct = await Product.findOne({
        userId: req.userId,
        name: name.trim(),
        _id: { $ne: product._id },
      });

      if (existingProduct) {
        return res.status(400).json({
          message: 'A product with this name already exists',
        });
      }
    }

    // Update fields
    if (name) product.name = name.trim();
    if (description !== undefined) product.description = description.trim();
    if (unitPrice !== undefined) product.unitPrice = parseFloat(unitPrice);
    if (currency) product.currency = currency;
    if (category !== undefined) product.category = category.trim();
    if (sku !== undefined) product.sku = sku.trim();
    if (taxable !== undefined) product.taxable = taxable;
    if (notes !== undefined) product.notes = notes.trim();

    await product.save();
    res.json(product);
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({
      message: 'Failed to update product',
      error: error.message,
    });
  }
});

// DELETE product
router.delete('/:id', async (req, res) => {
  try {
    const product = await Product.findOne({
      _id: req.params.id,
      userId: req.userId,
    });

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Optional: Check if product is used in any invoices
    // const Invoice = require('../models/invoice');
    // const usageCount = await Invoice.countDocuments({
    //   userId: req.userId,
    //   'items.productId': product._id,
    // });
    //
    // if (usageCount > 0) {
    //   return res.status(400).json({
    //     message: `Cannot delete product. It's used in ${usageCount} invoice(s).`,
    //     usageCount,
    //   });
    // }

    await product.deleteOne();

    res.json({
      message: 'Product deleted successfully',
      deletedProduct: product,
    });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({
      message: 'Failed to delete product',
      error: error.message,
    });
  }
});

module.exports = router;