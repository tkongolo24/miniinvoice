import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createInvoice } from '../utils/api';

function CreateInvoice() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    invoiceNumber: `INV-${Date.now()}`,
    clientName: '',
    clientEmail: '',
    clientAddress: '',
    clientPhone: '',
    dateIssued: new Date().toISOString().split('T')[0],
    dueDate: '',
    currency: 'RWF',
    taxRate: 18,
    notes: '',
    paymentInstructions: '',
  });

  const [items, setItems] = useState([
    { description: '', quantity: 1, unitPrice: 0 }
  ]);

  const addItem = () => {
    setItems([...items, { description: '', quantity: 1, unitPrice: 0 }]);
  };

  const removeItem = (index) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const updateItem = (index, field, value) => {
    const newItems = [...items];
    newItems[index][field] = value;
    setItems(newItems);
  };

  const calculateSubtotal = () => {
    return items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
  };

  const calculateTax = () => {
    return (calculateSubtotal() * formData.taxRate) / 100;
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateTax();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const invoiceData = {
      ...formData,
      items: items.map(item => ({
        ...item,
        total: item.quantity * item.unitPrice
      })),
      subtotal: calculateSubtotal(),
      taxAmount: calculateTax(),
      total: calculateTotal(),
    };

    try {
      await createInvoice(invoiceData);
      alert('Invoice created successfully!');
      navigate('/dashboard');
    } catch (error) {
      alert('Failed to create invoice');
      console.error(error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-blue-600">Create Invoice</h1>
            <button
              onClick={() => navigate('/dashboard')}
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              ← Back to Dashboard
            </button>
          </div>
        </div>
      </header>

      {/* Form */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-6">
          {/* Invoice Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Invoice Number
              </label>
              <input
                type="text"
                required
                value={formData.invoiceNumber}
                onChange={(e) => setFormData({ ...formData, invoiceNumber: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Currency
              </label>
              <select
                value={formData.currency}
                onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              >
                <option value="RWF">RWF</option>
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
                <option value="KES">KES</option>
                <option value="NGN">NGN</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date Issued
              </label>
              <input
                type="date"
                required
                value={formData.dateIssued}
                onChange={(e) => setFormData({ ...formData, dateIssued: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Due Date
              </label>
              <input
                type="date"
                required
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Client Details */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold mb-4">Client Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Client Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.clientName}
                  onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Client Email *
                </label>
                <input
                  type="email"
                  required
                  value={formData.clientEmail}
                  onChange={(e) => setFormData({ ...formData, clientEmail: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Client Phone
                </label>
                <input
                  type="tel"
                  value={formData.clientPhone}
                  onChange={(e) => setFormData({ ...formData, clientPhone: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Client Address
                </label>
                <input
                  type="text"
                  value={formData.clientAddress}
                  onChange={(e) => setFormData({ ...formData, clientAddress: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Items */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold mb-4">Invoice Items</h3>
            {items.map((item, index) => (
              <div key={index} className="grid grid-cols-12 gap-2 mb-3">
                <div className="col-span-5">
                  <input
                    type="text"
                    placeholder="Description"
                    required
                    value={item.description}
                    onChange={(e) => updateItem(index, 'description', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="col-span-2">
                  <input
                    type="number"
                    placeholder="Qty"
                    required
                    min="1"
                    value={item.quantity}
                    onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="col-span-3">
                  <input
                    type="number"
                    placeholder="Price"
                    required
                    min="0"
                    value={item.unitPrice}
                    onChange={(e) => updateItem(index, 'unitPrice', parseFloat(e.target.value))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="col-span-2 flex items-center">
                  <span className="text-sm font-medium mr-2">
                    {(item.quantity * item.unitPrice).toFixed(2)}
                  </span>
                  {items.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeItem(index)}
                      className="text-red-600 hover:text-red-800"
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
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              + Add Item
            </button>
          </div>

          {/* Totals */}
          <div className="border-t pt-6">
            <div className="max-w-sm ml-auto space-y-2">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span className="font-medium">{calculateSubtotal().toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Tax:</span>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={formData.taxRate}
                    onChange={(e) => setFormData({ ...formData, taxRate: parseFloat(e.target.value) })}
                    className="w-16 px-2 py-1 border border-gray-300 rounded text-sm"
                    min="0"
                    max="100"
                  />
                  <span>% = {calculateTax().toFixed(2)}</span>
                </div>
              </div>
              <div className="flex justify-between text-lg font-bold border-t pt-2">
                <span>Total:</span>
                <span>{formData.currency} {calculateTotal().toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="border-t pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows="3"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  placeholder="Additional notes..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Payment Instructions
                </label>
                <textarea
                  value={formData.paymentInstructions}
                  onChange={(e) => setFormData({ ...formData, paymentInstructions: e.target.value })}
                  rows="3"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  placeholder="Bank details, mobile money, etc..."
                />
              </div>
            </div>
          </div>

          {/* Submit */}
          <div className="flex justify-end gap-4 pt-6 border-t">
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Create Invoice
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}

export default CreateInvoice;