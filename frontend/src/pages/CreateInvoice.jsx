import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';

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

export default function CreateInvoice() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [companyInfo, setCompanyInfo] = useState(null);
  const [currencySymbol, setCurrencySymbol] = useState('$');

  // Form state
  const [formData, setFormData] = useState({
    invoiceNumber: '',
    clientName: '',
    clientEmail: '',
    clientAddress: '',
    dateIssued: new Date().toISOString().split('T')[0],
    dueDate: '',
    items: [{ description: '', quantity: 1, unitPrice: 0 }],
    taxRate: 0,
    notes: '',
    template: 'classic',
    makeDefaultTemplate: false
  });

  // Fetch user profile to get company info and default template
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await api.get('/auth/profile');
        setCompanyInfo(response.data);
        setCurrencySymbol(getCurrencySymbol(response.data.currency || 'USD'));
        
        // If user has a default template, use it
        if (response.data.defaultTemplate) {
          setFormData(prev => ({
            ...prev,
            template: response.data.defaultTemplate
          }));
        }
      } catch (err) {
        console.error('Error fetching profile:', err);
      }
    };

    fetchProfile();
  }, []);

  // Auto-generate invoice number
  useEffect(() => {
    const generateInvoiceNumber = () => {
      const date = new Date();
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
      return `INV-${year}${month}-${random}`;
    };

    setFormData(prev => ({
      ...prev,
      invoiceNumber: generateInvoiceNumber()
    }));
  }, []);

  // Add item
  const addItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { description: '', quantity: 1, unitPrice: 0 }]
    });
  };

  // Remove item
  const removeItem = (index) => {
    const newItems = formData.items.filter((_, i) => i !== index);
    setFormData({ ...formData, items: newItems });
  };

  // Update item
  const updateItem = (index, field, value) => {
    const newItems = [...formData.items];
    newItems[index][field] = field === 'description' ? value : Number(value);
    setFormData({ ...formData, items: newItems });
  };

  // Calculate totals
  const calculateTotals = () => {
    const subtotal = formData.items.reduce(
      (sum, item) => sum + (item.quantity * item.unitPrice),
      0
    );
    const taxAmount = (subtotal * formData.taxRate) / 100;
    const total = subtotal + taxAmount;

    return { subtotal, taxAmount, total };
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { subtotal, taxAmount, total } = calculateTotals();

      const invoiceData = {
        ...formData,
        subtotal,
        taxAmount,
        total,
        status: 'unpaid'
      };

      // Save invoice
      await api.post('/invoices', invoiceData);

      // If "Make Default" is checked, save template preference
      if (formData.makeDefaultTemplate) {
        await api.put('/auth/profile', {
          defaultTemplate: formData.template
        });
      }

      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create invoice');
    } finally {
      setLoading(false);
    }
  };

  const { subtotal, taxAmount, total } = calculateTotals();

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-md p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Create New Invoice</h1>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Invoice Details */}
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Invoice Number
                </label>
                <input
                  type="text"
                  value={formData.invoiceNumber}
                  onChange={(e) => setFormData({ ...formData, invoiceNumber: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date Issued
                </label>
                <input
                  type="date"
                  value={formData.dateIssued}
                  onChange={(e) => setFormData({ ...formData, dateIssued: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Due Date
                </label>
                <input
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tax Rate (%)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.taxRate}
                  onChange={(e) => setFormData({ ...formData, taxRate: Number(e.target.value) })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  min="0"
                />
              </div>
            </div>

            {/* Template Selection */}
            <div className="border-t border-gray-200 pt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Invoice Template
              </label>
              <select
                value={formData.template}
                onChange={(e) => setFormData({ ...formData, template: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="classic">Classic - Traditional blue header with professional layout</option>
                <option value="modern">Modern - Clean minimalist with bold typography</option>
                <option value="elegant">Elegant - Sophisticated purple accent with subtle styling</option>
              </select>

              <div className="mt-3 flex items-center">
                <input
                  type="checkbox"
                  id="makeDefault"
                  checked={formData.makeDefaultTemplate}
                  onChange={(e) => setFormData({ ...formData, makeDefaultTemplate: e.target.checked })}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="makeDefault" className="ml-2 text-sm text-gray-600">
                  Make this my default template for future invoices
                </label>
              </div>
            </div>

            {/* Client Information */}
            <div className="border-t border-gray-200 pt-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Client Information</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Client Name
                  </label>
                  <input
                    type="text"
                    value={formData.clientName}
                    onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Client Email
                  </label>
                  <input
                    type="email"
                    value={formData.clientEmail}
                    onChange={(e) => setFormData({ ...formData, clientEmail: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Client Address (Optional)
                  </label>
                  <textarea
                    value={formData.clientAddress}
                    onChange={(e) => setFormData({ ...formData, clientAddress: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows="3"
                  />
                </div>
              </div>
            </div>

            {/* Items */}
            <div className="border-t border-gray-200 pt-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Invoice Items</h2>
              <div className="space-y-4">
                {formData.items.map((item, index) => (
                  <div key={index} className="grid grid-cols-12 gap-4 items-start">
                    <div className="col-span-5">
                      <input
                        type="text"
                        placeholder="Description"
                        value={item.description}
                        onChange={(e) => updateItem(index, 'description', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>
                    <div className="col-span-2">
                      <input
                        type="number"
                        placeholder="Qty"
                        value={item.quantity}
                        onChange={(e) => updateItem(index, 'quantity', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        min="1"
                        required
                      />
                    </div>
                    <div className="col-span-2">
                      <input
                        type="number"
                        placeholder="Price"
                        value={item.unitPrice}
                        onChange={(e) => updateItem(index, 'unitPrice', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        step="0.01"
                        min="0"
                        required
                      />
                    </div>
                    <div className="col-span-2">
                      <input
                        type="text"
                        value={`${currencySymbol}${(item.quantity * item.unitPrice).toFixed(2)}`}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
                        readOnly
                      />
                    </div>
                    <div className="col-span-1">
                      {formData.items.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeItem(index)}
                          className="w-full px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={addItem}
                  className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                >
                  + Add Item
                </button>
              </div>
            </div>

            {/* Notes */}
            <div className="border-t border-gray-200 pt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notes (Optional)
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows="4"
                placeholder="Payment terms, thank you message, etc."
              />
            </div>

            {/* Totals Summary */}
            <div className="border-t border-gray-200 pt-6">
              <div className="bg-gray-50 rounded-lg p-6 space-y-3">
                <div className="flex justify-between text-gray-700">
                  <span>Subtotal:</span>
                  <span className="font-medium">{currencySymbol}{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-700">
                  <span>Tax ({formData.taxRate}%):</span>
                  <span className="font-medium">{currencySymbol}{taxAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-xl font-bold text-gray-900 pt-3 border-t border-gray-200">
                  <span>Total:</span>
                  <span>{currencySymbol}{total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-4 pt-6">
              <button
                type="button"
                onClick={() => navigate('/dashboard')}
                className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium disabled:bg-blue-300"
              >
                {loading ? 'Creating...' : 'Create Invoice'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}