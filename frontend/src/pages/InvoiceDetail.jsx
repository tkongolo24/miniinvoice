import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { generateInvoicePDF } from '../utils/pdfTemplates';

// Currency symbols mapping
const getCurrencySymbol = (currency) => {
  const symbols = {
    USD: '$',
    EUR: '€',
    GBP: '£',
    RWF: 'FRw',
    KES: 'KSh',
    NGN: '₦',
    ZAR: 'R'
  };
  return symbols[currency] || currency;
};

export default function InvoiceDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [invoice, setInvoice] = useState(null);
  const [companyInfo, setCompanyInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currencySymbol, setCurrencySymbol] = useState('$');

  useEffect(() => {
    fetchInvoiceAndProfile();
  }, [id]);

  const fetchInvoiceAndProfile = async () => {
    try {
      setLoading(true);
      const [invoiceRes, profileRes] = await Promise.all([
        api.get(`/invoices/${id}`),
        api.get('/auth/profile')
      ]);

      setInvoice(invoiceRes.data);
      setCompanyInfo(profileRes.data);
      setCurrencySymbol(getCurrencySymbol(profileRes.data.currency || 'USD'));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load invoice');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = () => {
    if (!invoice || !companyInfo) return;

    try {
      // Use the invoice's selected template
      const doc = generateInvoicePDF(invoice, companyInfo, invoice.template);
      doc.save(`Invoice-${invoice.invoiceNumber}.pdf`);
    } catch (err) {
      console.error('Error generating PDF:', err);
      alert('Failed to generate PDF. Please try again.');
    }
  };

  const handleToggleStatus = async () => {
    try {
      const newStatus = invoice.status === 'paid' ? 'unpaid' : 'paid';
      await api.put(`/invoices/${id}`, { status: newStatus });
      setInvoice({ ...invoice, status: newStatus });
    } catch (err) {
      alert('Failed to update status');
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this invoice?')) return;

    try {
      await api.delete(`/invoices/${id}`);
      navigate('/dashboard');
    } catch (err) {
      alert('Failed to delete invoice');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading invoice...</div>
      </div>
    );
  }

  if (error || !invoice) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-xl text-red-600 mb-4">{error || 'Invoice not found'}</div>
          <button
            onClick={() => navigate('/dashboard')}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const getTemplateName = (template) => {
    const names = {
      classic: 'Classic',
      modern: 'Modern',
      elegant: 'Elegant'
    };
    return names[template] || 'Classic';
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header Actions */}
        <div className="flex justify-between items-center mb-6">
          <button
            onClick={() => navigate('/dashboard')}
            className="px-4 py-2 text-gray-600 hover:text-gray-900"
          >
            ← Back to Dashboard
          </button>
          <div className="flex gap-3">
            <button
              onClick={handleToggleStatus}
              className={`px-6 py-2 rounded-lg font-medium ${
                invoice.status === 'paid'
                  ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  : 'bg-green-600 text-white hover:bg-green-700'
              }`}
            >
              Mark as {invoice.status === 'paid' ? 'Unpaid' : 'Paid'}
            </button>
            <button
              onClick={() => navigate(`/edit-invoice/${id}`)}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
            >
              Edit
            </button>
            <button
              onClick={handleDownloadPDF}
              className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium"
            >
              Download PDF
            </button>
            <button
              onClick={handleDelete}
              className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium"
            >
              Delete
            </button>
          </div>
        </div>

        {/* Invoice Preview */}
        <div className="bg-white rounded-lg shadow-md p-8">
          {/* Status Badge */}
          <div className="flex justify-between items-start mb-6">
            <div>
              <span
                className={`inline-block px-4 py-1 rounded-full text-sm font-medium ${
                  invoice.status === 'paid'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-yellow-100 text-yellow-800'
                }`}
              >
                {invoice.status.toUpperCase()}
              </span>
              <div className="mt-2 text-sm text-gray-600">
                Template: <span className="font-medium">{getTemplateName(invoice.template)}</span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-gray-900">INVOICE</div>
              <div className="text-gray-600 mt-1">#{invoice.invoiceNumber}</div>
            </div>
          </div>

          {/* Company Info */}
          <div className="mb-8">
            <div className="text-2xl font-bold text-gray-900">{companyInfo?.companyName}</div>
            <div className="text-gray-600 mt-1">{companyInfo?.email}</div>
            {companyInfo?.phone && <div className="text-gray-600">{companyInfo.phone}</div>}
            {companyInfo?.address && <div className="text-gray-600">{companyInfo.address}</div>}
          </div>

          {/* Dates and Client Info */}
          <div className="grid grid-cols-2 gap-8 mb-8">
            <div>
              <div className="text-sm font-semibold text-gray-700 mb-2">BILL TO</div>
              <div className="text-gray-900 font-medium">{invoice.clientName}</div>
              <div className="text-gray-600">{invoice.clientEmail}</div>
              {invoice.clientAddress && (
                <div className="text-gray-600 mt-1">{invoice.clientAddress}</div>
              )}
            </div>
            <div className="text-right">
              <div className="mb-3">
                <div className="text-sm text-gray-600">Date Issued</div>
                <div className="font-medium text-gray-900">
                  {new Date(invoice.dateIssued).toLocaleDateString()}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Due Date</div>
                <div className="font-medium text-gray-900">
                  {new Date(invoice.dueDate).toLocaleDateString()}
                </div>
              </div>
            </div>
          </div>

          {/* Items Table */}
          <div className="mb-8">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-gray-200">
                  <th className="text-left py-3 text-sm font-semibold text-gray-700">Description</th>
                  <th className="text-center py-3 text-sm font-semibold text-gray-700">Quantity</th>
                  <th className="text-right py-3 text-sm font-semibold text-gray-700">Unit Price</th>
                  <th className="text-right py-3 text-sm font-semibold text-gray-700">Amount</th>
                </tr>
              </thead>
              <tbody>
                {invoice.items.map((item, index) => (
                  <tr key={index} className="border-b border-gray-100">
                    <td className="py-4 text-gray-900">{item.description}</td>
                    <td className="py-4 text-center text-gray-900">{item.quantity}</td>
                    <td className="py-4 text-right text-gray-900">{currencySymbol}{item.unitPrice.toFixed(2)}</td>
                    <td className="py-4 text-right text-gray-900">
                      {currencySymbol}{(item.quantity * item.unitPrice).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div className="flex justify-end mb-8">
            <div className="w-80">
              <div className="flex justify-between py-2 text-gray-700">
                <span>Subtotal:</span>
                <span className="font-medium">{currencySymbol}{invoice.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between py-2 text-gray-700">
                <span>Tax ({invoice.taxRate}%):</span>
                <span className="font-medium">{currencySymbol}{invoice.taxAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between py-3 border-t-2 border-gray-200 text-xl font-bold text-gray-900">
                <span>Total:</span>
                <span>{currencySymbol}{invoice.total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Notes */}
          {invoice.notes && (
            <div className="border-t border-gray-200 pt-6">
              <div className="text-sm font-semibold text-gray-700 mb-2">Notes</div>
              <div className="text-gray-600 whitespace-pre-wrap">{invoice.notes}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}