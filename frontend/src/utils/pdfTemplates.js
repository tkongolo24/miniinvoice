import jsPDF from 'jspdf';
import 'jspdf-autotable';

// TEMPLATE 1: CLASSIC - Traditional professional layout
export const generateClassicPDF = (invoice, companyInfo) => {
  const doc = new jsPDF();
  
  // Header with company name
  doc.setFillColor(41, 98, 255);
  doc.rect(0, 0, 210, 40, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont(undefined, 'bold');
  doc.text(companyInfo.companyName || 'Your Company', 20, 25);
  
  doc.setFontSize(10);
  doc.setFont(undefined, 'normal');
  doc.text(companyInfo.email || '', 20, 32);
  
  // Invoice title
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(20);
  doc.setFont(undefined, 'bold');
  doc.text('INVOICE', 150, 25);
  
  // Invoice details box
  doc.setFontSize(10);
  doc.setFont(undefined, 'normal');
  doc.text(`Invoice #: ${invoice.invoiceNumber}`, 150, 32);
  doc.text(`Date: ${new Date(invoice.dateIssued).toLocaleDateString()}`, 150, 37);
  
  // Bill To section
  doc.setFontSize(12);
  doc.setFont(undefined, 'bold');
  doc.text('Bill To:', 20, 55);
  
  doc.setFontSize(10);
  doc.setFont(undefined, 'normal');
  doc.text(invoice.clientName, 20, 62);
  doc.text(invoice.clientEmail, 20, 67);
  if (invoice.clientAddress) {
    doc.text(invoice.clientAddress, 20, 72);
  }
  
  // Items table
  const tableData = invoice.items.map(item => [
    item.description,
    item.quantity.toString(),
    `$${item.unitPrice.toFixed(2)}`,
    `$${(item.quantity * item.unitPrice).toFixed(2)}`
  ]);
  
  doc.autoTable({
    startY: 85,
    head: [['Description', 'Quantity', 'Unit Price', 'Amount']],
    body: tableData,
    theme: 'striped',
    headStyles: { fillColor: [41, 98, 255], textColor: 255 },
    styles: { fontSize: 10 },
    columnStyles: {
      0: { cellWidth: 80 },
      1: { cellWidth: 30, halign: 'center' },
      2: { cellWidth: 40, halign: 'right' },
      3: { cellWidth: 40, halign: 'right' }
    }
  });
  
  // Totals
  const finalY = doc.lastAutoTable.finalY + 10;
  
  doc.setFont(undefined, 'normal');
  doc.text('Subtotal:', 130, finalY);
  doc.text(`$${invoice.subtotal.toFixed(2)}`, 180, finalY, { align: 'right' });
  
  doc.text(`Tax (${invoice.taxRate}%):`, 130, finalY + 7);
  doc.text(`$${invoice.taxAmount.toFixed(2)}`, 180, finalY + 7, { align: 'right' });
  
  doc.setFont(undefined, 'bold');
  doc.setFontSize(12);
  doc.text('Total:', 130, finalY + 15);
  doc.text(`$${invoice.total.toFixed(2)}`, 180, finalY + 15, { align: 'right' });
  
  // Notes
  if (invoice.notes) {
    doc.setFontSize(10);
    doc.setFont(undefined, 'bold');
    doc.text('Notes:', 20, finalY + 30);
    doc.setFont(undefined, 'normal');
    const splitNotes = doc.splitTextToSize(invoice.notes, 170);
    doc.text(splitNotes, 20, finalY + 37);
  }
  
  // Footer
  doc.setFontSize(8);
  doc.setTextColor(128, 128, 128);
  doc.text('Thank you for your business!', 105, 280, { align: 'center' });
  
  return doc;
};

// TEMPLATE 2: MODERN - Clean minimalist with bold typography
export const generateModernPDF = (invoice, companyInfo) => {
  const doc = new jsPDF();
  
  // Minimal header
  doc.setFontSize(28);
  doc.setFont(undefined, 'bold');
  doc.text(companyInfo.companyName || 'Your Company', 20, 25);
  
  doc.setFontSize(9);
  doc.setFont(undefined, 'normal');
  doc.setTextColor(100, 100, 100);
  doc.text(companyInfo.email || '', 20, 32);
  doc.text(companyInfo.phone || '', 20, 37);
  
  // Invoice number - large and bold
  doc.setFontSize(36);
  doc.setFont(undefined, 'bold');
  doc.setTextColor(0, 0, 0);
  doc.text(`#${invoice.invoiceNumber}`, 150, 30);
  
  doc.setFontSize(9);
  doc.setFont(undefined, 'normal');
  doc.setTextColor(100, 100, 100);
  doc.text(new Date(invoice.dateIssued).toLocaleDateString(), 150, 37);
  
  // Thin divider line
  doc.setDrawColor(220, 220, 220);
  doc.setLineWidth(0.5);
  doc.line(20, 45, 190, 45);
  
  // Client info - clean layout
  doc.setFontSize(8);
  doc.setTextColor(100, 100, 100);
  doc.text('BILLED TO', 20, 55);
  
  doc.setFontSize(11);
  doc.setFont(undefined, 'bold');
  doc.setTextColor(0, 0, 0);
  doc.text(invoice.clientName, 20, 62);
  
  doc.setFontSize(9);
  doc.setFont(undefined, 'normal');
  doc.setTextColor(100, 100, 100);
  doc.text(invoice.clientEmail, 20, 68);
  if (invoice.clientAddress) {
    doc.text(invoice.clientAddress, 20, 74);
  }
  
  // Items table - minimal design
  const tableData = invoice.items.map(item => [
    item.description,
    item.quantity.toString(),
    `$${item.unitPrice.toFixed(2)}`,
    `$${(item.quantity * item.unitPrice).toFixed(2)}`
  ]);
  
  doc.autoTable({
    startY: 85,
    head: [['Description', 'Qty', 'Rate', 'Amount']],
    body: tableData,
    theme: 'plain',
    headStyles: { 
      fillColor: [245, 245, 245],
      textColor: [0, 0, 0],
      fontStyle: 'bold',
      fontSize: 9
    },
    styles: { 
      fontSize: 10,
      cellPadding: 8
    },
    columnStyles: {
      0: { cellWidth: 90 },
      1: { cellWidth: 25, halign: 'center' },
      2: { cellWidth: 35, halign: 'right' },
      3: { cellWidth: 40, halign: 'right', fontStyle: 'bold' }
    }
  });
  
  // Totals - right aligned, minimal
  const finalY = doc.lastAutoTable.finalY + 15;
  
  doc.setDrawColor(220, 220, 220);
  doc.line(130, finalY - 5, 190, finalY - 5);
  
  doc.setFontSize(10);
  doc.setFont(undefined, 'normal');
  doc.setTextColor(100, 100, 100);
  doc.text('Subtotal', 130, finalY);
  doc.setTextColor(0, 0, 0);
  doc.text(`$${invoice.subtotal.toFixed(2)}`, 185, finalY, { align: 'right' });
  
  doc.setTextColor(100, 100, 100);
  doc.text(`Tax (${invoice.taxRate}%)`, 130, finalY + 7);
  doc.setTextColor(0, 0, 0);
  doc.text(`$${invoice.taxAmount.toFixed(2)}`, 185, finalY + 7, { align: 'right' });
  
  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(1);
  doc.line(130, finalY + 12, 190, finalY + 12);
  
  doc.setFontSize(14);
  doc.setFont(undefined, 'bold');
  doc.text('Total', 130, finalY + 20);
  doc.text(`$${invoice.total.toFixed(2)}`, 185, finalY + 20, { align: 'right' });
  
  // Notes
  if (invoice.notes) {
    doc.setFontSize(9);
    doc.setFont(undefined, 'normal');
    doc.setTextColor(100, 100, 100);
    doc.text('NOTES', 20, finalY + 35);
    doc.setTextColor(0, 0, 0);
    const splitNotes = doc.splitTextToSize(invoice.notes, 170);
    doc.text(splitNotes, 20, finalY + 42);
  }
  
  return doc;
};

// TEMPLATE 3: ELEGANT - Sophisticated with subtle colors
export const generateElegantPDF = (invoice, companyInfo) => {
  const doc = new jsPDF();
  
  // Elegant header with subtle color
  doc.setFillColor(248, 249, 250);
  doc.rect(0, 0, 210, 50, 'F');
  
  // Decorative line
  doc.setFillColor(139, 92, 246);
  doc.rect(0, 0, 5, 50, 'F');
  
  // Company name - elegant typography
  doc.setFontSize(22);
  doc.setFont(undefined, 'bold');
  doc.setTextColor(30, 30, 30);
  doc.text(companyInfo.companyName || 'Your Company', 20, 22);
  
  doc.setFontSize(9);
  doc.setFont(undefined, 'normal');
  doc.setTextColor(100, 100, 100);
  doc.text(companyInfo.email || '', 20, 30);
  doc.text(companyInfo.phone || '', 20, 35);
  doc.text(companyInfo.address || '', 20, 40);
  
  // Invoice label
  doc.setFontSize(11);
  doc.setTextColor(139, 92, 246);
  doc.text('INVOICE', 150, 22);
  
  doc.setFontSize(10);
  doc.setFont(undefined, 'bold');
  doc.setTextColor(30, 30, 30);
  doc.text(`#${invoice.invoiceNumber}`, 150, 30);
  
  doc.setFont(undefined, 'normal');
  doc.setFontSize(9);
  doc.setTextColor(100, 100, 100);
  doc.text(`Issue Date: ${new Date(invoice.dateIssued).toLocaleDateString()}`, 150, 36);
  doc.text(`Due Date: ${new Date(invoice.dueDate).toLocaleDateString()}`, 150, 41);
  
  // Client section with elegant box
  doc.setFillColor(252, 252, 253);
  doc.rect(20, 60, 85, 30, 'F');
  
  doc.setFontSize(8);
  doc.setTextColor(139, 92, 246);
  doc.text('BILL TO', 25, 67);
  
  doc.setFontSize(11);
  doc.setFont(undefined, 'bold');
  doc.setTextColor(30, 30, 30);
  doc.text(invoice.clientName, 25, 75);
  
  doc.setFontSize(9);
  doc.setFont(undefined, 'normal');
  doc.setTextColor(100, 100, 100);
  doc.text(invoice.clientEmail, 25, 81);
  if (invoice.clientAddress) {
    const splitAddress = doc.splitTextToSize(invoice.clientAddress, 75);
    doc.text(splitAddress, 25, 86);
  }
  
  // Items table - elegant styling
  const tableData = invoice.items.map(item => [
    item.description,
    item.quantity.toString(),
    `$${item.unitPrice.toFixed(2)}`,
    `$${(item.quantity * item.unitPrice).toFixed(2)}`
  ]);
  
  doc.autoTable({
    startY: 105,
    head: [['Description', 'Qty', 'Rate', 'Amount']],
    body: tableData,
    theme: 'plain',
    headStyles: { 
      fillColor: [139, 92, 246],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 9
    },
    styles: { 
      fontSize: 10,
      cellPadding: 6,
      lineColor: [230, 230, 230],
      lineWidth: 0.1
    },
    columnStyles: {
      0: { cellWidth: 85 },
      1: { cellWidth: 25, halign: 'center' },
      2: { cellWidth: 40, halign: 'right' },
      3: { cellWidth: 40, halign: 'right' }
    },
    alternateRowStyles: {
      fillColor: [252, 252, 253]
    }
  });
  
  // Totals with elegant box
  const finalY = doc.lastAutoTable.finalY + 15;
  
  doc.setFillColor(252, 252, 253);
  doc.rect(125, finalY - 5, 65, 35, 'F');
  
  doc.setFontSize(10);
  doc.setFont(undefined, 'normal');
  doc.setTextColor(100, 100, 100);
  doc.text('Subtotal', 130, finalY + 3);
  doc.setTextColor(30, 30, 30);
  doc.text(`$${invoice.subtotal.toFixed(2)}`, 185, finalY + 3, { align: 'right' });
  
  doc.setTextColor(100, 100, 100);
  doc.text(`Tax (${invoice.taxRate}%)`, 130, finalY + 10);
  doc.setTextColor(30, 30, 30);
  doc.text(`$${invoice.taxAmount.toFixed(2)}`, 185, finalY + 10, { align: 'right' });
  
  doc.setDrawColor(139, 92, 246);
  doc.setLineWidth(0.5);
  doc.line(130, finalY + 15, 185, finalY + 15);
  
  doc.setFontSize(12);
  doc.setFont(undefined, 'bold');
  doc.setTextColor(139, 92, 246);
  doc.text('Total Due', 130, finalY + 23);
  doc.setTextColor(30, 30, 30);
  doc.text(`$${invoice.total.toFixed(2)}`, 185, finalY + 23, { align: 'right' });
  
  // Notes section
  if (invoice.notes) {
    doc.setFontSize(9);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(139, 92, 246);
    doc.text('Payment Notes', 20, finalY + 40);
    
    doc.setFont(undefined, 'normal');
    doc.setTextColor(100, 100, 100);
    const splitNotes = doc.splitTextToSize(invoice.notes, 170);
    doc.text(splitNotes, 20, finalY + 47);
  }
  
  // Footer with elegant line
  doc.setDrawColor(139, 92, 246);
  doc.setLineWidth(0.5);
  doc.line(20, 275, 190, 275);
  
  doc.setFontSize(8);
  doc.setTextColor(100, 100, 100);
  doc.text('Thank you for your business', 105, 282, { align: 'center' });
  
  return doc;
};

// Helper function to select the right template
export const generateInvoicePDF = (invoice, companyInfo, template = 'classic') => {
  switch (template) {
    case 'modern':
      return generateModernPDF(invoice, companyInfo);
    case 'elegant':
      return generateElegantPDF(invoice, companyInfo);
    case 'classic':
    default:
      return generateClassicPDF(invoice, companyInfo);
  }
};