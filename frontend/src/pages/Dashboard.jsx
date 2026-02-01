import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import ProfileCompleteModal from '../components/ProfileCompleteModal';
import PaymentModal from '../components/PaymentModal';
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
  CheckCircleIcon,
  XCircleIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
  Bars3Icon,
  DocumentTextIcon,
  ChartBarIcon,
  ArrowDownTrayIcon,
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
  // PHASE 2: Payment modal state
  const [paymentModal, setPaymentModal] = useState({
    show: false,
    invoice: null
  });
  // PHASE 2 TASK 3: Search and filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  // SPRINT 4: Dropdown menu state for actions
  const [openDropdown, setOpenDropdown] = useState(null);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });
  const dropdownRef = useRef(null);
  const [exporting, setExporting] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
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
      const dropdownHeight = 220; // approximate height (4 items + spacing)
      
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

  // PHASE 2: Show payment modal
  const handlePaymentClick = (invoice) => {
    setPaymentModal({
      show: true,
      invoice: invoice
    });
    setOpenDropdown(null);
  };

  // PHASE 2: Handle payment confirmation
  const confirmPayment = async (paymentData) => {
    try {
      const token = localStorage.getItem('token');
      const updateData = paymentData.status === 'unpaid' 
        ? { status: 'unpaid' }
        : { 
            status: 'paid', 
            paymentDate: paymentData.paymentDate,
            paymentMethod: paymentData.paymentMethod,
            paymentNotes: paymentData.paymentNotes 
          };

      const response = await axios.patch(
        `${import.meta.env.VITE_API_URL}/api/invoices/${paymentModal.invoice._id}/payment`,
        updateData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // Update the invoice in the list
      setInvoices(invoices.map((inv) => 
        inv._id === paymentModal.invoice._id ? response.data : inv
      ));
      
      setPaymentModal({ show: false, invoice: null });
    } catch (err) {
      alert('Failed to update payment status. Please try again.');
      console.error('Payment update error:', err);
    }
  };

  const handleExportCSV = async () => {
    try {
      setExporting(true);
      setShowExportModal(false);
      
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/invoices/export/csv`,
        {
          headers: { Authorization: `Bearer ${token}` },
          responseType: 'blob',
        }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `invoices_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to export CSV');
      console.error('Error exporting CSV:', err);
    } finally {
      setExporting(false);
    }
  };

  const handleExportTaxReport = async () => {
    try {
      setExporting(true);
      setShowExportModal(false);
      
      const token = localStorage.getItem('token');
      const currentYear = new Date().getFullYear();
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/invoices/export/tax-report?year=${currentYear}`,
        {
          headers: { Authorization: `Bearer ${token}` },
          responseType: 'blob',
        }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `tax_report_${currentYear}_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to export tax report');
      console.error('Error exporting tax report:', err);
    } finally {
      setExporting(false);
    }
  };

  // PHASE 2 TASK 3: Clear all filters
  const clearFilters = () => {
    setSearchTerm('');
    setDateFrom('');
    setDateTo('');
    setFilter('all');
  };

  // PHASE 2 TASK 3: Check if any filters are active
  const hasActiveFilters = () => {
    return searchTerm || dateFrom || dateTo || filter !== 'all';
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

  // PHASE 2 TASK 3: Enhanced filtering with search and date range
  const filteredInvoices = invoices.filter((invoice) => {
    // Status filter
    if (filter !== 'all' && invoice.status !== filter) {
      return false;
    }

    // Search term filter (invoice number, client name, amount)
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      const matchesInvoiceNumber = invoice.invoiceNumber?.toLowerCase().includes(search);
      const matchesClientName = invoice.clientName?.toLowerCase().includes(search);
      const matchesAmount = invoice.total?.toString().includes(search);
      
      if (!matchesInvoiceNumber && !matchesClientName && !matchesAmount) {
        return false;
      }
    }

    // Date from filter
    if (dateFrom) {
      const invoiceDate = new Date(invoice.dateIssued);
      const fromDate = new Date(dateFrom);
      if (invoiceDate < fromDate) {
        return false;
      }
    }

    // Date to filter
    if (dateTo) {
      const invoiceDate = new Date(invoice.dateIssued);
      const toDate = new Date(dateTo);
      toDate.setHours(23, 59, 59, 999); // Include entire day
      if (invoiceDate > toDate) {
        return false;
      }
    }

    return true;
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

      {/* PHASE 2: Payment Modal */}
      <PaymentModal
        isOpen={paymentModal.show}
        invoice={paymentModal.invoice}
        onClose={() => setPaymentModal({ show: false, invoice: null })}
        onConfirm={confirmPayment}
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

      {/* Export Options Modal */}
      {showExportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full p-6">
            <div className="mb-6">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-6 h-6 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 text-center mb-2">
                Export Data
              </h3>
              <p className="text-gray-600 text-center text-sm">
                Choose the type of export you need
              </p>
            </div>

            <div className="space-y-3 mb-6">
              {/* Simple CSV Export */}
              <button
                onClick={handleExportCSV}
                disabled={exporting}
                className="w-full p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all text-left disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                    <DocumentTextIcon className="w-5 h-5 text-green-600" aria-hidden="true" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 mb-1">Simple Invoice List</h4>
                    <p className="text-sm text-gray-600">
                      Quick export of all invoices with basic details. Perfect for simple record-keeping.
                    </p>
                    <p className="text-xs text-gray-500 mt-2">
                      Includes: Invoice#, Client, Date, Amount, Tax, Status
                    </p>
                  </div>
                </div>
              </button>

              {/* Tax Report Export */}
              <button
                onClick={handleExportTaxReport}
                disabled={exporting}
                className="w-full p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all text-left disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                    <ChartBarIcon className="w-5 h-5 text-purple-600" aria-hidden="true" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 mb-1">
                      Tax Report ({new Date().getFullYear()})
                    </h4>
                    <p className="text-sm text-gray-600">
                      Comprehensive report with monthly summaries, tax breakdown, and client details. Perfect for tax filing and accounting.
                    </p>
                    <p className="text-xs text-gray-500 mt-2">
                      Includes: 6 detailed sections (Invoice Summary, Monthly Summary, Client Summary, Tax Breakdown, Line Items, Year Totals)
                    </p>
                  </div>
                </div>
              </button>
            </div>

            <button
              onClick={() => setShowExportModal(false)}
              disabled={exporting}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="flex flex-col gap-4">
            {/* Top Row: Title and Actions */}
            <div className="flex items-center justify-between gap-4">
              <div className="flex-1">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Dashboard</h1>
                <p className="text-sm sm:text-base text-gray-600 mt-1">Manage your invoices</p>
              </div>
              
              {/* Mobile: Hamburger Menu */}
              <button
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                className="sm:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
                aria-label="Toggle menu"
              >
                <Bars3Icon className="w-6 h-6 text-gray-700" />
              </button>
              
              {/* Desktop: New Invoice Button */}
              <Link
                to="/create-invoice"
                className="hidden sm:inline-flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition duration-200 font-semibold text-center shadow-lg"
                aria-label="Create new invoice"
              >
                <PlusCircleIcon className="w-5 h-5" aria-hidden="true" />
                New Invoice
              </Link>
            </div>

            {/* Mobile: New Invoice Button (Full Width) */}
            <Link
              to="/create-invoice"
              className="sm:hidden inline-flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition duration-200 font-semibold text-center shadow-lg"
              aria-label="Create new invoice"
            >
              <PlusCircleIcon className="w-5 h-5" aria-hidden="true" />
              New Invoice
            </Link>

            {/* Desktop Navigation Links */}
            <div className="hidden sm:flex flex-wrap gap-2 sm:gap-3 pb-2">
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
              <button
                onClick={() => setShowExportModal(true)}
                disabled={invoices.length === 0}
                className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition duration-200 font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Export data"
              >
                <ArrowDownTrayIcon className="w-5 h-5" aria-hidden="true" />
                Export CSV
              </button>
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

      {/* Mobile Menu Overlay */}
      {showMobileMenu && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40 sm:hidden"
            onClick={() => setShowMobileMenu(false)}
          ></div>
          
          {/* Slide-out Menu */}
          <div className="fixed top-0 right-0 h-full w-64 bg-white shadow-2xl z-50 sm:hidden transform transition-transform duration-300 ease-in-out">
            {/* Menu Header */}
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-bold text-gray-900">Menu</h2>
              <button
                onClick={() => setShowMobileMenu(false)}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                aria-label="Close menu"
              >
                <XMarkIcon className="w-6 h-6 text-gray-700" />
              </button>
            </div>
            
            {/* Menu Items */}
            <nav className="p-4 space-y-2">
              <Link
                to="/clients"
                onClick={() => setShowMobileMenu(false)}
                className="flex items-center gap-3 px-4 py-3 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors font-medium"
              >
                <UserGroupIcon className="w-5 h-5" />
                Clients
              </Link>
              
              <Link
                to="/products"
                onClick={() => setShowMobileMenu(false)}
                className="flex items-center gap-3 px-4 py-3 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors font-medium"
              >
                <CubeIcon className="w-5 h-5" />
                Products
              </Link>
              
              <button
                onClick={() => {
                  setShowMobileMenu(false);
                  setShowExportModal(true);
                }}
                disabled={invoices.length === 0}
                className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed text-left"
              >
                <ArrowDownTrayIcon className="w-5 h-5" aria-hidden="true" />
                Export CSV
              </button>
              
              <Link
                to="/company-profile"
                onClick={() => setShowMobileMenu(false)}
                className="flex items-center gap-3 px-4 py-3 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors font-medium"
              >
                <BuildingOfficeIcon className="w-5 h-5" />
                Company Profile
              </Link>
              
              <div className="pt-4 mt-4 border-t">
                <button
                  onClick={() => {
                    setShowMobileMenu(false);
                    handleLogout();
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-red-600 rounded-lg hover:bg-red-50 transition-colors font-medium"
                >
                  <ArrowRightOnRectangleIcon className="w-5 h-5" />
                  Logout
                </button>
              </div>
            </nav>
          </div>
        </>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm">
            {error}
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-5 border-l-4 border-blue-600">
            <p className="text-xs uppercase tracking-wide text-gray-600 font-medium mb-2">Total Invoices</p>
            <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-5 border-l-4 border-green-600">
            <p className="text-xs uppercase tracking-wide text-gray-600 font-medium mb-2">Paid</p>
            <p className="text-3xl font-bold text-green-600">{stats.paid}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-5 border-l-4 border-orange-600">
            <p className="text-xs uppercase tracking-wide text-gray-600 font-medium mb-2">Unpaid</p>
            <p className="text-3xl font-bold text-orange-600">{stats.unpaid}</p>
          </div>
        </div>

        {/* PHASE 2 TASK 3: Search and Filters */}
        <div className="bg-white rounded-lg shadow mb-6">
          {/* Search Bar */}
          <div className="p-4 border-b">
            <div className="flex flex-col gap-3">
              {/* Search Input - Full Width on Mobile */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                </div>
                <input
                  type="text"
                  placeholder="Search by invoice#, client, or amount..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-gray-400"
                />
              </div>

              {/* Date Filters Row */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {/* Date From */}
                <div className="relative">
                  <input
                    type="date"
                    placeholder="From date"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                    className="block w-full px-3 py-3 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Date To */}
                <div className="relative">
                  <input
                    type="date"
                    placeholder="To date"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                    className="block w-full px-3 py-3 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Clear Filters Button */}
                {hasActiveFilters() && (
                  <button
                    onClick={clearFilters}
                    className="col-span-2 sm:col-span-1 inline-flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
                  >
                    <XMarkIcon className="w-4 h-4" aria-hidden="true" />
                    Clear Filters
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Status Filter Buttons */}
          <div className="p-4 border-b">
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setFilter('all')}
                className={`flex-1 sm:flex-none px-4 py-2.5 rounded-lg text-sm font-medium transition ${
                  filter === 'all'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                All ({stats.total})
              </button>
              <button
                onClick={() => setFilter('paid')}
                className={`flex-1 sm:flex-none px-4 py-2.5 rounded-lg text-sm font-medium transition ${
                  filter === 'paid'
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Paid ({stats.paid})
              </button>
              <button
                onClick={() => setFilter('unpaid')}
                className={`flex-1 sm:flex-none px-4 py-2.5 rounded-lg text-sm font-medium transition ${
                  filter === 'unpaid'
                    ? 'bg-orange-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Unpaid ({stats.unpaid})
              </button>
            </div>

            {/* Results Count */}
            {hasActiveFilters() && (
              <div className="mt-3 text-sm text-gray-600">
                Showing {filteredInvoices.length} of {invoices.length} invoices
              </div>
            )}
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
                      {hasActiveFilters() 
                        ? 'No invoices match your search criteria.' 
                        : 'No invoices found. Create your first invoice!'}
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
                {hasActiveFilters() 
                  ? 'No invoices match your search criteria.' 
                  : 'No invoices found. Create your first invoice!'}
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

          {/* PHASE 2: Payment status toggle */}
          <button
            onClick={() => handlePaymentClick(invoices.find(inv => inv._id === openDropdown))}
            className={`flex items-center gap-2 w-full px-4 py-2.5 text-sm transition-colors text-left ${
              invoices.find(inv => inv._id === openDropdown)?.status === 'paid'
                ? 'text-orange-600 hover:bg-orange-50'
                : 'text-green-600 hover:bg-green-50'
            }`}
            aria-label={invoices.find(inv => inv._id === openDropdown)?.status === 'paid' ? 'Mark as unpaid' : 'Mark as paid'}
          >
            {invoices.find(inv => inv._id === openDropdown)?.status === 'paid' ? (
              <>
                <XCircleIcon className="w-4 h-4" aria-hidden="true" />
                Mark Unpaid
              </>
            ) : (
              <>
                <CheckCircleIcon className="w-4 h-4" aria-hidden="true" />
                Mark as Paid
              </>
            )}
          </button>

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