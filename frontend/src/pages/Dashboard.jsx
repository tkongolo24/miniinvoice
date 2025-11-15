import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getInvoices, deleteInvoice, updateInvoiceStatus } from '../utils/api';
import { useLanguage } from '../contexts/LanguageContext';

function Dashboard({ setToken }) {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { t } = useLanguage();

  useEffect(() => {
    fetchInvoices();
  }, []);

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

  const handleDelete = async (id) => {
    if (window.confirm(t('deleteConfirm'))) {
      try {
        await deleteInvoice(id);
        setInvoices(invoices.filter(inv => inv._id !== id));
      } catch (error) {
        alert(t('failedToDelete'));
      }
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await updateInvoiceStatus(id, newStatus);
      setInvoices(invoices.map(inv => 
        inv._id === id ? { ...inv, status: newStatus } : inv
      ));
    } catch (error) {
      alert(t('failedToUpdateStatus'));
    }
  };

  const handleDuplicate = (invoice) => {
    navigate('/create-invoice', { state: { duplicateFrom: invoice } });
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'unpaid': return 'bg-yellow-100 text-yellow-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-gray-600">{t('loading')}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-blue-600">{t('appName')}</h1>
          <div className="flex items-center gap-4">
            <Link to="/settings" className="text-sm text-gray-600 hover:text-gray-900">
              Settings
            </Link>
            <Link to="/profile" className="text-sm text-gray-600 hover:text-gray-900">
              {t('profile')}
            </Link>
            <button onClick={handleLogout} className="text-sm text-gray-600 hover:text-gray-900">
              {t('logout')}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-gray-900">{t('yourInvoices')}</h2>
          <Link
            to="/create-invoice"
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            + {t('createInvoice')}
          </Link>
        </div>

        {invoices.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-600 mb-4">{t('noInvoicesYet')}</p>
            <Link
              to="/create-invoice"
              className="inline-block bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700"
            >
              {t('createFirstInvoice')}
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('invoiceNumber')}</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('client')}</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('total')}</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('status')}</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('actions')}</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {invoices.map((invoice) => (
                  <tr key={invoice._id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {invoice.invoiceNumber}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {invoice.clientName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {invoice.currency} {invoice.total.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <select
                        value={invoice.status}
                        onChange={(e) => handleStatusChange(invoice._id, e.target.value)}
                        className={`text-xs px-2 py-1 rounded-full ${getStatusColor(invoice.status)}`}
                      >
                        <option value="unpaid">{t('unpaid')}</option>
                        <option value="paid">{t('paid')}</option>
                        <option value="overdue">{t('overdue')}</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <Link
                        to={`/invoice/${invoice._id}`}
                        className="text-blue-600 hover:text-blue-900 mr-3"
                      >
                        {t('view')}
                      </Link>
                      {invoice.status !== 'paid' && (
                        <button
                          onClick={() => navigate(`/edit-invoice/${invoice._id}`)}
                          className="text-purple-600 hover:text-purple-900 mr-3"
                        >
                          {t('edit')}
                        </button>
                      )}
                      <button
                        onClick={() => handleDuplicate(invoice)}
                        className="text-green-600 hover:text-green-900 mr-3"
                      >
                        {t('duplicate')}
                      </button>
                      <button
                        onClick={() => handleDelete(invoice._id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        {t('delete')}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}

export default Dashboard;