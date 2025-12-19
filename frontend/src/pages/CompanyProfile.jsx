import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const CompanyProfile = () => {
  const [profileData, setProfileData] = useState({
    companyName: '',
    phone: '',
    address: '',
    businessRegNumber: '',
    contactEmail: '',
    invoiceFooter: '',
  });
  const [logoPreview, setLogoPreview] = useState(null);
  const [logoFile, setLogoFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [profileLoading, setProfileLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/api/settings`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      const data = response.data;
      setProfileData({
        companyName: data.companyName || '',
        phone: data.phone || '',
        address: data.address || '',
        businessRegNumber: data.businessRegNumber || '',
        contactEmail: data.contactEmail || '',
        invoiceFooter: data.invoiceFooter || '',
      });
      
      if (data.logo) {
        setLogoPreview(`${API_URL}${data.logo}`);
      }
    } catch (err) {
      console.error('Failed to fetch settings:', err);
    } finally {
      setProfileLoading(false);
    }
  };

  const handleChange = (e) => {
    setProfileData({ ...profileData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setError('Logo must be less than 2MB');
        return;
      }
      setLogoFile(file);
      setLogoPreview(URL.createObjectURL(file));
      setError('');
    }
  };

  const handleRemoveLogo = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/api/settings/logo`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setLogoPreview(null);
      setLogoFile(null);
    } catch (err) {
      setError('Failed to remove logo');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const token = localStorage.getItem('token');

      // Upload logo first if there's a new one
      if (logoFile) {
        const formData = new FormData();
        formData.append('logo', logoFile);
        await axios.post(`${API_URL}/api/settings/logo`, formData, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        });
      }

      // Update other settings
      await axios.put(`${API_URL}/api/settings`, profileData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      // Redirect to dashboard after successful save
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-6 sm:py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <button
            onClick={() => navigate('/dashboard')}
            className="text-blue-600 hover:text-blue-700 mb-4 text-sm sm:text-base flex items-center"
          >
            ← Back to Dashboard
          </button>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Company Profile</h1>
          <p className="text-sm sm:text-base text-gray-600 mt-2">
            This information will appear on your invoices
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm">
            {error}
          </div>
        )}

        {profileLoading ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <p className="text-gray-500">Loading...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            {/* Logo Upload Section */}
            <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 lg:p-8 mb-6">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">
                Company Logo
              </h2>
              <div className="flex items-center space-x-6">
                <div className="w-24 h-24 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden bg-gray-50">
                  {logoPreview ? (
                    <img
                      src={logoPreview}
                      alt="Logo preview"
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <span className="text-gray-400 text-sm text-center px-2">
                      No logo
                    </span>
                  )}
                </div>
                <div className="flex flex-col space-y-2">
                  <label className="cursor-pointer bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition text-sm font-medium text-center">
                    Upload Logo
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoChange}
                      className="hidden"
                    />
                  </label>
                  {logoPreview && (
                    <button
                      type="button"
                      onClick={handleRemoveLogo}
                      className="text-red-600 hover:text-red-700 text-sm font-medium"
                    >
                      Remove Logo
                    </button>
                  )}
                  <p className="text-xs text-gray-500">Max 2MB, PNG or JPG</p>
                </div>
              </div>
            </div>

            {/* Company Details Section */}
            <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 lg:p-8 mb-6">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">
                Company Details
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Company Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="companyName"
                    value={profileData.companyName}
                    onChange={handleChange}
                    className="w-full px-3 py-2 sm:px-4 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                    placeholder="Your Company Ltd"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={profileData.phone}
                    onChange={handleChange}
                    className="w-full px-3 py-2 sm:px-4 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                    placeholder="+250 792 577 782"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={profileData.address}
                    onChange={handleChange}
                    className="w-full px-3 py-2 sm:px-4 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                    placeholder="Kigali, Rwanda"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Business Registration / TIN
                  </label>
                  <input
                    type="text"
                    name="businessRegNumber"
                    value={profileData.businessRegNumber}
                    onChange={handleChange}
                    className="w-full px-3 py-2 sm:px-4 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                    placeholder="TIN: 123456789"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Contact Email
                  </label>
                  <input
                    type="email"
                    name="contactEmail"
                    value={profileData.contactEmail}
                    onChange={handleChange}
                    className="w-full px-3 py-2 sm:px-4 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                    placeholder="billing@yourcompany.com"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    This email will appear on your invoices
                  </p>
                </div>
              </div>
            </div>

            {/* Invoice Footer Section */}
            <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 lg:p-8 mb-6">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">
                Invoice Footer
              </h2>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Custom Footer Text
                </label>
                <textarea
                  name="invoiceFooter"
                  value={profileData.invoiceFooter}
                  onChange={handleChange}
                  rows={3}
                  maxLength={500}
                  className="w-full px-3 py-2 sm:px-4 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base resize-none"
                  placeholder="Payment via Mobile Money: 0792577782&#10;Bank: Bank of Kigali, Acc: 123456789"
                />
                <p className="text-xs text-gray-500 mt-1 text-right">
                  {profileData.invoiceFooter.length}/500 characters
                </p>
              </div>
            </div>

            {/* Save Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
            >
              {loading ? 'Saving...' : 'Save Profile'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default CompanyProfile;