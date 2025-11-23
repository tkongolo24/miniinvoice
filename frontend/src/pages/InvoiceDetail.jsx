import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const InvoiceDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showMenu, setShowMenu] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  useEffect(() => {
    fetchInvoice();
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

  const getCurrencySymbol = (currency) => {
    const symbols = {
      'RWF': 'RWF',
      'KES': 'KES',
      'NGN': 'NGN',
    };
    return symbols[currency] || 'RWF';
  };

  const addWatermark = (doc) => {
    const pageHeight = doc.internal.pageSize.height;
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.setFont('helvetica', 'italic');
    doc.text('Powered by MiniInvoice', 105, pageHeight - 10, { align: 'center' });
  };

  const generatePDF = () => {
    if (!invoice) return;
    generateClassicPDF();
  };

  const generateClassicPDF = () => {
    const doc = new jsPDF();
    const currency = getCurrencySymbol(invoice.currency);

    // Header
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text('INVOICE', 20, 20);

    // Invoice Details
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Invoice #: ${invoice.invoiceNumber}`, 20, 35);
    doc.text(`Date: ${new Date(invoice.dateIssued).toLocaleDateString()}`, 20, 42);
    doc.text(`Due Date: ${new Date(invoice.dueDate).toLocaleDateString()}`, 20, 49);

    // Client Info
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Bill To:', 20, 65);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(invoice.clientName, 20, 72);
    doc.text(invoice.clientEmail, 20, 79);
    if (invoice.clientAddress) {
      const addressLines = doc.splitTextToSize(invoice.clientAddress, 80);
      doc.text(addressLines, 20, 86);
    }

    // Items Table
    const tableData = invoice.items.map((item) => [
      item.description,
      item.quantity,
      `${currency} ${item.unitPrice.toFixed(2)}`,
      `${currency} ${(item.quantity * item.unitPrice).toFixed(2)}`,
    ]);

    doc.autoTable({
      startY: 105,
      head: [['Description', 'Qty', 'Price', 'Total']],
      body: tableData,
      theme: 'striped',
      headStyles: { fillColor: [66, 139, 202] },
    });

    // Totals
    const finalY = doc.lastAutoTable.finalY + 10;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text(`Total: ${currency} ${invoice.total.toFixed(2)}`, 140, finalY);

    // Notes
    if (invoice.notes) {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.text('Notes:', 20, finalY + 30);
      const notesLines = doc.splitTextToSize(invoice.notes, 170);
      doc.text(notesLines, 20, finalY + 37);
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
        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 lg:p-8 mb-6">
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
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Description
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                      Qty
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                      Price
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {invoice.items.map((item, index) => (
                    <tr key={index}>
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
          <div className="bg-gray-50 rounded-lg p-4 sm:p-6">
            <div className="space-y-2 text-sm sm:text-base max-w-sm ml-auto">
              <div className="flex justify-between">
                <span className="text-lg font-semibold text-gray-900">Total:</span>
                <span className="text-lg font-bold text-blue-600">
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

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={generatePDF}
            className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition font-medium text-sm sm:text-base"
          >
            📄 Download PDF
          </button>

          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="bg-gray-200 text-gray-700 px-4 py-3 rounded-lg hover:bg-gray-300 transition font-medium text-sm sm:text-base"
            >
              ⋮
            </button>
    
            {showMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10">
                <button
                  onClick={() => {
                    toggleStatus();
                    setShowMenu(false);
                  }}
                  disabled={updatingStatus}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 disabled:opacity-50"
                >
                  {updatingStatus
                    ? '...'
                    : invoice.status === 'paid'
                    ? '○ Mark Unpaid'
                    : '✓ Mark Paid'}
                </button>
                
                <button
                  onClick={() => {
                    setShowMenu(false);
                    handleDelete();
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                >
                  🗑️ Delete Invoice
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoiceDetail;