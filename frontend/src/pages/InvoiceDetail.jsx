import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const InvoiceDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showMenu, setShowMenu] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [companySettings, setCompanySettings] = useState(null);
  const [sendingEmail, setSendingEmail] = useState(false);

  useEffect(() => {
    fetchInvoice();
    fetchCompanySettings();
  }, [id]);

  const fetchInvoice = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/invoices/${id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setInvoice(response.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to load invoice');
      setLoading(false);
      if (err.response?.status === 401) {
        navigate('/login');
      }
    }
  };

  const fetchCompanySettings = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/settings`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setCompanySettings(response.data);
    } catch (err) {
      console.error('Failed to load company settings');
    }
  };

  const toggleStatus = async () => {
    setUpdatingStatus(true);
    try {
      const token = localStorage.getItem('token');
      const newStatus = invoice.status === 'paid' ? 'unpaid' : 'paid';
      const response = await axios.patch(
        `${import.meta.env.VITE_API_URL}/api/invoices/${id}/status`,
        { status: newStatus },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setInvoice(response.data);
    } catch (err) {
      alert('Failed to update status');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this invoice?')) return;

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${import.meta.env.VITE_API_URL}/api/invoices/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      navigate('/dashboard');
    } catch (err) {
      alert('Failed to delete invoice');
    }
  };

  const sendEmailInvoice = async () => {
  setSendingEmail(true);
  try {
    const token = localStorage.getItem('token');
    await axios.post(
      `${import.meta.env.VITE_API_URL}/api/invoices/${id}/send-email`,
      {},
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    alert('Invoice sent to ' + invoice.clientEmail);
  } catch (err) {
    alert('Failed to send email');
  } finally {
    setSendingEmail(false);
  }
};
  const shareOnWhatsApp = () => {
    const currency = getCurrencySymbol(invoice.currency);
    const shareUrl = invoice.shareToken 
      ? `https://billkazi.me/i/${invoice.shareToken}`
      : null;
    
    const message = `Hi ${invoice.clientName},

Here's your invoice from ${companySettings?.companyName || 'us'}:

📄 Invoice #: ${invoice.invoiceNumber}
💰 Amount: ${currency} ${invoice.total?.toFixed(2)}
📅 Due Date: ${new Date(invoice.dueDate).toLocaleDateString()}
${shareUrl ? `\n🔗 View Invoice: ${shareUrl}` : ''}

Please let me know if you have any questions.

Thank you for your business!`;

    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/?text=${encodedMessage}`, '_blank');
  };

  const sendPaymentReminder = () => {
    const currency = getCurrencySymbol(invoice.currency);
    const dueDate = new Date(invoice.dueDate);
    const today = new Date();
    const diffTime = today - dueDate;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const isOverdue = diffDays > 0;
    const shareUrl = invoice.shareToken 
      ? `https://billkazi.me/i/${invoice.shareToken}`
      : null;

    let message;

    if (isOverdue) {
      message = `Hi ${invoice.clientName},

I hope this message finds you well. This is a friendly reminder about an outstanding invoice.

📄 Invoice #: ${invoice.invoiceNumber}
💰 Amount Due: ${currency} ${invoice.total?.toFixed(2)}
📅 Due Date: ${dueDate.toLocaleDateString()}
⚠️ Days Overdue: ${diffDays} day${diffDays > 1 ? 's' : ''}
${shareUrl ? `\n🔗 View Invoice: ${shareUrl}` : ''}

Please let me know if you have any questions or if there's anything I can help with regarding this payment.

Thank you!
${companySettings?.companyName || ''}`;
    } else {
      message = `Hi ${invoice.clientName},

I hope you're doing well. This is a gentle reminder that the following invoice will be due soon.

📄 Invoice #: ${invoice.invoiceNumber}
💰 Amount: ${currency} ${invoice.total?.toFixed(2)}
📅 Due Date: ${dueDate.toLocaleDateString()}
${shareUrl ? `\n🔗 View Invoice: ${shareUrl}` : ''}

Please let me know if you have any questions.

Thank you!
${companySettings?.companyName || ''}`;
    }

    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/?text=${encodedMessage}`, '_blank');
  };

  const getCurrencySymbol = (currency) => {
    const symbols = {
      'RWF': 'RWF',
      'KES': 'KES',
      'NGN': 'NGN',
      'CFA': 'CFA',
    };
    return symbols[currency] || 'RWF';
  };

  const calculateDiscount = () => {
    if (!invoice || !invoice.hasDiscount) return 0;
    
    const subtotal = invoice.subtotal || 0;
    if (invoice.discountType === 'percentage') {
      return (subtotal * (parseFloat(invoice.discount) || 0)) / 100;
    }
    return parseFloat(invoice.discount) || 0;
  };

  const addWatermark = (doc) => {
    const pageHeight = doc.internal.pageSize.height;
    doc.setFontSize(14);
    doc.setTextColor(100, 100, 100);
    doc.setFont('helvetica', 'bold');
    doc.text('Powered by BillKazi', 105, pageHeight - 10, { align: 'center' });
  };

  const generatePDF = () => {
    if (!invoice) return;
    generateClassicPDF();
  };

  // Generate Receipt PDF
  const generateReceipt = () => {
    if (!invoice || invoice.status !== 'paid') return;

    const doc = new jsPDF();
    const currency = getCurrencySymbol(invoice.currency);
    const receiptNumber = `REC-${invoice.invoiceNumber.replace('INV-', '').replace('inv-', '')}`;
    const paymentDate = new Date().toLocaleDateString();

    // Header with green color (to distinguish from invoice)
    doc.setFillColor(22, 163, 74);
    doc.rect(0, 0, 210, 40, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(32);
    doc.setFont('helvetica', 'bold');
    doc.text('RECEIPT', 105, 26, { align: 'center' });

    // Company Info (right side)
    let companyStartY = 50;
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    
    if (companySettings?.companyName) {
      doc.text(companySettings.companyName, 190, companyStartY, { align: 'right' });
      companyStartY += 6;
    }
    
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    
    if (companySettings?.address) {
      doc.text(companySettings.address, 190, companyStartY, { align: 'right' });
      companyStartY += 5;
    }
    
    if (companySettings?.phone) {
      doc.text(companySettings.phone, 190, companyStartY, { align: 'right' });
      companyStartY += 5;
    }
    
    if (companySettings?.contactEmail) {
      doc.text(companySettings.contactEmail, 190, companyStartY, { align: 'right' });
      companyStartY += 5;
    }
    
    if (companySettings?.businessRegNumber) {
      doc.text(companySettings.businessRegNumber, 190, companyStartY, { align: 'right' });
    }

    // Receipt Details (left side)
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.text(`Receipt #: ${receiptNumber}`, 20, 50);
    doc.text(`Date: ${paymentDate}`, 20, 58);
    doc.text(`For Invoice: ${invoice.invoiceNumber}`, 20, 66);
    
    // Add verification link if shareToken exists
    if (invoice.shareToken) {
      const verifyUrl = `https://billkazi.me/i/${invoice.shareToken}`;
      doc.setFontSize(9);
      doc.setTextColor(22, 163, 74);
      doc.text('Verify online:', 20, 74);
      doc.setTextColor(37, 99, 235);
      doc.textWithLink(verifyUrl, 48, 74, { url: verifyUrl });
      doc.setTextColor(0, 0, 0);
    }

    // Received From Section
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Received From:', 20, 90);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.text(invoice.clientName, 20, 99);
    doc.text(invoice.clientEmail, 20, 107);
    if (invoice.clientAddress) {
      const addressLines = doc.splitTextToSize(invoice.clientAddress, 80);
      doc.text(addressLines, 20, 115);
    }

    // Payment Details Box
    const boxY = 135;
    doc.setFillColor(240, 253, 244);
    doc.setDrawColor(22, 163, 74);
    doc.setLineWidth(0.5);
    doc.roundedRect(20, boxY, 170, 60, 3, 3, 'FD');

    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(22, 163, 74);
    doc.text('PAYMENT CONFIRMED', 105, boxY + 15, { align: 'center' });

    doc.setTextColor(0, 0, 0);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    
    // Payment details inside box
    const detailsStartY = boxY + 28;
    doc.text('Description:', 30, detailsStartY);
    doc.text(`Payment for Invoice ${invoice.invoiceNumber}`, 80, detailsStartY);
    
    doc.text('Amount Paid:', 30, detailsStartY + 12);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text(`${currency} ${invoice.total?.toFixed(2)}`, 80, detailsStartY + 12);
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    doc.text('Payment Status:', 30, detailsStartY + 24);
    doc.setTextColor(22, 163, 74);
    doc.setFont('helvetica', 'bold');
    doc.text('PAID IN FULL', 80, detailsStartY + 24);

    // Items Summary
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Items Summary:', 20, 205);

    const tableData = invoice.items.map((item) => [
      item.description,
      item.quantity,
      `${currency} ${(item.quantity * item.unitPrice).toFixed(2)}`,
    ]);

    autoTable(doc, {
      startY: 212,
      head: [['Description', 'Qty', 'Amount']],
      body: tableData,
      theme: 'striped',
      headStyles: { fillColor: [22, 163, 74], textColor: [255, 255, 255] },
      styles: { fontSize: 10 },
      columnStyles: {
        0: { cellWidth: 100 },
        1: { cellWidth: 30, halign: 'center' },
        2: { cellWidth: 40, halign: 'right' },
      },
    });

    // Total
    const finalY = doc.lastAutoTable.finalY + 10;
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Total Paid:', 120, finalY);
    doc.setTextColor(22, 163, 74);
    doc.text(`${currency} ${invoice.total?.toFixed(2)}`, 190, finalY, { align: 'right' });

    // Thank you message
    doc.setTextColor(100, 100, 100);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'italic');
    doc.text('Thank you for your payment!', 105, finalY + 20, { align: 'center' });

    // Watermark
    addWatermark(doc);

    doc.save(`Receipt-${receiptNumber}.pdf`);
  };

  // Share receipt on WhatsApp
  const shareReceiptOnWhatsApp = () => {
    if (!invoice || invoice.status !== 'paid') return;
    
    const currency = getCurrencySymbol(invoice.currency);
    const receiptNumber = `REC-${invoice.invoiceNumber.replace('INV-', '').replace('inv-', '')}`;
    
    const message = `Hi ${invoice.clientName},

Thank you for your payment! Here are your receipt details:

🧾 Receipt #: ${receiptNumber}
📄 For Invoice: ${invoice.invoiceNumber}
💰 Amount Paid: ${currency} ${invoice.total?.toFixed(2)}
✅ Status: PAID IN FULL
📅 Date: ${new Date().toLocaleDateString()}

Thank you for your business!
${companySettings?.companyName || ''}`;

    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/?text=${encodedMessage}`, '_blank');
  };

  const generateClassicPDF = () => {
    const doc = new jsPDF();
    const currency = getCurrencySymbol(invoice.currency);
    const calculatedDiscount = calculateDiscount();

    // Header with color
    doc.setFillColor(37, 99, 235);
    doc.rect(0, 0, 210, 35, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(28);
    doc.setFont('helvetica', 'bold');
    doc.text('INVOICE', 20, 22);

    // Company Info (right side of header area)
    let companyStartY = 45;
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    
    if (companySettings?.companyName) {
      doc.text(companySettings.companyName, 190, companyStartY, { align: 'right' });
      companyStartY += 6;
    }
    
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    
    if (companySettings?.address) {
      doc.text(companySettings.address, 190, companyStartY, { align: 'right' });
      companyStartY += 5;
    }
    
    if (companySettings?.phone) {
      doc.text(companySettings.phone, 190, companyStartY, { align: 'right' });
      companyStartY += 5;
    }
    
    if (companySettings?.contactEmail) {
      doc.text(companySettings.contactEmail, 190, companyStartY, { align: 'right' });
      companyStartY += 5;
    }
    
    if (companySettings?.businessRegNumber) {
      doc.text(companySettings.businessRegNumber, 190, companyStartY, { align: 'right' });
    }

    // Invoice Details
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Invoice #: ${invoice.invoiceNumber}`, 20, 45);
    doc.text(`Date: ${new Date(invoice.dateIssued).toLocaleDateString()}`, 20, 52);
    doc.text(`Due Date: ${new Date(invoice.dueDate).toLocaleDateString()}`, 20, 59);

    // Client Info
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Bill To:', 20, 75);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(invoice.clientName, 20, 82);
    doc.text(invoice.clientEmail, 20, 89);
    if (invoice.clientAddress) {
      const addressLines = doc.splitTextToSize(invoice.clientAddress, 80);
      doc.text(addressLines, 20, 96);
    }

    // Items Table
    const tableData = invoice.items.map((item) => [
      item.description,
      item.quantity,
      `${currency} ${item.unitPrice.toFixed(2)}`,
      `${currency} ${(item.quantity * item.unitPrice).toFixed(2)}`,
    ]);

    autoTable(doc, {
      startY: 115,
      head: [['Description', 'Qty', 'Price', 'Total']],
      body: tableData,
      theme: 'striped',
      headStyles: { fillColor: [37, 99, 235], textColor: [255, 255, 255] },
      styles: { fontSize: 10 },
    });

    // Calculate values
    const grossPrice = invoice.subtotal || invoice.total;
    const discount = calculatedDiscount;
    const discountedGross = grossPrice - discount;
    const netAmount = invoice.netAmount || 0;
    const tax = invoice.tax || 0;
    const total = invoice.total;

    // Totals Section
    const finalY = doc.lastAutoTable.finalY + 20;
    const rightAlign = 190;
    const leftAlign = 110;
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    
    // Items Total (incl. VAT)
    doc.text('Items Total (incl. VAT):', leftAlign, finalY);
    doc.text(`${currency} ${grossPrice.toFixed(2)}`, rightAlign, finalY, { align: 'right' });
    
    // Discount (if applicable)
    if (discount > 0) {
      doc.setTextColor(220, 38, 38);
      const discountLabel = invoice.discountType === 'percentage' 
        ? `Discount (${invoice.discount}%):`
        : 'Discount:';
      doc.text(discountLabel, leftAlign, finalY + 10);
      doc.text(`-${currency} ${discount.toFixed(2)}`, rightAlign, finalY + 10, { align: 'right' });
      doc.setTextColor(0, 0, 0);
    }
    
    // Subtotal after discount
    const subtotalLine = discount > 0 ? finalY + 20 : finalY + 10;
    doc.setFont('helvetica', 'bold');
    doc.text('Subtotal after discount:', leftAlign, subtotalLine);
    doc.text(`${currency} ${discountedGross.toFixed(2)}`, rightAlign, subtotalLine, { align: 'right' });
    doc.setFont('helvetica', 'normal');
    
    // Net Amount
    const netLine = subtotalLine + 10;
    doc.setFontSize(10);
    doc.setTextColor(80, 80, 80);
    doc.text('Net Amount (excl. VAT):', leftAlign, netLine);
    doc.text(`${currency} ${netAmount.toFixed(2)}`, rightAlign, netLine, { align: 'right' });
    
    // VAT
    doc.text(`VAT (${invoice.taxRate || 18}%):`, leftAlign, netLine + 7);
    doc.text(`${currency} ${tax.toFixed(2)}`, rightAlign, netLine + 7, { align: 'right' });
    doc.setTextColor(0, 0, 0);
    
    // Separator line
    const separatorLine = netLine + 12;
    doc.setDrawColor(37, 99, 235);
    doc.setLineWidth(0.5);
    doc.line(leftAlign, separatorLine, rightAlign, separatorLine);
    
    // Total Payable
    const totalLine = separatorLine + 7;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text('Total Payable:', leftAlign, totalLine);
    doc.text(`${currency} ${total.toFixed(2)}`, rightAlign, totalLine, { align: 'right' });

    // Notes
    let notesEndY = totalLine;
    if (invoice.notes) {
      const notesStartY = totalLine + 15;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.text('Notes:', 20, notesStartY);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      const notesLines = doc.splitTextToSize(invoice.notes, 170);
      doc.text(notesLines, 20, notesStartY + 7);
      notesEndY = notesStartY + 7 + (notesLines.length * 5);
    }

    // Invoice Footer (from company settings)
    if (companySettings?.invoiceFooter) {
      const footerStartY = notesEndY + 15;
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(9);
      doc.setTextColor(80, 80, 80);
      const footerLines = doc.splitTextToSize(companySettings.invoiceFooter, 170);
      doc.text(footerLines, 105, footerStartY, { align: 'center' });
      doc.setTextColor(0, 0, 0);
    }

    // Add watermark
    addWatermark(doc);

    doc.save(`Invoice-${invoice.invoiceNumber}.pdf`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading invoice...</p>
        </div>
      </div>
    );
  }

  if (error || !invoice) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-red-600 text-lg mb-4">{error || 'Invoice not found'}</p>
          <Link
            to="/dashboard"
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            ← Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const subtotal = invoice.subtotal || invoice.total;
  const discount = calculateDiscount();
  const discountedGross = subtotal - discount;
  const netAmount = invoice.netAmount || 0;
  const tax = invoice.tax || 0;

  return (
    <div className="min-h-screen bg-gray-50 py-6 sm:py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header with Actions */}
        <div className="mb-6 sm:mb-8">
          <Link
            to="/dashboard"
            className="text-blue-600 hover:text-blue-700 mb-4 text-sm sm:text-base flex items-center"
          >
            ← Back to Dashboard
          </Link>
          
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                Invoice {invoice.invoiceNumber}
              </h1>
              <p className="text-sm sm:text-base text-gray-600 mt-1">
                Created on {new Date(invoice.dateIssued).toLocaleDateString()}
              </p>
            </div>
            
            {/* Status Badge */}
            <div>
              <span
                className={`inline-block px-4 py-2 rounded-full text-sm font-medium ${
                  invoice.status === 'paid'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-orange-100 text-orange-800'
                }`}
              >
                {invoice.status === 'paid' ? '✓ Paid' : 'Unpaid'}
              </span>
            </div>
          </div>
        </div>

        {/* Invoice Content */}
        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 lg:p-8 mb-6 border-t-4 border-blue-600">
          {/* Company Header */}
          {companySettings && (companySettings.companyName || companySettings.logo) && (
            <div className="flex justify-between items-start mb-6 pb-4 border-b">
              <div className="flex items-center gap-4">
                {companySettings.logo && (
                  <img
                    src={`${import.meta.env.VITE_API_URL}${companySettings.logo}`}
                    alt="Company Logo"
                    className="w-16 h-16 object-contain"
                  />
                )}
                <div>
                  {companySettings.companyName && (
                    <h2 className="text-xl font-bold text-gray-900">{companySettings.companyName}</h2>
                  )}
                  {companySettings.address && (
                    <p className="text-sm text-gray-600">{companySettings.address}</p>
                  )}
                </div>
              </div>
              <div className="text-right text-sm text-gray-600">
                {companySettings.phone && <p>{companySettings.phone}</p>}
                {companySettings.contactEmail && <p>{companySettings.contactEmail}</p>}
                {companySettings.businessRegNumber && (
                  <p className="font-medium">{companySettings.businessRegNumber}</p>
                )}
              </div>
            </div>
          )}

          {/* Template Info */}
          <div className="mb-6 pb-4 border-b">
            <p className="text-sm text-gray-600">
              Template: <span className="font-medium capitalize">{invoice.template || 'Classic'}</span>
              {' | '}
              Currency: <span className="font-medium">{getCurrencySymbol(invoice.currency)}</span>
            </p>
          </div>

          {/* Invoice Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 mb-6 sm:mb-8">
            {/* Client Information */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-3">Bill To</h2>
              <div className="space-y-1 text-sm sm:text-base">
                <p className="font-medium text-gray-900">{invoice.clientName}</p>
                <p className="text-gray-600">{invoice.clientEmail}</p>
                {invoice.clientAddress && (
                  <p className="text-gray-600 whitespace-pre-line">{invoice.clientAddress}</p>
                )}
              </div>
            </div>

            {/* Invoice Information */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-3">Invoice Details</h2>
              <div className="space-y-2 text-sm sm:text-base">
                <div className="flex justify-between">
                  <span className="text-gray-600">Invoice Date:</span>
                  <span className="font-medium">{new Date(invoice.dateIssued).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Due Date:</span>
                  <span className="font-medium">{new Date(invoice.dueDate).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Items - Desktop Table */}
          <div className="mb-6 sm:mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Items</h2>
            
            {/* Desktop View */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-blue-600 text-white">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase">
                      Description
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium uppercase">
                      Qty
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium uppercase">
                      Price
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium uppercase">
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {invoice.items.map((item, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-900">{item.description}</td>
                      <td className="px-4 py-3 text-sm text-center text-gray-700">{item.quantity}</td>
                      <td className="px-4 py-3 text-sm text-right text-gray-700">
                        {getCurrencySymbol(invoice.currency)} {item.unitPrice.toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-sm text-right font-medium text-gray-900">
                        {getCurrencySymbol(invoice.currency)} {(item.quantity * item.unitPrice).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile View - Cards */}
            <div className="sm:hidden space-y-3">
              {invoice.items.map((item, index) => (
                <div key={index} className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                  <p className="font-medium text-gray-900 mb-2">{item.description}</p>
                  <div className="grid grid-cols-3 gap-2 text-sm">
                    <div>
                      <span className="text-gray-600">Qty:</span>
                      <p className="font-medium">{item.quantity}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Price:</span>
                      <p className="font-medium">{getCurrencySymbol(invoice.currency)} {item.unitPrice.toFixed(2)}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Total:</span>
                      <p className="font-medium">{getCurrencySymbol(invoice.currency)} {(item.quantity * item.unitPrice).toFixed(2)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Totals */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4 sm:p-6 border border-blue-100">
            <div className="space-y-3 text-sm sm:text-base max-w-sm ml-auto">
              <div className="flex justify-between text-gray-700">
                <span>Items Total (incl. VAT):</span>
                <span className="font-medium">
                  {getCurrencySymbol(invoice.currency)} {subtotal.toFixed(2)}
                </span>
              </div>

              {discount > 0 && (
                <>
                  <div className="flex justify-between text-red-600">
                    <span>
                      Discount
                      {invoice.discountType === 'percentage' ? ` (${invoice.discount}%)` : ''}:
                    </span>
                    <span className="font-medium">
                      -{getCurrencySymbol(invoice.currency)} {discount.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between text-gray-900 font-medium border-t border-blue-200 pt-2">
                    <span>Subtotal after discount:</span>
                    <span>
                      {getCurrencySymbol(invoice.currency)} {discountedGross.toFixed(2)}
                    </span>
                  </div>
                </>
              )}

              <div className="flex justify-between text-gray-600 text-sm pt-2">
                <span>Net Amount (excl. VAT):</span>
                <span className="font-medium">
                  {getCurrencySymbol(invoice.currency)} {netAmount.toFixed(2)}
                </span>
              </div>

              <div className="flex justify-between text-gray-600 text-sm">
                <span>VAT ({invoice.taxRate || 18}%):</span>
                <span className="font-medium">
                  {getCurrencySymbol(invoice.currency)} {tax.toFixed(2)}
                </span>
              </div>

              <div className="flex justify-between text-lg font-bold text-blue-600 border-t-2 border-blue-200 pt-3">
                <span>Total Payable:</span>
                <span>
                  {getCurrencySymbol(invoice.currency)} {invoice.total?.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* Notes */}
          {invoice.notes && (
            <div className="mt-6 sm:mt-8 pt-6 border-t">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">Notes</h2>
              <p className="text-sm sm:text-base text-gray-700 whitespace-pre-line">
                {invoice.notes}
              </p>
            </div>
          )}

          {/* Invoice Footer */}
          {companySettings?.invoiceFooter && (
            <div className="mt-6 pt-6 border-t text-center">
              <p className="text-sm text-gray-600 italic whitespace-pre-line">
                {companySettings.invoiceFooter}
              </p>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-3">
          {/* Primary Actions */}
          <div className="flex gap-2">
            <button
              onClick={generatePDF}
              className="flex-1 bg-blue-700 text-white px-4 py-2.5 rounded-lg hover:bg-blue-600 transition font-medium text-sm"
            >
              Download PDF
            </button>
            
            {invoice.status === 'paid' && (
              <button
                onClick={generateReceipt}
                className="flex-1 bg-gray-900 text-white px-4 py-2.5 rounded-lg hover:bg-gray-800 transition font-medium text-sm"
              >
                Download Receipt
              </button>
            )}
          </div>

          {/* Share Actions */}
          <div className="flex gap-2">
            <button
              onClick={shareOnWhatsApp}
              className="flex-1 border border-gray-300 text-gray-700 px-4 py-2.5 rounded-lg hover:bg-gray-50 transition font-medium text-sm"
            >
              Share on WhatsApp
            </button>
            
            <button
              onClick={sendEmailInvoice}
              disabled={sendingEmail}
              className="flex-1 border border-blue-300 text-blue-700 px-4 py-2.5 rounded-lg hover:bg-blue-50 transition font-medium text-sm"
            >
              {sendingEmail ? 'Sending...' : 'Send Email'}
            </button>
          </div>

          {/* Secondary Actions */}
          <div className="flex gap-2">
            {invoice.status !== 'paid' && (
              <button
                onClick={sendPaymentReminder}
                className="flex-1 border border-gray-300 text-gray-700 px-4 py-2.5 rounded-lg hover:bg-gray-50 transition font-medium text-sm"
              >
                Send Reminder
              </button>
            )}
            
            <button
              onClick={toggleStatus}
              disabled={updatingStatus}
              className="flex-1 border border-gray-300 text-gray-700 px-4 py-2.5 rounded-lg hover:bg-gray-50 transition font-medium text-sm disabled:opacity-50"
            >
              {updatingStatus
                ? '...'
                : invoice.status === 'paid'
                ? 'Mark Unpaid'
                : 'Mark Paid'}
            </button>
            
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="relative border border-blue-300 text-gray-700 px-3 py-2.5 rounded-lg hover:bg-blue-50 transition"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
              </svg>
              
              {showMenu && (
                <div className="absolute right-0 bottom-full mb-2 w-44 bg-white rounded-lg shadow-lg border border-blue-200 py-1 z-10">
                  {invoice.status === 'paid' && (
                    <button
                      onClick={() => {
                        shareReceiptOnWhatsApp();
                        setShowMenu(false);
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-blue-50"
                    >
                      Share Receipt
                    </button>
                  )}
                  
                  <button
                    onClick={() => {
                      setShowMenu(false);
                      handleDelete();
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                  >
                    Delete Invoice
                  </button>
                </div>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
export default InvoiceDetail;