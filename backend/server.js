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
// 🔔 SMART AUTO-REMINDER SYSTEM
// ============================================================

const Invoice = require('./models/invoice');
const User = require('./models/user');
const { sendPaymentReminderEmail } = require('./services/emailService');

/**
 * Smart reminder check function
 * Automatically calculates optimal reminder days based on invoice timeline
 */
const checkAndSendReminders = async () => {
  console.log('🔔 Running smart reminder check...', new Date().toISOString());
  
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Find all unpaid invoices with reminders enabled
    const invoices = await Invoice.find({
      status: 'unpaid',
      'reminderSettings.enabled': true
    }).populate('user', 'companyName email plan');

    if (invoices.length === 0) {
      console.log('📭 No invoices with reminders enabled');
      return;
    }

    console.log(`📊 Checking ${invoices.length} invoices with auto-reminders enabled`);

    let remindersSent = 0;
    let remindersSkipped = 0;

    for (const invoice of invoices) {
      try {
        const issueDate = new Date(invoice.dateIssued);
        issueDate.setHours(0, 0, 0, 0);
        
        const dueDate = new Date(invoice.dueDate);
        dueDate.setHours(0, 0, 0, 0);
        
        const daysUntilDue = Math.floor((dueDate - today) / (1000 * 60 * 60 * 24));
        const daysOverdue = -daysUntilDue;
        
        // Calculate timeline length (issue to due)
        const totalDaysUntilDue = Math.floor((dueDate - issueDate) / (1000 * 60 * 60 * 24));
        
        let reminderType = null;
        let shouldSend = false;
        let daysOffset = 0;

        // Check user's plan for limits
        const userPlan = invoice.user?.plan || 'free';
        const isFreeUser = userPlan === 'free';

        // FREE PLAN LIMIT: Only 1 reminder (on due date)
        if (isFreeUser && invoice.remindersSent.length >= 1) {
          remindersSkipped++;
          continue;
        }

        // ========================================
        // SMART AUTO-CALCULATION LOGIC
        // ========================================
        
        // BEFORE DUE REMINDERS
        if (daysUntilDue > 0) {
          // Long timeline (14+ days): 7 days + 3 days before
          if (totalDaysUntilDue >= 14) {
            if (daysUntilDue === 7) {
              reminderType = 'before_due';
              daysOffset = -7;
              shouldSend = true;
            } else if (daysUntilDue === 3) {
              reminderType = 'before_due';
              daysOffset = -3;
              shouldSend = true;
            }
          }
          // Medium timeline (7-13 days): 3 days + 1 day before
          else if (totalDaysUntilDue >= 7) {
            if (daysUntilDue === 3) {
              reminderType = 'before_due';
              daysOffset = -3;
              shouldSend = true;
            } else if (daysUntilDue === 1) {
              reminderType = 'before_due';
              daysOffset = -1;
              shouldSend = true;
            }
          }
          // Short timeline (3-6 days): 1 day before only
          else if (totalDaysUntilDue >= 3) {
            if (daysUntilDue === 1) {
              reminderType = 'before_due';
              daysOffset = -1;
              shouldSend = true;
            }
          }
          // Very short timeline (<3 days): no before reminders
        }
        
        // ON DUE DATE REMINDER
        else if (daysUntilDue === 0) {
          reminderType = 'on_due';
          daysOffset = 0;
          shouldSend = true;
        }
        
        // AFTER DUE REMINDERS (OVERDUE) - Always same schedule
        else if (daysOverdue > 0) {
          if (daysOverdue === 7) {
            reminderType = 'after_due';
            daysOffset = 7;
            shouldSend = true;
          } else if (daysOverdue === 14) {
            reminderType = 'after_due';
            daysOffset = 14;
            shouldSend = true;
          }
        }

        // Check if this specific reminder was already sent
        if (shouldSend && hasReminderBeenSent(invoice, reminderType, daysOffset)) {
          shouldSend = false;
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
            daysUntilDue: Math.abs(daysOffset),
            daysOverdue: daysOverdue > 0 ? daysOverdue : 0,
            reminderType,
            customMessage: invoice.customReminderMessage || {}
          };

          const companyName = invoice.user?.companyName || 'BillKazi User';
          
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

    console.log(`✅ Smart reminder check complete: ${remindersSent} sent, ${remindersSkipped} skipped`);
    
  } catch (error) {
    console.error('❌ Error in checkAndSendReminders:', error);
  }
};

/**
 * Helper function to check if a specific reminder was already sent
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
 * Runs every 6 hours at 00:00, 06:00, 12:00, 18:00
 */
const startReminderScheduler = () => {
  // Schedule: Run every 6 hours
  cron.schedule('0 */6 * * *', () => {
    checkAndSendReminders();
  });

  console.log('✅ Smart reminder scheduler started (runs every 6 hours at 00:00, 06:00, 12:00, 18:00)');
  
  // Optional: Run once on startup for testing
  if (process.env.RUN_REMINDERS_ON_START === 'true') {
    console.log('🔄 Running initial reminder check on startup...');
    setTimeout(checkAndSendReminders, 5000);
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