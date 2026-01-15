import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const PublicInvoice = () => {
  const { shareToken } = useParams();
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchInvoice();
  }, [shareToken]);

  const fetchInvoice = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/invoices/public/${shareToken}`
      );
      setInvoice(response.data);
      setLoading(false);
    } catch (err) {
      setError('Invoice not found or link has expired');
      setLoading(false);
    }
  };

  const getCurrencySymbol = (currency) => {
    const symbols = {
      'RWF': 'RWF',
      'KES': 'KES',
      'NGN': 'NGN',
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

  const generatePDF = () => {
    if (!invoice) return;

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
    
    doc.text('Items Total (incl. VAT):', leftAlign, finalY);
    doc.text(`${currency} ${grossPrice.toFixed(2)}`, rightAlign, finalY, { align: 'right' });
    
    if (discount > 0) {
      doc.setTextColor(220, 38, 38);
      const discountLabel = invoice.discountType === 'percentage' 
        ? `Discount (${invoice.discount}%):`
        : 'Discount:';
      doc.text(discountLabel, leftAlign, finalY + 10);
      doc.text(`-${currency} ${discount.toFixed(2)}`, rightAlign, finalY + 10, { align: 'right' });
      doc.setTextColor(0, 0, 0);
    }
    
    const subtotalLine = discount > 0 ? finalY + 20 : finalY + 10;
    doc.setFont('helvetica', 'bold');
    doc.text('Subtotal after discount:', leftAlign, subtotalLine);
    doc.text(`${currency} ${discountedGross.toFixed(2)}`, rightAlign, subtotalLine, { align: 'right' });
    doc.setFont('helvetica', 'normal');
    
    const netLine = subtotalLine + 10;
    doc.setFontSize(10);
    doc.setTextColor(80, 80, 80);
    doc.text('Net Amount (excl. VAT):', leftAlign, netLine);
    doc.text(`${currency} ${netAmount.toFixed(2)}`, rightAlign, netLine, { align: 'right' });
    
    doc.text(`VAT (${invoice.taxRate || 18}%):`, leftAlign, netLine + 7);
    doc.text(`${currency} ${tax.toFixed(2)}`, rightAlign, netLine + 7, { align: 'right' });
    doc.setTextColor(0, 0, 0);
    
    const separatorLine = netLine + 12;
    doc.setDrawColor(37, 99, 235);
    doc.setLineWidth(0.5);
    doc.line(leftAlign, separatorLine, rightAlign, separatorLine);
    
    const totalLine = separatorLine + 7;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text('Total Payable:', leftAlign, totalLine);
    doc.text(`${currency} ${total.toFixed(2)}`, rightAlign, totalLine, { align: 'right' });

    if (invoice.notes) {
      const notesStartY = totalLine + 15;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.text('Notes:', 20, notesStartY);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      const notesLines = doc.splitTextToSize(invoice.notes, 170);
      doc.text(notesLines, 20, notesStartY + 7);
    }

    // Watermark
    const pageHeight = doc.internal.pageSize.height;
    doc.setFontSize(14);
    doc.setTextColor(100, 100, 100);
    doc.setFont('helvetica', 'bold');
    doc.text('Powered by BillKazi', 105, pageHeight - 10, { align: 'center' });

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
          <div className="text-6xl mb-4">📄</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Invoice Not Found</h1>
          <p className="text-gray-600 mb-6">{error || 'This invoice link is invalid or has expired.'}</p>
          <a
            href="https://billkazi.me"
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            Visit BillKazi →
          </a>
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
        {/* Header */}
        <div className="mb-6 sm:mb-8 text-center">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Invoice {invoice.invoiceNumber}
          </h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1">
            Issued on {new Date(invoice.dateIssued).toLocaleDateString()}
          </p>
          
          {/* Status Badge */}
          <div className="mt-4">
            <span
              className={`inline-block px-4 py-2 rounded-full text-sm font-medium ${
                invoice.status === 'paid'
                  ? 'bg-green-100 text-green-800'
                  : 'bg-orange-100 text-orange-800'
              }`}
            >
              {invoice.status === 'paid' ? '✓ Paid' : '⏳ Awaiting Payment'}
            </span>
          </div>
        </div>

        {/* Invoice Content */}
        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 lg:p-8 mb-6 border-t-4 border-blue-600">
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
                  <span className="text-gray-600">Invoice Number:</span>
                  <span className="font-medium">{invoice.invoiceNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Invoice Date:</span>
                  <span className="font-medium">{new Date(invoice.dateIssued).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Due Date:</span>
                  <span className="font-medium">{new Date(invoice.dueDate).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Currency:</span>
                  <span className="font-medium">{getCurrencySymbol(invoice.currency)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Items */}
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
        </div>

        {/* Download Button */}
        <div className="flex justify-center">
          <button
            onClick={generatePDF}
            className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition font-medium text-sm sm:text-base shadow-md hover:shadow-lg"
          >
            📄 Download PDF
          </button>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>This invoice was created with</p>
          <a 
            href="https://billkazi.me" 
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            BillKazi - Invoicing for African Freelancers
          </a>
        </div>
      </div>
    </div>
  );
};

export default PublicInvoice;