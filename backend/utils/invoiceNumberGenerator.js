/**
 * Generate invoice number in format: INV-YYMM-NNN
 * Example: INV-2601-001 (January 2026, invoice #1)
 * 
 * Counter resets monthly to keep numbers short and organized
 * Each user has independent counters
 */

const generateInvoiceNumber = async (user) => {
  try {
    // Get current year-month in YYMM format
    const now = new Date();
    const year = now.getFullYear().toString().slice(2); // '26' from 2026
    const month = (now.getMonth() + 1).toString().padStart(2, '0'); // '01' for January
    const yearMonth = `${year}${month}`; // '2601'
    
    // Initialize invoiceCounters Map if it doesn't exist
    if (!user.invoiceCounters) {
      user.invoiceCounters = new Map();
    }
    
    // Get current count for this month (or start at 0)
    const currentCount = user.invoiceCounters.get(yearMonth) || 0;
    const nextNumber = currentCount + 1;
    
    // Update counter for this month
    user.invoiceCounters.set(yearMonth, nextNumber);
    
    // Mark the path as modified (required for Map type)
    user.markModified('invoiceCounters');
    
    // Save user with updated counter
    await user.save();
    
    // Generate formatted invoice number: INV-2601-001
    const paddedNumber = nextNumber.toString().padStart(3, '0');
    return `INV-${yearMonth}-${paddedNumber}`;
    
  } catch (error) {
    console.error('Error generating invoice number:', error);
    // Fallback to timestamp if something goes wrong
    return `INV-${Date.now()}`;
  }
};

module.exports = { generateInvoiceNumber };