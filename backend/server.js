require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');

// Validate required environment variables
const requiredEnvVars = ['MONGODB_URI', 'JWT_SECRET'];
const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingEnvVars.length > 0) {
  console.error('❌ Missing required environment variables:', missingEnvVars.join(', '));
  console.error('Please check your .env file');
  process.exit(1);
}

console.log('✅ Environment variables validated');

const app = express();
app.set('trust proxy', 1);

// Security Middleware
app.use(helmet());
app.use(mongoSanitize());

// CORS Configuration
const allowedOrigins = [
  'http://localhost:5173',
  'https://gp5mjphq-5173.uks1.devtunnels.ms',
  'https://billkazi.vercel.app',
  'https://billkazi.me',
  'https://www.billkazi.me'
];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin) || /https:\/\/billkazi.*\.vercel\.app$/.test(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
};
app.use(cors(corsOptions));

// Body Parser (MUST come before routes!)
app.use(express.json());

// Serve uploaded files (logos)
app.use('/uploads', express.static('uploads'));

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// Stricter rate limit for auth routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  skipSuccessfulRequests: true,
  message: 'Too many login attempts, please try again later.'
});

// Import Routes 
const authRoutes = require('./routes/auth');
const invoiceRoutes = require('./routes/invoices');
const settingsRoutes = require('./routes/settings');
const clientRoutes = require('./routes/clientRoutes');
const productRoutes = require('./routes/productRoutes');

// Register Routes 
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);
app.use('/api/auth', authRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/products', productRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(err.status || 500).json({ 
    message: process.env.NODE_ENV === 'production' 
      ? 'Internal server error' 
      : err.message 
  });
});

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('✅ MongoDB connected');
    startReminderScheduler();
  })
  .catch(err => {
    console.error('❌ MongoDB connection error:', err.message);
    process.exit(1);
  });

// Payment Reminder Scheduler
const Invoice = require('./models/invoice');
const User = require('./models/user');
const { sendPaymentReminderEmail } = require('./services/emailService');

const sendPaymentReminders = async () => {
  console.log('🔔 Running payment reminder check...');
  
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const overdueInvoices = await Invoice.find({
      status: 'unpaid',
      reminderEnabled: true,
      dueDate: { $lte: today },
      remindersSent: { $lt: 3 },
      $or: [
        { lastReminderSent: null },
        { lastReminderSent: { $lte: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) } }
      ]
    }).populate('user', 'companyName');

    console.log(`📧 Found ${overdueInvoices.length} invoices needing reminders`);

    for (const invoice of overdueInvoices) {
      const daysOverdue = Math.floor((today - new Date(invoice.dueDate)) / (1000 * 60 * 60 * 24));
      
      const invoiceData = {
        invoiceNumber: invoice.invoiceNumber,
        clientName: invoice.clientName,
        total: invoice.total,
        currency: invoice.currency,
        dueDate: invoice.dueDate,
        daysOverdue
      };

      const companyName = invoice.user?.companyName || '';
      
      const sent = await sendPaymentReminderEmail(
        invoice.clientEmail,
        invoiceData,
        companyName
      );

      if (sent) {
        invoice.remindersSent += 1;
        invoice.lastReminderSent = new Date();
        await invoice.save();
        console.log(`✅ Reminder sent for invoice #${invoice.invoiceNumber}`);
      } else {
        console.log(`❌ Failed to send reminder for invoice #${invoice.invoiceNumber}`);
      }
    }
  } catch (error) {
    console.error('❌ Error sending payment reminders:', error);
  }
};

const startReminderScheduler = () => {
  setInterval(sendPaymentReminders, 6 * 60 * 60 * 1000);
  console.log('✅ Payment reminder scheduler started (runs every 6 hours)');
};

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  mongoose.connection.close(false, () => {
    console.log('MongoDB connection closed');
    process.exit(0);
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
});

process.on('unhandledRejection', (err) => {
  console.error('Unhandled Promise Rejection:', err);
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
});