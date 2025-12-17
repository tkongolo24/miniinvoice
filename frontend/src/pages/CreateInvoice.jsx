import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const CURRENCIES = [
  { code: 'RWF', symbol: 'RWF', name: 'Rwandan Franc' },
  { code: 'KES', symbol: 'KSH', name: 'Kenyan Shilling' },
  { code: 'NGN', symbol: 'NGN', name: 'Nigerian Naira' },
];

const DEFAULT_TAX_RATES = {
  RWF: 18,
  KES: 16,
  NGN: 7.5,
};

function CreateInvoice() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    invoiceNumber: `INV-${Date.now()}`,
    clientName: '',
    clientEmail: '',
    clientAddress: '',
    dateIssued: new Date().toISOString().split('T')[0],
    dueDate: '',
    items: [{ description: '', quantity: '', unitPrice: '' }],
    notes: '',
    currency: 'RWF',
    template: 'classic',
    taxRate: 18,
    hasDiscount: false,
    discount: 0,
    discountType: 'percentage',
  });

  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      taxRate: DEFAULT_TAX_RATES[prev.currency],
    }));
  }, [formData.currency]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleItemChange = (index, field, value) => {
    const updatedItems = [...formData.items];
    updatedItems[index][field] = value;
    setFormData((prev) => ({ ...prev, items: updatedItems }));
  };

  const addItem = () => {
    setFormData((prev) => ({
      ...prev,
      items: [...prev.items, { description: '', quantity: '', unitPrice: '' }],
    }));
  };

  const removeItem = (index) => {
    if (formData.items.length > 1) {
      setFormData((prev) => ({
        ...prev,
        items: prev.items.filter((_, i) => i !== index),
      }));
    }
  };

  const calculateSubtotal = () => {
    return formData.items.reduce(
      (sum, item) => sum + (parseFloat(item.quantity) || 0) * (parseFloat(item.unitPrice) || 0),
      0
    );
  };

  const calculateDiscount = () => {
    if (!formData.hasDiscount) return 0;
    
    const subtotal = calculateSubtotal();
    if (formData.discountType === 'percentage') {
      return (subtotal * (parseFloat(formData.discount) || 0)) / 100;
    }
    return parseFloat(formData.discount) || 0;
  };

  const calculateTax = () => {
    const grossPrice = calculateSubtotal();
    const discount = calculateDiscount();
    const discountedGross = grossPrice - discount;
    const taxRate = parseFloat(formData.taxRate) || 0;
    // Extract VAT from VAT-inclusive price
    return discountedGross * (taxRate / (100 + taxRate));
  };

  const calculateNetAmount = () => {
    const grossPrice = calculateSubtotal();
    const discount = calculateDiscount();
    const discountedGross = grossPrice - discount;
    const tax = calculateTax();
    return discountedGross - tax;
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const discount = calculateDiscount();
    // Total is VAT-inclusive (subtotal minus discount)
    return subtotal - discount;
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.clientName.trim()) {
      newErrors.clientName = 'Client name is required';
    }
    if (!formData.clientEmail.trim()) {
      newErrors.clientEmail = 'Client email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.clientEmail)) {
      newErrors.clientEmail = 'Invalid email format';
    }
    if (!formData.clientAddress.trim()) {
      newErrors.clientAddress = 'Client address is required';
    }

    if (!formData.dueDate) {
      newErrors.dueDate = 'Due date is required';
    } else if (new Date(formData.dueDate) < new Date(formData.dateIssued)) {
      newErrors.dueDate = 'Due date must be after issue date';
    }

    const invalidItems = formData.items.some(
      (item) => !item.description.trim() || item.quantity < 1 || item.unitPrice <= 0
    );
    if (invalidItems) {
      newErrors.items = 'All items must have description, valid quantity, and price';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const invoiceData = {
        ...formData,
        subtotal: calculateSubtotal(),
        discount: calculateDiscount(),
        netAmount: calculateNetAmount(),
        tax: calculateTax(),
        total: calculateTotal(),
      };

      await api.post('/api/invoices', invoiceData);
      navigate('/dashboard');
    } catch (error) {
      console.error('Error creating invoice:', error);
      setErrors({
        submit: error.response?.data?.message || 'Failed to create invoice. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  const getCurrencySymbol = () => {
    const currency = CURRENCIES.find((c) => c.code === formData.currency);
    return currency ? currency.symbol : '';
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white shadow-lg rounded-lg p-6 sm:p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Create Invoice</h1>

          {errors.submit && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {errors.submit}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Invoice Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Invoice Number
                </label>
                <input
                  type="text"
                  name="invoiceNumber"
                  value={formData.invoiceNumber}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Currency
                </label>
                <select
                  name="currency"
                  value={formData.currency}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {CURRENCIES.map((curr) => (
                    <option key={curr.code} value={curr.code}>
                      {curr.code} - {curr.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date Issued
                </label>
                <input
                  type="date"
                  name="dateIssued"
                  value={formData.dateIssued}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Due Date
                </label>
                <input
                  type="date"
                  name="dueDate"
                  value={formData.dueDate}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.dueDate ? 'border-red-500' : 'border-gray-300'
                  }`}
                  required
                />
                {errors.dueDate && (
                  <p className="mt-1 text-sm text-red-600">{errors.dueDate}</p>
                )}
              </div>
            </div>

            {/* Client Information */}
            <div className="border-t border-gray-200 pt-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Client Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Client Name *
                  </label>
                  <input
                    type="text"
                    name="clientName"
                    value={formData.clientName}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.clientName ? 'border-red-500' : 'border-gray-300'
                    }`}
                    required
                  />
                  {errors.clientName && (
                    <p className="mt-1 text-sm text-red-600">{errors.clientName}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Client Email *
                  </label>
                  <input
                    type="email"
                    name="clientEmail"
                    value={formData.clientEmail}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.clientEmail ? 'border-red-500' : 'border-gray-300'
                    }`}
                    required
                  />
                  {errors.clientEmail && (
                    <p className="mt-1 text-sm text-red-600">{errors.clientEmail}</p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Client Address *
                  </label>
                  <textarea
                    name="clientAddress"
                    value={formData.clientAddress}
                    onChange={handleChange}
                    rows="3"
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.clientAddress ? 'border-red-500' : 'border-gray-300'
                    }`}
                    required
                  />
                  {errors.clientAddress && (
                    <p className="mt-1 text-sm text-red-600">{errors.clientAddress}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Items */}
            <div className="border-t border-gray-200 pt-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Invoice Items</h2>
              {errors.items && (
                <p className="mb-4 text-sm text-red-600">{errors.items}</p>
              )}
              <div className="space-y-4">
                {formData.items.map((item, index) => (
                  <div key={index} className="bg-gray-50 p-4 rounded-lg">
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                      <div className="md:col-span-5">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Description
                        </label>
                        <input
                          type="text"
                          value={item.description}
                          onChange={(e) =>
                            handleItemChange(index, 'description', e.target.value)
                          }
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Item description"
                          required
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Quantity
                        </label>
                        <input
                          type="text"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          value={item.quantity}
                          onChange={(e) =>
                            handleItemChange(index, 'quantity', e.target.value)
                          }
                          placeholder="0"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          required
                        />
                      </div>

                      <div className="md:col-span-3">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Unit Price ({getCurrencySymbol()})
                        </label>
                        <input
                          type="text"
                          inputMode="decimal"
                          value={item.unitPrice}
                          onChange={(e) =>
                            handleItemChange(index, 'unitPrice', e.target.value)
                          }
                          placeholder="0.00"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          required
                        />
                      </div>

                      <div className="md:col-span-2 flex items-end">
                        <button
                          type="button"
                          onClick={() => removeItem(index)}
                          disabled={formData.items.length === 1}
                          className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                        >
                          Remove
                        </button>
                      </div>
                    </div>

                    <div className="mt-2 text-sm text-gray-600">
                      Total: {getCurrencySymbol()}{' '}
                      {(item.quantity * item.unitPrice).toLocaleString('en-US', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </div>
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={addItem}
                className="mt-4 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                + Add Item
              </button>
            </div>

            {/* Discount Section */}
            <div className="border-t border-gray-200 pt-6">
              <div className="flex items-center justify-between mb-4">
                <label className="text-sm font-medium text-gray-700">Apply Discount</label>
                <input
                  type="checkbox"
                  checked={formData.hasDiscount}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, hasDiscount: e.target.checked }))
                  }
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
              </div>

              {formData.hasDiscount && (
                <div className="flex gap-2">
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="Discount amount"
                    value={formData.discount}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, discount: e.target.value }))
                    }
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <select
                    value={formData.discountType}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, discountType: e.target.value }))
                    }
                    className="w-32 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="percentage">%</option>
                    <option value="fixed">Fixed</option>
                  </select>
                </div>
              )}
            </div>

            {/* Tax Section */}
            <div className="border-t border-gray-200 pt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tax Rate (%)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                max="100"
                value={formData.taxRate}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, taxRate: e.target.value }))
                }
                className="w-full md:w-64 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="mt-1 text-xs text-gray-500">
                Default: {DEFAULT_TAX_RATES[formData.currency]}% VAT for {formData.currency}
              </p>
            </div>

            {/* Notes */}
            <div className="border-t border-gray-200 pt-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes (Optional)
                </label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  rows="3"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Payment terms, thank you note, etc."
                />
              </div>
            </div>

            {/* Summary */}
            <div className="border-t border-gray-200 pt-6">
              <div className="bg-blue-50 p-6 rounded-lg space-y-3">
                <div className="flex justify-between text-gray-700">
                  <span>Items Total (incl. VAT):</span>
                  <span>
                    {getCurrencySymbol()}{' '}
                    {calculateSubtotal().toLocaleString('en-US', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </span>
                </div>

                {formData.hasDiscount && (
                  <>
                    <div className="flex justify-between text-red-600">
                      <span>
                        Discount ({formData.discount}
                        {formData.discountType === 'percentage' ? '%' : ` ${getCurrencySymbol()}`}):
                      </span>
                      <span>
                        -{getCurrencySymbol()}{' '}
                        {calculateDiscount().toLocaleString('en-US', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </span>
                    </div>
                    <div className="flex justify-between text-gray-900 font-medium border-t border-blue-200 pt-3">
                      <span>Subtotal after discount:</span>
                      <span>
                        {getCurrencySymbol()}{' '}
                        {calculateTotal().toLocaleString('en-US', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </span>
                    </div>
                  </>
                )}

                <div className="flex justify-between text-gray-600 text-sm pt-2">
                  <span>Net Amount (excl. VAT):</span>
                  <span>
                    {getCurrencySymbol()}{' '}
                    {calculateNetAmount().toLocaleString('en-US', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </span>
                </div>

                <div className="flex justify-between text-gray-600 text-sm">
                  <span>VAT ({formData.taxRate}%):</span>
                  <span>
                    {getCurrencySymbol()}{' '}
                    {calculateTax().toLocaleString('en-US', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </span>
                </div>

                <div className="flex justify-between text-xl font-bold text-gray-900 border-t-2 border-blue-300 pt-3">
                  <span>Total Payable:</span>
                  <span>
                    {getCurrencySymbol()}{' '}
                    {calculateTotal().toLocaleString('en-US', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </span>
                </div>
              </div>
            </div>

            {/* Submit Buttons */}
            <div className="flex gap-4 justify-end">
              <button
                type="button"
                onClick={() => navigate('/dashboard')}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <svg
                      className="animate-spin h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Creating Invoice...
                  </>
                ) : (
                  'Create Invoice'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default CreateInvoice;