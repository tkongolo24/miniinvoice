import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        const token = searchParams.get('token');

        if (!token) {
          setError('Invalid verification link');
          setLoading(false);
          return;
        }

        const response = await axios.post(
          `${import.meta.env.VITE_API_URL}/api/auth/verify-email`,
          { token }
        );

        setSuccess(true);
        setError('');
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      } catch (err) {
        setError(err.response?.data?.message || 'Verification failed. Please try again.');
        setSuccess(false);
      } finally {
        setLoading(false);
      }
    };

    verifyEmail();
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
            BillKazi
          </h1>
          <h2 className="text-xl sm:text-2xl font-semibold text-gray-700">
            Verify Email
          </h2>
        </div>

        <div className="bg-white rounded-lg shadow-xl p-6 sm:p-8">
          {loading && (
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
              <p className="text-gray-600">Verifying your email...</p>
            </div>
          )}

          {success && !loading && (
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
              <h3 className="text-lg font-semibold text-green-600">Email Verified!</h3>
              <p className="text-gray-600">Your email has been verified successfully.</p>
              <p className="text-sm text-gray-500">Redirecting to login...</p>
            </div>
          )}

          {error && !loading && (
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
              </div>
              <h3 className="text-lg font-semibold text-red-600">Verification Failed</h3>
              <p className="text-gray-600">{error}</p>
              <Link
                to="/login"
                className="inline-block mt-4 text-blue-600 hover:text-blue-700 font-medium"
              >
                Back to Login
              </Link>
            </div>
          )}
        </div>

        <p className="text-center text-xs sm:text-sm text-gray-500">
          © 2024 BillKazi. All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default VerifyEmail;