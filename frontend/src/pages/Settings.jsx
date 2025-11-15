// frontend/src/pages/Settings.jsx

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';

export default function Settings() {
  const navigate = useNavigate();
  const { language, changeLanguage } = useLanguage();
  const [selectedLanguage, setSelectedLanguage] = useState(language);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    changeLanguage(selectedLanguage);
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-blue-600">MiniInvoice</h1>
            <button
              onClick={() => navigate('/dashboard')}
              className="text-blue-600 hover:text-blue-800"
            >
              ← Back
            </button>
          </div>
        </div>
      </header>

      {saved && (
        <div className="fixed inset-0 flex items-center justify-center z-50 px-4">
          <div className="absolute inset-0 bg-black bg-opacity-50"></div>
          <div className="relative bg-white rounded-lg shadow-xl p-6 max-w-sm w-full border-l-4 border-green-500">
            <div className="flex items-center">
              <svg className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="ml-3 text-sm font-medium text-gray-900">Settings saved successfully!</p>
            </div>
          </div>
        </div>
      )}

      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Settings</h2>

          {/* Language Setting */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Language / Langue / Ururimi
            </label>
            <select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="en">🇬🇧 English</option>
              <option value="fr">🇫🇷 Français</option>
              <option value="rw">🇷🇼 Kinyarwanda</option>
            </select>
            <p className="mt-2 text-sm text-gray-500">
              Select your preferred language for the application
            </p>
          </div>

          {/* Divider */}
          <div className="border-t border-gray-200 my-6"></div>

          {/* Future Settings Placeholder */}
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-700 mb-3">More Settings</h3>
            <div className="space-y-2 text-sm text-gray-500">
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                <span>Notifications</span>
                <span className="text-xs">Coming soon</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                <span>Default Currency</span>
                <span className="text-xs">Coming soon</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                <span>Invoice Templates</span>
                <span className="text-xs">Coming soon</span>
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-3">
            <button
              onClick={handleSave}
              className="flex-1 bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition font-medium"
            >
              Save Changes
            </button>
            <button
              onClick={() => navigate('/dashboard')}
              className="px-6 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition font-medium"
            >
              Cancel
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}