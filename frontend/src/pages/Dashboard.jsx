import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import ProfileCompleteModal from '../components/ProfileCompleteModal';
// Heroicons for better, accessible icons
import {
  UserGroupIcon,
  CubeIcon,
  BuildingOfficeIcon,
  ArrowRightOnRectangleIcon,
  EyeIcon,
  PencilSquareIcon,
  TrashIcon,
  EllipsisVerticalIcon,
  PlusCircleIcon,
} from '@heroicons/react/24/outline';

// QUICK WIN #4: Date formatter utility
const formatDate = (date) => {
  if (!date) return '';
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

const Dashboard = () => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');
  const [showProfileModal, setShowProfileModal] = useState(false);
  // QUICK WIN #3: Delete confirmation modal state
  const [deleteConfirm, setDeleteConfirm] = useState({
    show: false,
    invoice: null
  });
  // SPRINT 4: Dropdown menu state for actions
  const [openDropdown, setOpenDropdown] = useState(null);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchInvoices();
    checkProfileComplete();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        // Check if the click is on a dropdown trigger button
        const isDropdownButton = event.target.closest('[data-dropdown-trigger]');
        if (!isDropdownButton) {
          setOpenDropdown(null);
        }
      }
    };
    
    // Close dropdown on scroll to prevent misalignment
    const handleScroll = () => {
      if (openDropdown) {
        setOpenDropdown(null);
      }
    };
    
    // Close dropdown on window resize to prevent positioning issues
    const handleResize = () => {
      if (openDropdown) {
        setOpenDropdown(null);
      }
    };
    
    if (openDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
      window.addEventListener('scroll', handleScroll, true); // Use capture phase
      window.addEventListener('resize', handleResize);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
        window.removeEventListener('scroll', handleScroll, true);
        window.removeEventListener('resize', handleResize);
      };
    }
  }, [openDropdown]);

  const checkProfileComplete = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/settings`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (!response.data.profileCompleted) {
        setShowProfileModal(true);
      }
    } catch (err) {
      console.error('Failed to check profile status');
    }
  };

  const fetchInvoices = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/invoices`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setInvoices(response.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to load invoices');
      setLoading(false);
      if (err.response?.status === 401) {
        navigate('/login');
      }
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  // IMPROVED: Toggle dropdown menu with smart position calculation
  const toggleDropdown = (invoiceId, event) => {
    if (openDropdown === invoiceId) {
      setOpenDropdown(null);
    } else {
      const button = event.currentTarget;
      const rect = button.getBoundingClientRect();
      const dropdownWidth = 192; // w-48 = 192px
      const dropdownHeight = 180; // approximate height (3 items + spacing)
      
      const viewportHeight = window.innerHeight;
      const spaceBelow = viewportHeight - rect.bottom;
      const spaceAbove = rect.top;
      
      // Decide whether to open up or down based on available space
      const openUpward = spaceBelow < dropdownHeight && spaceAbove > spaceBelow;
      
      // Calculate vertical position (using viewport coordinates)
      let top = openUpward 
        ? rect.top - dropdownHeight - 4  // Above button
        : rect.bottom + 4;                // Below button
      
      // Calculate horizontal position (align to right edge of button)
      let left = rect.right - dropdownWidth;
      
      // Ensure dropdown doesn't go off left edge
      if (left < 10) {
        left = 10;
      }
      
      // Ensure dropdown doesn't go off right edge
      if (left + dropdownWidth > window.innerWidth - 10) {
        left = window.innerWidth - dropdownWidth - 10;
      }
      
      // Ensure dropdown doesn't go off top edge (when opening upward)
      if (top < 10) {
        top = 10;
      }
      
      // Ensure dropdown doesn't go off bottom edge (when opening downward)
      if (top + dropdownHeight > viewportHeight - 10) {
        top = viewportHeight - dropdownHeight - 10;
      }
      
      setDropdownPosition({ top, left });
      setOpenDropdown(invoiceId);
    }
  };

  // SPRINT 4: Handle edit navigation
  const handleEdit = (invoiceId) => {
    navigate(`/edit-invoice/${invoiceId}`);
    setOpenDropdown(null);
  };

  // QUICK WIN #3: Show delete confirmation modal
  const handleDeleteClick = (invoice) => {
    setDeleteConfirm({
      show: true,
      invoice: invoice
    });
    setOpenDropdown(null);
  };

  // QUICK WIN #3: Actual delete function
  const confirmDelete = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(
        `${import.meta.env.VITE_API_URL}/api/invoices/${deleteConfirm.invoice._id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setInvoices(invoices.filter((inv) => inv._id !== deleteConfirm.invoice._id));
      setDeleteConfirm({ show: false, invoice: null });
    } catch (err) {
      alert('Failed to delete invoice. Please try again.');
      setDeleteConfirm({ show: false, invoice: null });
    }
  };

  // PHASE 1 FIX: Split CFA into XOF and XAF with proper currency symbols
  const getCurrencySymbol = (currency) => {
    const symbols = {
      'RWF': 'RWF',
      'KES': 'KES',
      'NGN': '₦',
      'XOF': 'CFA', // West Africa CFA
      'XAF': 'FCFA', // Central Africa CFA
      'USD': '$',
      'EUR': '€',
      'GBP': '£',
    };
    return symbols[currency] || currency;
  };

  const filteredInvoices = invoices.filter((invoice) => {
    if (filter === 'all') return true;
    return invoice.status === filter;
  });

  const stats = {
    total: invoices.length,
    paid: invoices.filter((inv) => inv.status === 'paid').length,
    unpaid: invoices.filter((inv) => inv.status === 'unpaid').length,
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading invoices...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <ProfileCompleteModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
      />

      {/* QUICK WIN #3: Delete Confirmation Modal */}
      {deleteConfirm.show && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-6 h-6 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 text-center mb-2">
                Confirm Deletion
              </h3>
              <p className="text-gray-600 text-center text-sm">
                Are you sure you want to delete invoice{' '}
                <strong className="text-gray-900">#{deleteConfirm.invoice?.invoiceNumber}</strong>?
              </p>
              <p className="text-red-600 text-center text-sm mt-2 font-medium">
                This action cannot be undone.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm({ show: false, invoice: null })}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
              >
                Delete Invoice
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="flex flex-col gap-4">
            {/* Top Row: Title and Primary Action */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Dashboard</h1>
                <p className="text-sm sm:text-base text-gray-600 mt-1">Manage your invoices</p>
              </div>
              <Link
                to="/create-invoice"
                className="inline-flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition duration-200 font-medium text-center shadow-sm"
                aria-label="Create new invoice"
              >
                <PlusCircleIcon className="w-5 h-5" aria-hidden="true" />
                New Invoice
              </Link>
            </div>

            {/* Bottom Row: Navigation Links */}
            <div className="flex flex-wrap gap-2 sm:gap-3 pb-2">
              <Link
                to="/clients"
                className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition duration-200 font-medium text-sm"
                aria-label="Manage clients"
              >
                <UserGroupIcon className="w-5 h-5" aria-hidden="true" />
                Clients
              </Link>
              <Link
                to="/products"
                className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition duration-200 font-medium text-sm"
                aria-label="Manage products and services"
              >
                <CubeIcon className="w-5 h-5" aria-hidden="true" />
                Products
              </Link>
              <Link
                to="/company-profile"
                className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition duration-200 font-medium text-sm"
                aria-label="Edit company profile"
              >
                <BuildingOfficeIcon className="w-5 h-5" aria-hidden="true" />
                Company Profile
              </Link>
              <button
                onClick={handleLogout}
                className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition duration-200 font-medium text-sm ml-auto"
                aria-label="Logout from account"
              >
                <ArrowRightOnRectangleIcon className="w-5 h-5" aria-hidden="true" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm">
            {error}
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <div className="bg-white rounded-lg shadow p-4 sm:p-6">
            <p className="text-sm text-gray-600 mb-1">Total Invoices</p>
            <p className="text-2xl sm:text-3xl font-bold text-gray-900">{stats.total}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4 sm:p-6">
            <p className="text-sm text-gray-600 mb-1">Paid</p>
            <p className="text-2xl sm:text-3xl font-bold text-green-600">{stats.paid}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4 sm:p-6">
            <p className="text-sm text-gray-600 mb-1">Unpaid</p>
            <p className="text-2xl sm:text-3xl font-bold text-orange-600">{stats.unpaid}</p>
          </div>
        </div>

        {/* Filter Buttons */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="p-4 border-b">
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setFilter('all')}
                className={`px-3 sm:px-4 py-2 rounded-lg text-sm font-medium transition ${
                  filter === 'all'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                All ({stats.total})
              </button>
              <button
                onClick={() => setFilter('paid')}
                className={`px-3 sm:px-4 py-2 rounded-lg text-sm font-medium transition ${
                  filter === 'paid'
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Paid ({stats.paid})
              </button>
              <button
                onClick={() => setFilter('unpaid')}
                className={`px-3 sm:px-4 py-2 rounded-lg text-sm font-medium transition ${
                  filter === 'unpaid'
                    ? 'bg-orange-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Unpaid ({stats.unpaid})
              </button>
            </div>
          </div>

          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Invoice #</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Client</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredInvoices.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                      No invoices found. Create your first invoice!
                    </td>
                  </tr>
                ) : (
                  filteredInvoices.map((invoice) => (
                    <tr key={invoice._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        {invoice.invoiceNumber}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">{invoice.clientName}</td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        {formatDate(invoice.dateIssued)}
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        {getCurrencySymbol(invoice.currency)} {invoice.total?.toFixed(2)}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            invoice.status === 'paid'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-orange-100 text-orange-800'
                          }`}
                        >
                          {invoice.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {/* SPRINT 4: 3-dot dropdown menu */}
                        <div className="relative">
                          <button
                            onClick={(e) => toggleDropdown(invoice._id, e)}
                            className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                            aria-label="Open invoice actions menu"
                            data-dropdown-trigger
                          >
                            <EllipsisVerticalIcon className="w-5 h-5 text-gray-600" aria-hidden="true" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden divide-y divide-gray-200">
            {filteredInvoices.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                No invoices found. Create your first invoice!
              </div>
            ) : (
              filteredInvoices.map((invoice) => (
                <div key={invoice._id} className="p-4 hover:bg-gray-50">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <p className="font-semibold text-gray-900">{invoice.invoiceNumber}</p>
                      <p className="text-sm text-gray-600 mt-1">{invoice.clientName}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          invoice.status === 'paid'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-orange-100 text-orange-800'
                        }`}
                      >
                        {invoice.status}
                      </span>
                      
                      {/* SPRINT 4: 3-dot menu for mobile */}
                      <div className="relative">
                        <button
                          onClick={(e) => toggleDropdown(invoice._id, e)}
                          className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                          aria-label="Open invoice actions menu"
                          data-dropdown-trigger
                        >
                          <EllipsisVerticalIcon className="w-5 h-5 text-gray-600" aria-hidden="true" />
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <p className="text-sm text-gray-600">
                      {formatDate(invoice.dateIssued)}
                    </p>
                    <p className="font-semibold text-gray-900">
                      {getCurrencySymbol(invoice.currency)} {invoice.total?.toFixed(2)}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* IMPROVED: Global dropdown portal (renders above everything) */}
      {openDropdown && (
        <div
          ref={dropdownRef}
          className="fixed w-48 bg-white rounded-lg shadow-2xl border border-gray-200 py-1 z-50 animate-in fade-in slide-in-from-top-2 duration-200"
          style={{
            top: `${dropdownPosition.top}px`,
            left: `${dropdownPosition.left}px`,
          }}
        >
          <Link
            to={`/invoice/${openDropdown}`}
            className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
            onClick={() => setOpenDropdown(null)}
            aria-label="View invoice details"
          >
            <EyeIcon className="w-4 h-4" aria-hidden="true" />
            View Invoice
          </Link>

          {/* Only show Edit for unpaid invoices */}
          {invoices.find(inv => inv._id === openDropdown)?.status === 'unpaid' && (
            <button
              onClick={() => handleEdit(openDropdown)}
              className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors text-left"
              aria-label="Edit invoice"
            >
              <PencilSquareIcon className="w-4 h-4" aria-hidden="true" />
              Edit Invoice
            </button>
          )}

          {/* PHASE 1 FIX: Safer delete button - gray by default, red on hover, with separator */}
          <button
            onClick={() => handleDeleteClick(invoices.find(inv => inv._id === openDropdown))}
            className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-gray-600 hover:text-red-600 hover:bg-red-50 transition-colors text-left border-t border-gray-100 mt-1 pt-3"
            aria-label="Delete invoice"
          >
            <TrashIcon className="w-4 h-4" aria-hidden="true" />
            Delete Invoice
          </button>
        </div>
      )}
    </div>
  );
};

export default Dashboard;