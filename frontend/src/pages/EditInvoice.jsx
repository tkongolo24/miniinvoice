import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getInvoice, updateInvoice } from '../utils/api';
import { useLanguage } from '../contexts/LanguageContext';

export default function EditInvoice() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { t } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: '' });
  
  const [formData, setFormData] = useState({
    invoiceNumber: '',
    clientName: '',
    clientEmail: '',
    clientAddress: '',
    issueDate: '',
    dueDate: '',
    items: [{ description: '', quantity: 1, rate: 0 }],
    notes: '',
    currency: 'RWF',
    status: 'unpaid'
  });

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: '', type: '' });
    }, 3000);
  };

  useEffect(() => {
    const loadInvoice = async () => {
      try {
        const response = await getInvoice(id);
        const invoice = response.data;
        
        if (invoice.status === 'paid') {
          showToast(t('cannotEditPaid'), 'error');
          setTimeout(() => navigate('/dashboard'), 2000);
          return;
        }
        
        const formattedInvoice = {
          invoiceNumber: invoice.invoiceNumber || '',
          clientName: invoice.clientName || '',
          clientEmail: invoice.clientEmail || '',
          clientAddress: invoice.clientAddress || '',
          issueDate: invoice.issueDate ? new Date(invoice.issueDate).toISOString().split('T')[0] : '',
          dueDate: invoice.dueDate ? new Date(invoice.dueDate).toISOString().split('T')[0] : '',
          items: invoice.items || [{ description: '', quantity: 1, rate: 0 }],
          notes: invoice.notes || '',
          currency: invoice.currency || 'RWF',
          status: invoice.status || 'unpaid'
        };
        
        setFormData(formattedInvoice);
        setLoading(false);
      } catch (error) {
        console.error('Error loading invoice:', error);
        showToast(t('failedToLoad'), 'error');
        setTimeout(() => navigate('/dashboard'), 2000);
      }
    };

    loadInvoice();
  }, [id, navigate, t]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...formData.items];
    newItems[index][field] = value;
    setFormData({ ...formData, items: newItems });
  };

  const addItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { description: '', quantity: 1, rate: 0 }]
    });
  };

  const removeItem = (index) => {
    if (formData.items.length > 1) {
      const newItems = formData.items.filter((_, i) => i !== index);
      setFormData({ ...formData, items: newItems });
    }
  };

  const calculateSubtotal = () => {
    return formData.items.reduce((sum, item) => {
      return sum + (Number(item.quantity) * Number(item.rate));
    }, 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const total = calculateSubtotal();
      const dataToSend = {
        ...formData,
        total: total
      };

      await updateInvoice(id, dataToSend);
      showToast(t('invoiceUpdated'), 'success');
      
      setTimeout(() => {
        navigate('/dashboard');
      }, 1500);
    } catch (error) {
      console.error('Error updating invoice:', error);
      showToast(error.message || t('failedToUpdate'), 'error');
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">{t('loadingInvoice')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      {toast.show && (
        <div className="fixed inset-0 flex items-center justify-center z-50 px-4">
          <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setToast({ show: false, message: '', type: '' })}></div>
          <div className={`relative bg-white rounded-lg shadow-xl p-6 max-w-md w-full ${
            toast.type === 'error' ? 'border-l-4 border-red-500' : 'border-l-4 border-green-500'
          }`}>
            <div className="flex items-start">
              <div className="flex-shrink-0">
                {toast.type === 'error' ? (
                  <svg className="h-6 w-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                ) : (
                  <svg className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                )}
              </div>
              <div className="ml-3 flex-1">
                <p className="text-sm font-medium text-gray-900">{toast.message}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-6 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">{t('editInvoice')}</h1>
          <button
            onClick={() => navigate('/dashboard')}
            className="text-blue-600 hover:text-blue-800"
          >
            ← {t('backToDashboard')}
          </button>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6">
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">{t('invoiceDetails')}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('invoiceNumberLabel')} *
                </label>
                <input
                  type="text"
                  name="invoiceNumber"
                  value={formData.invoiceNumber}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('currency')} *
                </label>
                <select
                  name="currency"
                  value={formData.currency}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="RWF">RWF - Rwandan Franc</option>
                  <option value="KES">KES - Kenyan Shilling</option>
                  <option value="NGN">NGN - Nigerian Naira</option>
                  <option value="GHS">GHS - Ghanaian Cedi</option>
                  <option value="UGX">UGX - Ugandan Shilling</option>
                  <option value="TZS">TZS - Tanzanian Shilling</option>
                  <option value="USD">USD - US Dollar</option>
                  <option value="EUR">EUR - Euro</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('issueDate')} *
                </label>
                <input
                  type="date"
                  name="issueDate"
                  value={formData.issueDate}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('dueDate')} *
                </label>
                <input
                  type="date"
                  name="dueDate"
                  value={formData.dueDate}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('statusLabel')} *
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="unpaid">{t('unpaid')}</option>
                  <option value="paid">{t('paid')}</option>
                  <option value="overdue">{t('overdue')}</option>
                </select>
              </div>
            </div>
          </div>

          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">{t('clientInformation')}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('clientName')} *
                </label>
                <input
                  type="text"
                  name="clientName"
                  value={formData.clientName}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('clientEmail')} *
                </label>
                <input
                  type="email"
                  name="clientEmail"
                  value={formData.clientEmail}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('clientAddress')}
                </label>
                <textarea
                  name="clientAddress"
                  value={formData.clientAddress}
                  onChange={handleChange}
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          <div className="mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-800">{t('items')}</h2>
              <button
                type="button"
                onClick={addItem}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition"
              >
                + {t('addItem')}
              </button>
            </div>

            {formData.items && formData.items.map((item, index) => (
              <div key={index} className="border border-gray-200 rounded-md p-4 mb-4">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                  <div className="md:col-span-5">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('description')} *
                    </label>
                    <input
                      type="text"
                      value={item.description}
                      onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                      required
                      placeholder={t('descriptionPlaceholder')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('quantity')} *
                    </label>
                    <input
                      type="number"
                      value={item.quantity}
                      onChange={(e) => handleItemChange(index, 'quantity', parseFloat(e.target.value) || 0)}
                      required
                      min="0"
                      step="0.01"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('rate')} *
                    </label>
                    <input
                      type="number"
                      value={item.rate}
                      onChange={(e) => handleItemChange(index, 'rate', parseFloat(e.target.value) || 0)}
                      required
                      min="0"
                      step="0.01"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('amount')}
                    </label>
                    <div className="px-3 py-2 bg-gray-100 rounded-md text-gray-700 font-semibold">
                      {(Number(item.quantity) * Number(item.rate)).toFixed(2)}
                    </div>
                  </div>

                  <div className="md:col-span-1 flex items-end">
                    <button
                      type="button"
                      onClick={() => removeItem(index)}
                      disabled={formData.items.length === 1}
                      className={`w-full px-3 py-2 rounded-md transition ${
                        formData.items.length === 1
                          ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          : 'bg-red-600 text-white hover:bg-red-700'
                      }`}
                    >
                      {t('remove')}
                    </button>
                  </div>
                </div>
              </div>
            ))}

            <div className="bg-blue-50 p-4 rounded-md">
              <div className="flex justify-between items-center text-lg font-semibold">
                <span>{t('total')}:</span>
                <span className="text-blue-600">
                  {formData.currency} {calculateSubtotal().toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('notesOptional')}
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows="4"
              placeholder={t('notesPlaceholder')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex gap-4">
            <button
              type="submit"
              disabled={saving}
              className={`flex-1 py-3 rounded-md font-semibold transition ${
                saving
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              {saving ? t('updating') : t('updateInvoice')}
            </button>
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="px-6 py-3 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition font-semibold"
            >
              {t('cancel')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}