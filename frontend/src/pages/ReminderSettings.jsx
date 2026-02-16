import { useState, useEffect } from 'react';

function ReminderSettings({ formData, setFormData }) {
  const [previewSchedule, setPreviewSchedule] = useState([]);
  const [showPreview, setShowPreview] = useState(false);

  // Calculate reminder schedule based on due date
  useEffect(() => {
    if (!formData.reminderSettings.enabled || !formData.dueDate || !formData.dateIssued) {
      setPreviewSchedule([]);
      return;
    }

    const issueDate = new Date(formData.dateIssued);
    const dueDate = new Date(formData.dueDate);
    
    const daysUntilDue = Math.floor((dueDate - issueDate) / (1000 * 60 * 60 * 24));
    
    let schedule = [];

    // Smart calculation based on timeline
    if (daysUntilDue >= 14) {
      schedule.push({
        label: '7 days before due',
        date: new Date(dueDate.getTime() - 7 * 24 * 60 * 60 * 1000),
        type: 'before'
      });
      schedule.push({
        label: '3 days before due',
        date: new Date(dueDate.getTime() - 3 * 24 * 60 * 60 * 1000),
        type: 'before'
      });
    } else if (daysUntilDue >= 7) {
      schedule.push({
        label: '3 days before due',
        date: new Date(dueDate.getTime() - 3 * 24 * 60 * 60 * 1000),
        type: 'before'
      });
      schedule.push({
        label: '1 day before due',
        date: new Date(dueDate.getTime() - 1 * 24 * 60 * 60 * 1000),
        type: 'before'
      });
    } else if (daysUntilDue >= 3) {
      schedule.push({
        label: '1 day before due',
        date: new Date(dueDate.getTime() - 1 * 24 * 60 * 60 * 1000),
        type: 'before'
      });
    }
    
    schedule.push({
      label: 'On due date',
      date: dueDate,
      type: 'on_due'
    });
    
    schedule.push({
      label: '7 days overdue',
      date: new Date(dueDate.getTime() + 7 * 24 * 60 * 60 * 1000),
      type: 'after'
    });
    schedule.push({
      label: '14 days overdue',
      date: new Date(dueDate.getTime() + 14 * 24 * 60 * 60 * 1000),
      type: 'after'
    });

    setPreviewSchedule(schedule);
  }, [formData.reminderSettings.enabled, formData.dueDate, formData.dateIssued]);

  const handleReminderToggle = (e) => {
    const enabled = e.target.checked;
    setFormData((prev) => ({
      ...prev,
      reminderSettings: {
        enabled,
        mode: 'auto',
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

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  const getDaysUntilDue = () => {
    if (!formData.dueDate || !formData.dateIssued) return null;
    const issueDate = new Date(formData.dateIssued);
    const dueDate = new Date(formData.dueDate);
    return Math.floor((dueDate - issueDate) / (1000 * 60 * 60 * 24));
  };

  const daysUntilDue = getDaysUntilDue();

  return (
    <div className="border-t border-gray-200 pt-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
            Payment Reminders
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Automatic reminders based on your invoice timeline
          </p>
        </div>
      </div>

      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={formData.reminderSettings.enabled}
            onChange={handleReminderToggle}
            className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <div className="flex-1">
            <span className="text-base font-medium text-gray-900">
              Send automatic payment reminders
            </span>
            <p className="text-sm text-gray-600 mt-1">
              We'll automatically send reminders before, on, and after the due date
            </p>
          </div>
        </label>
      </div>

      {formData.reminderSettings.enabled && (
        <div className="space-y-4">
          {daysUntilDue !== null && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <p className="text-sm font-medium text-blue-900 mb-2">
                    {daysUntilDue === 0 
                      ? 'Invoice is due today' 
                      : daysUntilDue === 1
                      ? 'Invoice is due tomorrow'
                      : `Invoice is due in ${daysUntilDue} days`}
                    {formData.dueDate && ` (${formatDate(new Date(formData.dueDate))})`}
                  </p>
                  
                  {previewSchedule.length > 0 && (
                    <>
                      <button
                        type="button"
                        onClick={() => setShowPreview(!showPreview)}
                        className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                      >
                        {showPreview ? '− Hide' : '+ Show'} reminder schedule ({previewSchedule.length} reminders)
                      </button>

                      {showPreview && (
                        <div className="mt-3 space-y-2">
                          {previewSchedule.map((reminder, index) => (
                            <div 
                              key={index}
                              className="flex items-center gap-2 text-sm"
                            >
                              <div className={`w-2 h-2 rounded-full ${
                                reminder.type === 'before' 
                                  ? 'bg-green-500' 
                                  : reminder.type === 'on_due'
                                  ? 'bg-amber-500'
                                  : 'bg-red-500'
                              }`} />
                              <span className="text-gray-700">
                                {formatDate(reminder.date)}
                              </span>
                              <span className="text-gray-500">−</span>
                              <span className="text-gray-600">{reminder.label}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          )}

          {!formData.dueDate && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <p className="text-sm text-amber-800">
                💡 Set a due date above to see your reminder schedule
              </p>
            </div>
          )}

          <div className="border-t border-gray-200 pt-4">
            <h3 className="text-base font-medium text-gray-900 mb-3">
              Custom Message (Optional)
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Add payment instructions and contact info to all reminder emails
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Payment Instructions
                </label>
                <textarea
                  value={formData.customReminderMessage?.paymentInstructions || ''}
                  onChange={(e) =>
                    handleCustomMessageChange('paymentInstructions', e.target.value)
                  }
                  maxLength={500}
                  rows="3"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm resize-none"
                  placeholder="e.g., Pay via MTN MoMo: 0788 123 456&#10;Bank Transfer: Bank of Kigali - Acc: 400012345678"
                />
                <div className="flex justify-between items-center mt-1">
                  <p className="text-xs text-gray-500">
                    Include payment methods, account numbers, etc.
                  </p>
                  <p className="text-xs text-gray-500">
                    {(formData.customReminderMessage?.paymentInstructions || '').length}/500
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contact Information
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
                <div className="flex justify-between items-center mt-1">
                  <p className="text-xs text-gray-500">
                    Phone number or email for questions
                  </p>
                  <p className="text-xs text-gray-500">
                    {(formData.customReminderMessage?.contactInfo || '').length}/200
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ReminderSettings;