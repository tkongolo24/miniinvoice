import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import axios from 'axios';

const CURRENCIES = [
  { code: 'RWF', symbol: 'RWF', name: 'Rwandan Franc' },
  { code: 'KES', symbol: 'KSH', name: 'Kenyan Shilling' },
  { code: 'NGN', symbol: 'NGN', name: 'Nigerian Naira' },
  { code: 'CFA', symbol: 'CFA', name: 'CFA Franc' },
];

const DEFAULT_TAX_RATES = {
  RWF: 18,
  KES: 16,
  NGN: 7.5,
  CFA: 18,
};

function CreateInvoice() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [checkingProfile, setCheckingProfile] = useState(true);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [errors, setErrors] = useState({});
  
  // NEW: Client dropdown state
  const [clients, setClients] = useState([]);
  const [loadingClients, setLoadingClients] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const [showClientDropdown, setShowClientDropdown] = useState(false);
  const [clientSearchTerm, setClientSearchTerm] = useState('');
  
  // NEW: Product dropdown state
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [showProductDropdown, setShowProductDropdown] = useState(null); // Track which item index
  const [productSearchTerm, setProductSearchTerm] = useState('');
  
  const [formData, setFormData] = useState({
    invoiceNumber: `INV-${Date.now()}`,
    clientId: null, // NEW: Store client ID
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

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  const token = localStorage.getItem('token');

  useEffect(() => {
    checkProfileComplete();
    fetchClients();
    fetchProducts(); // NEW: Fetch products on mount
  }, []);

  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      taxRate: DEFAULT_TAX_RATES[prev.currency],
    }));
  }, [formData.currency]);

  // NEW: Fetch clients from API
  const fetchClients = async () => {
    try {
      setLoadingClients(true);
      const response = await axios.get(`${API_URL}/api/clients`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setClients(response.data);
    } catch (err) {
      console.error('Failed to fetch clients:', err);
    } finally {
      setLoadingClients(false);
    }
  };

  // NEW: Fetch products from API
  const fetchProducts = async () => {
    try {
      setLoadingProducts(true);
      const response = await axios.get(`${API_URL}/api/products`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProducts(response.data);
    } catch (err) {
      console.error('Failed to fetch products:', err);
    } finally {
      setLoadingProducts(false);
    }
  };

  // NEW: Handle client selection
  const handleClientSelect = (client) => {
    setSelectedClient(client);
    setShowClientDropdown(false);
    setClientSearchTerm('');
    
    // Auto-fill client details
    setFormData((prev) => ({
      ...prev,
      clientId: client._id,
      clientName: client.name,
      clientEmail: client.email,
      clientAddress: [client.address, client.city, client.country]
        .filter(Boolean)
        .join(', '),
    }));

    // Auto-calculate due date based on payment terms
    if (client.paymentTerms && formData.dateIssued) {
      const issueDate = new Date(formData.dateIssued);
      const dueDate = new Date(issueDate);
      dueDate.setDate(dueDate.getDate() + client.paymentTerms);
      setFormData((prev) => ({
        ...prev,
        dueDate: dueDate.toISOString().split('T')[0],
      }));
    }

    // Clear any errors
    setErrors((prev) => ({
      ...prev,
      clientName: '',
      clientEmail: '',
      clientAddress: '',
    }));
  };

  // NEW: Clear selected client
  const handleClearClient = () => {
    setSelectedClient(null);
    setFormData((prev) => ({
      ...prev,
      clientId: null,
      clientName: '',
      clientEmail: '',
      clientAddress: '',
    }));
  };

  // NEW: Filter clients based on search
  const filteredClients = clients.filter((client) =>
    client.name.toLowerCase().includes(clientSearchTerm.toLowerCase()) ||
    client.email.toLowerCase().includes(clientSearchTerm.toLowerCase())
  );

  // NEW: Handle product selection for an item
  const handleProductSelect = (product, itemIndex) => {
    const updatedItems = [...formData.items];
    updatedItems[itemIndex] = {
      ...updatedItems[itemIndex],
      description: product.name + (product.description ? ` - ${product.description}` : ''),
      unitPrice: product.unitPrice,
      productId: product._id, 
      taxable: product.taxable, 
    };
    setFormData((prev) => ({ ...prev, items: updatedItems }));
    setShowProductDropdown(null);
    setProductSearchTerm('');
  };

  // NEW: Filter products based on search
  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(productSearchTerm.toLowerCase()) ||
    product.description?.toLowerCase().includes(productSearchTerm.toLowerCase()) ||
    product.category?.toLowerCase().includes(productSearchTerm.toLowerCase())
  );

  const checkProfileComplete = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/settings`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.data.profileCompleted) {
        setShowProfileModal(true);
      }
    } catch (err) {
      console.error('Failed to check profile status');
    } finally {
      setCheckingProfile(false);
    }
  };

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
  const discount = calculateDiscount();
  const taxRate = parseFloat(formData.taxRate) || 0;
  
  // Calculate tax only for taxable items
  const taxableSubtotal = formData.items.reduce((sum, item) => {
    // If item has taxable property set to false, exclude it
    if (item.taxable === false) return sum;
    
    const itemTotal = (parseFloat(item.quantity) || 0) * (parseFloat(item.unitPrice) || 0);
    return sum + itemTotal;
  }, 0);
  
  // Apply discount proportionally
  const discountedTaxableAmount = taxableSubtotal - (discount * (taxableSubtotal / calculateSubtotal()));
  
  // Extract VAT from VAT-inclusive price
  return discountedTaxableAmount * (taxRate / (100 + taxRate));
  };

  const calculateNetAmount = () => {
  const subtotal = calculateSubtotal();
  const discount = calculateDiscount();
  const tax = calculateTax();
  return subtotal - discount - tax;
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

    // QUICK WIN #2: Enhanced validation for items
    const invalidItems = formData.items.some(
      (item) => !item.description.trim() || !item.quantity || parseFloat(item.quantity) <= 0 || !item.unitPrice || parseFloat(item.unitPrice) <= 0
    );
    if (invalidItems) {
      newErrors.items = 'All items must have a description, quantity greater than 0, and price greater than 0';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      // Scroll to top to show errors
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setLoading(true);
    try {
      // FIXED: Include clientId in the invoice data
      const invoiceData = {
        ...formData,
        clientId: formData.clientId, // Now clientId will be sent to backend
        subtotal: calculateSubtotal(),
        discount: formData.hasDiscount ? parseFloat(formData.discount) || 0 : 0,
        netAmount: calculateNetAmount(),
        tax: calculateTax(),
        total: calculateTotal(),
      };

      await axios.post(`${API_URL}/api/invoices`, invoiceData, {
        headers: { Authorization: `Bearer ${token}` },
      });
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

  if (checkingProfile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      {/* Profile Incomplete Modal */}
      {showProfileModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 sm:p-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-orange-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
                Complete Your Profile First
              </h2>
              <p className="text-sm sm:text-base text-gray-600 mb-6">
                Please add your company details before creating invoices. This information will appear on your invoices.
              </p>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => navigate('/company-profile')}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition font-medium text-sm sm:text-base"
              >
                Complete Profile
              </button>
              <button
                onClick={() => setShowProfileModal(false)}
                className="w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-200 transition font-medium text-sm sm:text-base"
              >
                Continue Anyway
              </button>
            </div>
          </div>
        </div>
      )}

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

            {/* Client Information with Dropdown */}
            <div className="border-t border-gray-200 pt-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Client Information</h2>
              
              {/* NEW: Client Dropdown Section */}
              {!selectedClient ? (
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Existing Client (Optional)
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="🔍 Search clients by name or email..."
                      value={clientSearchTerm}
                      onChange={(e) => {
                        setClientSearchTerm(e.target.value);
                        setShowClientDropdown(true);
                      }}
                      onFocus={() => setShowClientDropdown(true)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    
                    {/* Dropdown Results */}
                    {showClientDropdown && filteredClients.length > 0 && (
                      <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                        {loadingClients ? (
                          <div className="p-4 text-center text-gray-500">Loading clients...</div>
                        ) : (
                          filteredClients.map((client) => (
                            <button
                              key={client._id}
                              type="button"
                              onClick={() => handleClientSelect(client)}
                              className="w-full text-left px-4 py-3 hover:bg-blue-50 border-b border-gray-100 last:border-b-0 transition"
                            >
                              <div className="font-medium text-gray-900">{client.name}</div>
                              <div className="text-sm text-gray-600">{client.email}</div>
                              {(client.city || client.country) && (
                                <div className="text-xs text-gray-500 mt-1">
                                  📍 {[client.city, client.country].filter(Boolean).join(', ')}
                                </div>
                              )}
                            </button>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                  
                  <p className="mt-2 text-sm text-gray-500">
                    Or enter client details manually below
                  </p>
                </div>
              ) : (
                /* NEW: Selected Client Display */
                <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-green-600 font-medium">✅ Client Selected:</span>
                        <span className="font-semibold text-gray-900">{selectedClient.name}</span>
                      </div>
                      <div className="text-sm text-gray-600 space-y-1">
                        <div>📧 {selectedClient.email}</div>
                        {selectedClient.phone && <div>📞 {selectedClient.phone}</div>}
                        {(selectedClient.city || selectedClient.country) && (
                          <div>📍 {[selectedClient.city, selectedClient.country].filter(Boolean).join(', ')}</div>
                        )}
                        {selectedClient.paymentTerms && (
                          <div>📅 Payment Terms: {selectedClient.paymentTerms} days</div>
                        )}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleClearClient}
                      className="ml-4 px-3 py-1 text-sm bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                    >
                      Change
                    </button>
                  </div>
                </div>
              )}

              {/* Manual Entry Fields */}
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
                    disabled={!!selectedClient}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.clientName ? 'border-red-500' : 'border-gray-300'
                    } ${selectedClient ? 'bg-gray-100 cursor-not-allowed' : ''}`}
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
                    disabled={!!selectedClient}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.clientEmail ? 'border-red-500' : 'border-gray-300'
                    } ${selectedClient ? 'bg-gray-100 cursor-not-allowed' : ''}`}
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
                    disabled={!!selectedClient}
                    rows="3"
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.clientAddress ? 'border-red-500' : 'border-gray-300'
                    } ${selectedClient ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                    required
                  />
                  {errors.clientAddress && (
                    <p className="mt-1 text-sm text-red-600">{errors.clientAddress}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Items with Product Dropdown */}
            <div className="border-t border-gray-200 pt-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-900">Invoice Items</h2>
                <button
                  type="button"
                  onClick={() => navigate('/products')}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  + Manage Products
                </button>
              </div>
              
              {errors.items && (
                <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                  {errors.items}
                </div>
              )}
              
              <div className="space-y-4">
                {formData.items.map((item, index) => (
                  <div key={index} className="bg-gray-50 p-4 rounded-lg">
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                      <div className="md:col-span-5">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Description
                        </label>
                        
                        {/* Product Search Dropdown */}
                        <div className="relative mb-2">
                          <input
                            type="text"
                            placeholder="🔍 Search products..."
                            value={showProductDropdown === index ? productSearchTerm : ''}
                            onChange={(e) => {
                              setProductSearchTerm(e.target.value);
                              setShowProductDropdown(index);
                            }}
                            onFocus={() => setShowProductDropdown(index)}
                            className="w-full px-4 py-2 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                          />
                          
                          {/* Dropdown Results */}
                          {showProductDropdown === index && filteredProducts.length > 0 && (
                            <div className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                              {loadingProducts ? (
                                <div className="p-4 text-center text-gray-500 text-sm">Loading products...</div>
                              ) : (
                                filteredProducts.map((product) => (
                                  <button
                                    key={product._id}
                                    type="button"
                                    onClick={() => handleProductSelect(product, index)}
                                    className="w-full text-left px-4 py-3 hover:bg-blue-50 border-b border-gray-100 last:border-b-0 transition"
                                  >
                                    <div className="font-medium text-gray-900 text-sm">{product.name}</div>
                                    <div className="text-xs text-gray-600 flex justify-between mt-1">
                                      <span>{product.description}</span>
                                      <span className="font-semibold text-blue-600">
                                        {getCurrencySymbol()} {product.unitPrice.toFixed(2)}
                                      </span>
                                    </div>
                                  </button>
                                ))
                              )}
                            </div>
                          )}
                        </div>
                        
                        <input
                          type="text"
                          value={item.description}
                          onChange={(e) =>
                            handleItemChange(index, 'description', e.target.value)
                          }
                          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                            !item.description.trim() ? 'border-red-300 bg-red-50' : 'border-gray-300'
                          }`}
                          placeholder="Item description or use search above"
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
                          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                            !item.quantity || parseFloat(item.quantity) <= 0 ? 'border-red-300 bg-red-50' : 'border-gray-300'
                          }`}
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
                          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                            !item.unitPrice || parseFloat(item.unitPrice) <= 0 ? 'border-red-300 bg-red-50' : 'border-gray-300'
                          }`}
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
                      {((parseFloat(item.quantity) || 0) * (parseFloat(item.unitPrice) || 0)).toLocaleString('en-US', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </div>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={addItem}
                  className="w-full sm:w-auto px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                >
                  + Add Item
                </button>
              </div>
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

      {/* Click outside to close dropdown */}
      {showClientDropdown && (
        <div
          className="fixed inset-0 z-0"
          onClick={() => setShowClientDropdown(false)}
        />
      )}

      {/* Click outside to close product dropdown */}
      {showProductDropdown !== null && (
        <div
          className="fixed inset-0 z-10"
          onClick={() => {
            setShowProductDropdown(null);
            setProductSearchTerm('');
          }}
        />
      )}
    </div>
  );
}

export default CreateInvoice;