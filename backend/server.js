require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const cron = require('node-cron');

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

// ============================================================
// 🔔 ENHANCED PAYMENT REMINDER SYSTEM
// ============================================================

const Invoice = require('./models/invoice');
const User = require('./models/user');
const { sendPaymentReminderEmail } = require('./services/emailService');

/**
 * Main reminder check function
 * Runs every 6 hours to check for invoices needing reminders
 */
const checkAndSendReminders = async () => {
  console.log('🔔 Running payment reminder check...', new Date().toISOString());
  
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Start of today
    
    // Find all unpaid invoices with reminders enabled
    const invoices = await Invoice.find({
      status: 'unpaid',
      'reminderSettings.enabled': true
    }).populate('user', 'companyName email plan');

    if (invoices.length === 0) {
      console.log('📭 No invoices with reminders enabled');
      return;
    }

    console.log(`📊 Checking ${invoices.length} invoices with reminders enabled`);

    let remindersSent = 0;
    let remindersSkipped = 0;

    for (const invoice of invoices) {
      try {
        const dueDate = new Date(invoice.dueDate);
        dueDate.setHours(0, 0, 0, 0);
        
        const daysUntilDue = Math.floor((dueDate - today) / (1000 * 60 * 60 * 24));
        const daysOverdue = -daysUntilDue; // Positive if overdue
        
        let reminderType = null;
        let shouldSend = false;

        // Check user's plan for limits
        const userPlan = invoice.user?.plan || 'free';
        const isFreeUser = userPlan === 'free';

        // FREE PLAN LIMIT: Only 1 reminder (on due date)
        if (isFreeUser && invoice.remindersSent.length >= 1) {
          remindersSkipped++;
          continue;
        }

        // ========================================
        // 1. BEFORE DUE REMINDERS
        // ========================================
        if (daysUntilDue > 0) {
          const beforeDueDays = invoice.reminderSettings.beforeDue || [];
          
          // Check if today matches any of the configured "before due" days
          if (beforeDueDays.includes(daysUntilDue)) {
            if (!hasReminderBeenSent(invoice, 'before_due', -daysUntilDue)) {
              reminderType = 'before_due';
              shouldSend = true;
            }
          }
        }
        
        // ========================================
        // 2. ON DUE DATE REMINDER
        // ========================================
        else if (daysUntilDue === 0 && invoice.reminderSettings.onDue) {
          if (!hasReminderBeenSent(invoice, 'on_due', 0)) {
            reminderType = 'on_due';
            shouldSend = true;
          }
        }
        
        // ========================================
        // 3. AFTER DUE REMINDERS (OVERDUE)
        // ========================================
        else if (daysOverdue > 0) {
          const afterDueDays = invoice.reminderSettings.afterDue || [];
          
          // Check if today matches any of the configured "after due" days
          if (afterDueDays.includes(daysOverdue)) {
            if (!hasReminderBeenSent(invoice, 'after_due', daysOverdue)) {
              reminderType = 'after_due';
              shouldSend = true;
            }
          }
        }

        // ========================================
        // SEND REMINDER
        // ========================================
        if (shouldSend && reminderType) {
          const invoiceData = {
            invoiceNumber: invoice.invoiceNumber,
            clientName: invoice.clientName,
            clientEmail: invoice.clientEmail,
            total: invoice.total,
            currency: invoice.currency,
            dueDate: invoice.dueDate,
            daysUntilDue,
            daysOverdue: daysOverdue > 0 ? daysOverdue : 0,
            reminderType,
            // ADD: Custom message fields
            customMessage: invoice.customReminderMessage || {}
          };

          const companyName = invoice.user?.companyName || 'BillKazi User';
          
          // Calculate daysOffset for tracking
          let daysOffset = 0;
          if (reminderType === 'before_due') {
            daysOffset = -daysUntilDue;
          } else if (reminderType === 'on_due') {
            daysOffset = 0;
          } else if (reminderType === 'after_due') {
            daysOffset = daysOverdue;
          }
          
          // Send email
          const sent = await sendPaymentReminderEmail(
            invoice.clientEmail,
            invoiceData,
            companyName,
            reminderType
          );

          if (sent) {
            // Track the reminder
            invoice.remindersSent.push({
              type: reminderType,
              daysOffset: daysOffset,
              sentAt: new Date(),
              status: 'sent'
            });
            
            await invoice.save();
            
            remindersSent++;
            console.log(`✅ Sent ${reminderType} (${daysOffset > 0 ? '+' : ''}${daysOffset} days) reminder for invoice #${invoice.invoiceNumber}`);
          } else {
            // Log failed reminder
            invoice.remindersSent.push({
              type: reminderType,
              daysOffset: daysOffset,
              sentAt: new Date(),
              status: 'failed',
              error: 'Email sending failed'
            });
            
            await invoice.save();
            console.log(`❌ Failed to send ${reminderType} reminder for invoice #${invoice.invoiceNumber}`);
          }
        }
      } catch (error) {
        console.error(`❌ Error processing invoice #${invoice.invoiceNumber}:`, error.message);
      }
    }

    console.log(`✅ Reminder check complete: ${remindersSent} sent, ${remindersSkipped} skipped`);
    
  } catch (error) {
    console.error('❌ Error in checkAndSendReminders:', error);
  }
};

/**
 * Helper function to check if a specific reminder type has been sent
 * @param {Object} invoice - The invoice document
 * @param {String} reminderType - 'before_due', 'on_due', or 'after_due'
 * @param {Number} daysOffset - Days offset (e.g., -7, 0, 7)
 */
function hasReminderBeenSent(invoice, reminderType, daysOffset) {
  return invoice.remindersSent.some(
    reminder => 
      reminder.type === reminderType && 
      reminder.daysOffset === daysOffset &&
      reminder.status === 'sent'
  );
}

/**
 * Start the reminder scheduler
 * Runs every 6 hours
 */
const startReminderScheduler = () => {
  // Schedule: Run every 6 hours (at 00:00, 06:00, 12:00, 18:00)
  cron.schedule('0 */6 * * *', () => {
    checkAndSendReminders();
  });

  console.log('✅ Payment reminder scheduler started (runs every 6 hours at 00:00, 06:00, 12:00, 18:00)');
  
  // Optional: Run once on startup (for testing)
  if (process.env.RUN_REMINDERS_ON_START === 'true') {
    console.log('🔄 Running initial reminder check on startup...');
    setTimeout(checkAndSendReminders, 5000); // Wait 5 seconds after startup
  }
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