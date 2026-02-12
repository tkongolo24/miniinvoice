// ReminderSettings.jsx - Add this as a separate component
// Then import it in CreateInvoice.jsx

import { useState } from 'react';

function ReminderSettings({ formData, setFormData }) {
  const [showHelp, setShowHelp] = useState(false);

  const handleReminderToggle = (e) => {
    const enabled = e.target.checked;
    setFormData((prev) => ({
      ...prev,
      reminderSettings: {
        ...prev.reminderSettings,
        enabled,
      },
    }));
  };

  const handleBeforeDueChange = (days) => {
    const beforeDue = formData.reminderSettings.beforeDue || [];
    const newBeforeDue = beforeDue.includes(days)
      ? beforeDue.filter((d) => d !== days)
      : [...beforeDue, days].sort((a, b) => b - a); // Sort descending

    setFormData((prev) => ({
      ...prev,
      reminderSettings: {
        ...prev.reminderSettings,
        beforeDue: newBeforeDue,
      },
    }));
  };

  const handleAfterDueChange = (days) => {
    const afterDue = formData.reminderSettings.afterDue || [];
    const newAfterDue = afterDue.includes(days)
      ? afterDue.filter((d) => d !== days)
      : [...afterDue, days].sort((a, b) => a - b); // Sort ascending

    setFormData((prev) => ({
      ...prev,
      reminderSettings: {
        ...prev.reminderSettings,
        afterDue: newAfterDue,
      },
    }));
  };

  const handleOnDueChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      reminderSettings: {
        ...prev.reminderSettings,
        onDue: e.target.checked,
      },
    }));
  };

  const handleCustomMessageChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      customReminderMessage: {
        ...prev.customReminderMessage,
        [field]: value,
      },
    }));
  };

  return (
    <div className="border-t border-gray-200 pt-6">
      {/* Header with Enable Toggle */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
            🔔 Payment Reminders
          </h2>
          <button
            type="button"
            onClick={() => setShowHelp(!showHelp)}
            className="text-gray-400 hover:text-gray-600 transition"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </button>
        </div>
        
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={formData.reminderSettings.enabled}
            onChange={handleReminderToggle}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <span className="text-sm font-medium text-gray-700">
            Enable automatic reminders
          </span>
        </label>
      </div>

      {/* Help Text */}
      {showHelp && (
        <div className="mb-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800">
            <strong>How it works:</strong> BillKazi will automatically send email reminders to your client based on the schedule you set below. Reminders are sent every 6 hours.
          </p>
        </div>
      )}

      {/* Reminder Settings */}
      {formData.reminderSettings.enabled && (
        <div className="space-y-6">
          {/* Before Due */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-green-900 mb-3 flex items-center gap-2">
              <span className="text-lg">📅</span>
              Before Due Date
            </h3>
            <div className="space-y-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={(formData.reminderSettings.beforeDue || []).includes(7)}
                  onChange={() => handleBeforeDueChange(7)}
                  className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                />
                <span className="text-sm text-gray-700">7 days before due</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={(formData.reminderSettings.beforeDue || []).includes(3)}
                  onChange={() => handleBeforeDueChange(3)}
                  className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                />
                <span className="text-sm text-gray-700">3 days before due</span>
              </label>
            </div>
          </div>

          {/* On Due Date */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-amber-900 mb-3 flex items-center gap-2">
              <span className="text-lg">⏰</span>
              On Due Date
            </h3>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.reminderSettings.onDue}
                onChange={handleOnDueChange}
                className="h-4 w-4 text-amber-600 focus:ring-amber-500 border-gray-300 rounded"
              />
              <span className="text-sm text-gray-700">On the due date</span>
            </label>
          </div>

          {/* After Due (Overdue) */}
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-red-900 mb-3 flex items-center gap-2">
              <span className="text-lg">🔴</span>
              After Due Date (Overdue)
            </h3>
            <div className="space-y-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={(formData.reminderSettings.afterDue || []).includes(7)}
                  onChange={() => handleAfterDueChange(7)}
                  className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                />
                <span className="text-sm text-gray-700">7 days overdue</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={(formData.reminderSettings.afterDue || []).includes(14)}
                  onChange={() => handleAfterDueChange(14)}
                  className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                />
                <span className="text-sm text-gray-700">14 days overdue</span>
              </label>
            </div>
          </div>

          {/* Custom Message Section */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-blue-900 mb-3 flex items-center gap-2">
              <span className="text-lg">✏️</span>
              Custom Message (Optional)
            </h3>
            <p className="text-xs text-blue-700 mb-4">
              Add payment instructions and contact info to all reminder emails
            </p>

            <div className="space-y-4">
              {/* Payment Instructions */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Payment Instructions
                  <span className="text-xs text-gray-500 font-normal ml-2">
                    (Max 500 characters)
                  </span>
                </label>
                <textarea
                  value={formData.customReminderMessage?.paymentInstructions || ''}
                  onChange={(e) =>
                    handleCustomMessageChange('paymentInstructions', e.target.value)
                  }
                  maxLength={500}
                  rows="3"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  placeholder="e.g., Pay via MTN MoMo: 0788 123 456&#10;Bank Transfer: Bank of Kigali - Acc: 400012345678&#10;Cash: Visit our office at KG 5 Ave, Kigali"
                />
                <p className="text-xs text-gray-500 mt-1">
                  {(formData.customReminderMessage?.paymentInstructions || '').length}/500
                </p>
              </div>

              {/* Contact Info */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contact Information
                  <span className="text-xs text-gray-500 font-normal ml-2">
                    (Max 200 characters)
                  </span>
                </label>
                <input
                  type="text"
                  value={formData.customReminderMessage?.contactInfo || ''}
                  onChange={(e) =>
                    handleCustomMessageChange('contactInfo', e.target.value)
                  }
                  maxLength={200}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  placeholder="e.g., Questions? Call +250 788 123 456 or email support@company.com"
                />
                <p className="text-xs text-gray-500 mt-1">
                  {(formData.customReminderMessage?.contactInfo || '').length}/200
                </p>
              </div>
            </div>
          </div>

          {/* Preview Box */}
          {(formData.reminderSettings.beforeDue?.length > 0 ||
            formData.reminderSettings.onDue ||
            formData.reminderSettings.afterDue?.length > 0) && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-gray-900 mb-2">
                📧 Reminder Schedule:
              </h4>
              <ul className="text-sm text-gray-700 space-y-1">
                {formData.reminderSettings.beforeDue?.map((days) => (
                  <li key={`before-${days}`}>
                    ✅ {days} days before due date
                  </li>
                ))}
                {formData.reminderSettings.onDue && <li>✅ On due date</li>}
                {formData.reminderSettings.afterDue?.map((days) => (
                  <li key={`after-${days}`}>✅ {days} days after due date</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default ReminderSettings;