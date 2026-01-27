import { useState } from 'react';

const PaymentModal = ({ isOpen, invoice, onClose, onConfirm }) => {
  const [paymentData, setPaymentData] = useState({
    paymentDate: new Date().toISOString().split('T')[0],
    paymentMethod: 'bank_transfer',
    paymentNotes: '',
  });

  if (!isOpen || !invoice) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onConfirm(paymentData);
  };

  const handleMarkUnpaid = () => {
    onConfirm({ status: 'unpaid' });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <div className="mb-4">
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            {invoice.status === 'paid' ? 'Mark as Unpaid' : 'Mark as Paid'}
          </h3>
          <p className="text-sm text-gray-600">
            Invoice #{invoice.invoiceNumber} - {invoice.clientName}
          </p>
        </div>

        {invoice.status === 'paid' ? (
          // Already paid - show option to mark as unpaid
          <div className="mb-6">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
              <p className="text-sm text-green-800">
                <strong>Payment Date:</strong>{' '}
                {invoice.paymentDate
                  ? new Date(invoice.paymentDate).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })
                  : 'Not recorded'}
              </p>
              {invoice.paymentMethod && (
                <p className="text-sm text-green-800 mt-1">
                  <strong>Method:</strong>{' '}
                  {invoice.paymentMethod.replace('_', ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
                </p>
              )}
              {invoice.paymentNotes && (
                <p className="text-sm text-green-800 mt-1">
                  <strong>Notes:</strong> {invoice.paymentNotes}
                </p>
              )}
            </div>

            <p className="text-sm text-gray-600 mb-4">
              Mark this invoice as unpaid? This will remove payment details.
            </p>

            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleMarkUnpaid}
                className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-medium"
              >
                Mark Unpaid
              </button>
            </div>
          </div>
        ) : (
          // Not paid yet - show payment form
          <form onSubmit={handleSubmit}>
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Payment Date *
                </label>
                <input
                  type="date"
                  value={paymentData.paymentDate}
                  onChange={(e) =>
                    setPaymentData({ ...paymentData, paymentDate: e.target.value })
                  }
                  max={new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Payment Method
                </label>
                <select
                  value={paymentData.paymentMethod}
                  onChange={(e) =>
                    setPaymentData({ ...paymentData, paymentMethod: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="bank_transfer">Bank Transfer</option>
                  <option value="mobile_money">Mobile Money</option>
                  <option value="cash">Cash</option>
                  <option value="card">Card</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Payment Notes (Optional)
                </label>
                <textarea
                  value={paymentData.paymentNotes}
                  onChange={(e) =>
                    setPaymentData({ ...paymentData, paymentNotes: e.target.value })
                  }
                  rows="3"
                  placeholder="Reference number, transaction ID, etc."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
              >
                Mark as Paid
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default PaymentModal;