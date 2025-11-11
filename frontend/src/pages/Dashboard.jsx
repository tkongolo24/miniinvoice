import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getInvoice, getInvoices, getProfile } from '../utils/api';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

function InvoiceDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInvoice();
  }, [id]);

  const fetchInvoices = async () => {
  try {
    const response = await getInvoices();  
    setInvoices(response.data);
  } catch (error) {
    console.error('Error fetching invoices:', error);
  } finally {
    setLoading(false);
  }
};

  const downloadPDF = async () => {
    // Get user profile for company info
    let companyInfo = {};
    try {
      const profileResponse = await getProfile();
      companyInfo = profileResponse.data.user;
    } catch (error) {
      console.log('Could not load company info');
    }

    const doc = new jsPDF();

    // Add blue header bar
    doc.setFillColor(37, 99, 235);
    doc.rect(0, 0, 210, 40, 'F');

    // Company name in white
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont(undefined, 'bold');
    doc.text(companyInfo.companyName || 'Your Company', 20, 20);

    // Company details in white
    doc.setFontSize(9);
    doc.setFont(undefined, 'normal');
    if (companyInfo.companyEmail) doc.text(companyInfo.companyEmail, 20, 27);
    if (companyInfo.companyPhone) doc.text(companyInfo.companyPhone, 20, 32);
    if (companyInfo.companyAddress) doc.text(companyInfo.companyAddress, 20, 37);

    // INVOICE title on right side
    doc.setFontSize(28);
    doc.setFont(undefined, 'bold');
    doc.text('INVOICE', 210 - 20, 25, { align: 'right' });

    // Reset to black text
    doc.setTextColor(0, 0, 0);

    // Invoice details box
    doc.setFontSize(10);
    doc.setFont(undefined, 'bold');
    doc.text('Invoice #:', 140, 50);
    doc.text('Date Issued:', 140, 57);
    doc.text('Due Date:', 140, 64);

    doc.setFont(undefined, 'normal');
    doc.text(invoice.invoiceNumber, 170, 50);
    doc.text(new Date(invoice.dateIssued).toLocaleDateString(), 170, 57);
    doc.text(new Date(invoice.dueDate).toLocaleDateString(), 170, 64);

    // Status badge
    const statusColors = {
      paid: [34, 197, 94],
      unpaid: [234, 179, 8],
      overdue: [239, 68, 68]
    };
    const statusColor = statusColors[invoice.status] || [107, 114, 128];
    doc.setFillColor(...statusColor);
    doc.roundedRect(140, 68, 25, 7, 2, 2, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(8);
    doc.text(invoice.status.toUpperCase(), 152.5, 72.5, { align: 'center' });
    doc.setTextColor(0, 0, 0);

    // Bill To section
    doc.setFontSize(10);
    doc.setFont(undefined, 'bold');
    doc.text('BILL TO:', 20, 55);
    
    doc.setFont(undefined, 'normal');
    doc.setFontSize(11);
    doc.text(invoice.clientName, 20, 62);
    
    doc.setFontSize(9);
    doc.text(invoice.clientEmail, 20, 69);
    if (invoice.clientPhone) doc.text(invoice.clientPhone, 20, 75);
    if (invoice.clientAddress) doc.text(invoice.clientAddress, 20, 81);

    // Items table with blue header
    const tableData = invoice.items.map(item => [
      item.description,
      item.quantity.toString(),
      `${invoice.currency} ${item.unitPrice.toLocaleString()}`,
      `${invoice.currency} ${item.total.toLocaleString()}`
    ]);

    doc.autoTable({
      startY: 95,
      head: [['Description', 'Qty', 'Unit Price', 'Total']],
      body: tableData,
      theme: 'striped',
      headStyles: { 
        fillColor: [37, 99, 235],
        fontSize: 10,
        fontStyle: 'bold',
        halign: 'left'
      },
      columnStyles: {
        1: { halign: 'center' },
        2: { halign: 'right' },
        3: { halign: 'right', fontStyle: 'bold' }
      },
      styles: {
        fontSize: 9,
        cellPadding: 5
      }
    });

    // Totals section with better styling
    const finalY = doc.lastAutoTable.finalY + 15;
    
    // Totals box background
    doc.setFillColor(249, 250, 251);
    doc.roundedRect(120, finalY - 5, 70, 28, 2, 2, 'F');

    doc.setFontSize(10);
    doc.text('Subtotal:', 125, finalY);
    doc.text(`${invoice.currency} ${invoice.subtotal.toLocaleString()}`, 185, finalY, { align: 'right' });
    
    doc.text(`Tax (${invoice.taxRate}%):`, 125, finalY + 7);
    doc.text(`${invoice.currency} ${invoice.taxAmount.toLocaleString()}`, 185, finalY + 7, { align: 'right' });
    
    // Total with emphasis
    doc.setDrawColor(37, 99, 235);
    doc.setLineWidth(0.5);
    doc.line(125, finalY + 10, 185, finalY + 10);
    
    doc.setFont(undefined, 'bold');
    doc.setFontSize(12);
    doc.setTextColor(37, 99, 235);
    doc.text('TOTAL:', 125, finalY + 17);
    doc.text(`${invoice.currency} ${invoice.total.toLocaleString()}`, 185, finalY + 17, { align: 'right' });
    
    doc.setTextColor(0, 0, 0);
    doc.setFont(undefined, 'normal');

    // Notes section
    let currentY = finalY + 30;
    if (invoice.notes) {
      doc.setFontSize(10);
      doc.setFont(undefined, 'bold');
      doc.text('Notes:', 20, currentY);
      doc.setFont(undefined, 'normal');
      doc.setFontSize(9);
      const notesLines = doc.splitTextToSize(invoice.notes, 170);
      doc.text(notesLines, 20, currentY + 5);
      currentY += (notesLines.length * 5) + 10;
    }

    // Payment instructions section with blue background
    if (invoice.paymentInstructions) {
      doc.setFillColor(239, 246, 255);
      doc.roundedRect(15, currentY - 5, 180, 20, 2, 2, 'F');
      
      doc.setFontSize(10);
      doc.setFont(undefined, 'bold');
      doc.setTextColor(37, 99, 235);
      doc.text('Payment Instructions:', 20, currentY);
      
      doc.setFont(undefined, 'normal');
      doc.setTextColor(30, 58, 138);
      doc.setFontSize(9);
      const paymentLines = doc.splitTextToSize(invoice.paymentInstructions, 170);
      doc.text(paymentLines, 20, currentY + 5);
      
      doc.setTextColor(0, 0, 0);
    }

    // Footer
    doc.setFontSize(8);
    doc.setTextColor(107, 114, 128);
    doc.text('Thank you for your business!', 105, 280, { align: 'center' });

    doc.save(`Invoice-${invoice.invoiceNumber}.pdf`);
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    );
  }

  // No invoice found
  if (!invoice) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-gray-600">Invoice not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-blue-600">Invoice Details</h1>
            <div className="flex gap-3">
              <button
                onClick={downloadPDF}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
              >
                Download PDF
              </button>
              <button
                onClick={() => navigate('/dashboard')}
                className="text-sm text-gray-600 hover:text-gray-900 px-4 py-2"
              >
                ← Back
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Invoice Preview */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-lg p-8">
          {/* Header */}
          <div className="flex justify-between items-start mb-8">
            <div>
              <h2 className="text-3xl font-bold text-blue-600 mb-2">INVOICE</h2>
              <p className="text-sm text-gray-600">Invoice #: {invoice.invoiceNumber}</p>
            </div>
            <div className="text-right">
              <p className="text-sm"><span className="font-medium">Issued:</span> {new Date(invoice.dateIssued).toLocaleDateString()}</p>
              <p className="text-sm"><span className="font-medium">Due:</span> {new Date(invoice.dueDate).toLocaleDateString()}</p>
              <span className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-medium ${
                invoice.status === 'paid' ? 'bg-green-100 text-green-800' :
                invoice.status === 'unpaid' ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }`}>
                {invoice.status.toUpperCase()}
              </span>
            </div>
          </div>

          {/* Bill To */}
          <div className="mb-8">
            <h3 className="text-sm font-medium text-gray-500 mb-2">BILL TO:</h3>
            <p className="font-medium">{invoice.clientName}</p>
            <p className="text-sm text-gray-600">{invoice.clientEmail}</p>
            {invoice.clientPhone && <p className="text-sm text-gray-600">{invoice.clientPhone}</p>}
            {invoice.clientAddress && <p className="text-sm text-gray-600">{invoice.clientAddress}</p>}
          </div>

          {/* Items Table */}
          <div className="mb-8">
            <table className="w-full">
              <thead className="bg-gray-50 border-b-2 border-gray-200">
                <tr>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Description</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-gray-700">Qty</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-gray-700">Price</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-gray-700">Total</th>
                </tr>
              </thead>
              <tbody>
                {invoice.items.map((item, index) => (
                  <tr key={index} className="border-b">
                    <td className="py-3 px-4">{item.description}</td>
                    <td className="py-3 px-4 text-right">{item.quantity}</td>
                    <td className="py-3 px-4 text-right">{invoice.currency} {item.unitPrice.toFixed(2)}</td>
                    <td className="py-3 px-4 text-right font-medium">{invoice.currency} {item.total.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div className="flex justify-end mb-8">
            <div className="w-64">
              <div className="flex justify-between py-2">
                <span className="text-gray-600">Subtotal:</span>
                <span className="font-medium">{invoice.currency} {invoice.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-gray-600">Tax ({invoice.taxRate}%):</span>
                <span className="font-medium">{invoice.currency} {invoice.taxAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between py-3 border-t-2 border-gray-200">
                <span className="text-lg font-bold">Total:</span>
                <span className="text-lg font-bold text-blue-600">{invoice.currency} {invoice.total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Notes */}
          {invoice.notes && (
            <div className="mb-6 p-4 bg-gray-50 rounded">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Notes:</h4>
              <p className="text-sm text-gray-600">{invoice.notes}</p>
            </div>
          )}

          {/* Payment Instructions */}
          {invoice.paymentInstructions && (
            <div className="p-4 bg-blue-50 rounded">
              <h4 className="text-sm font-medium text-blue-900 mb-2">Payment Instructions:</h4>
              <p className="text-sm text-blue-800">{invoice.paymentInstructions}</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default InvoiceDetail;