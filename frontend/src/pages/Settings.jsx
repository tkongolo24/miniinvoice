// frontend/src/pages/Settings.jsx

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';

export default function Settings() {
  const navigate = useNavigate();
  const { language, changeLanguage, t } = useLanguage();
  const [selectedLanguage, setSelectedLanguage] = useState(language);
  const [saved, setSaved] = useState(false);

  const languages = [
    { code: 'en', name: 'English', flag: '🇬🇧' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
    { code: 'rw', name: 'Kinyarwanda', flag: '🇷🇼' }
  ];

  const handleSave = () => {
    changeLanguage(selectedLanguage);
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-blue-600">MiniInvoice</h1>
            <button
              onClick={() => navigate('/dashboard')}
              className="text-blue-600 hover:text-blue-800"
            >
              ← Back to Dashboard
            </button>
          </div>
        </div>
      </header>

      {/* Success Toast */}
      {saved && (
        <div className="fixed inset-0 flex items-center justify-center z-50 px-4">
          <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setSaved(false)}></div>
          <div className="relative bg-white rounded-lg shadow-xl p-6 max-w-md w-full border-l-4 border-green-500">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-3 flex-1">
                <p className="text-sm font-medium text-gray-900">Settings saved successfully!</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <h2 className="text-2xl font-semibold text-gray-900">Settings</h2>
            <p className="text-sm text-gray-600 mt-1">Manage your application preferences</p>
          </div>

          {/* Language Settings */}
          <div className="px-6 py-6">
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Language / Langue / Ururimi</h3>
              <p className="text-sm text-gray-600 mb-4">
                Choose your preferred language for the application interface
              </p>

              <div className="space-y-3">
                {languages.map((lang) => (
                  <label
                    key={lang.code}
                    className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      selectedLanguage === lang.code
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="language"
                      value={lang.code}
                      checked={selectedLanguage === lang.code}
                      onChange={(e) => setSelectedLanguage(e.target.value)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-3 text-2xl">{lang.flag}</span>
                    <span className="ml-3 text-lg font-medium text-gray-900">{lang.name}</span>
                    {selectedLanguage === lang.code && (
                      <span className="ml-auto">
                        <svg className="h-5 w-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      </span>
                    )}
                  </label>
                ))}
              </div>
            </div>

            {/* Current Language Preview */}
            <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Preview:</h4>
              <div className="space-y-1 text-sm text-gray-600">
                <p><span className="font-medium">Dashboard:</span> {
                  selectedLanguage === 'en' ? 'Your Invoices' :
                  selectedLanguage === 'fr' ? 'Vos Factures' :
                  'Inyemezabuguzi Zawe'
                }</p>
                <p><span className="font-medium">Status:</span> {
                  selectedLanguage === 'en' ? 'Paid, Unpaid, Overdue' :
                  selectedLanguage === 'fr' ? 'Payée, Impayée, En retard' :
                  'Yishyuwe, Ntiyishyuwe, Yarangiye'
                }</p>
              </div>
            </div>
          </div>

          {/* Other Settings Sections (Future) */}
          <div className="px-6 py-6 border-t border-gray-200 bg-gray-50">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">More Settings</h3>
            <div className="space-y-3 text-sm text-gray-600">
              <div className="flex items-center justify-between p-3 bg-white rounded border border-gray-200">
                <span>Notifications</span>
                <span className="text-gray-400">Coming soon</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-white rounded border border-gray-200">
                <span>Default Currency</span>
                <span className="text-gray-400">Coming soon</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-white rounded border border-gray-200">
                <span>Invoice Template</span>
                <span className="text-gray-400">Coming soon</span>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
            <div className="flex gap-3">
              <button
                onClick={handleSave}
                className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition font-semibold"
              >
                Save Changes
              </button>
              <button
                onClick={() => navigate('/dashboard')}
                className="px-6 py-3 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition font-semibold"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-blue-700">
                Your language preference is saved locally and will persist across sessions.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}