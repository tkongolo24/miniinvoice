import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import Login from './pages/login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import CreateInvoice from './pages/CreateInvoice';
import EditInvoice from './pages/EditInvoice';
import InvoiceDetail from './pages/InvoiceDetail';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import ErrorBoundary from './components/ErrorBoundary';
import { LanguageProvider } from './contexts/LanguageContext';
import CompanyProfile from './pages/CompanyProfile';
import PublicInvoice from './pages/PublicInvoice';
import VerifyEmail from './pages/VerifyEmail';
import { inject } from '@vercel/analytics';
import MagicSignin from './pages/MagicSignin';
import ResetPassword from './pages/ResetPassword';
import LandingPage from './pages/LandingPage';
import ClientAPITest from './pages/ClientAPITest';



inject();

// Protected Route component
function ProtectedRoute({ children }) {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/login" />;
}

function App() {
  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      <ErrorBoundary>
        <LanguageProvider>
          <Router>
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/verify-email" element={<VerifyEmail />} />
              <Route path="/magic-signin" element={<MagicSignin />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/i/:shareToken" element={<PublicInvoice />} />
              <Route path="/test-clients" element={<ClientAPITest />} />

              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/create-invoice"
                element={
                  <ProtectedRoute>
                    <CreateInvoice />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/edit-invoice/:id"
                element={
                  <ProtectedRoute>
                    <EditInvoice />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/invoice/:id"
                element={
                  <ProtectedRoute>
                    <InvoiceDetail />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/settings"
                element={
                  <ProtectedRoute>
                    <Settings />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/company-profile"
                element={
                  <ProtectedRoute>
                    <CompanyProfile />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </Router>
        </LanguageProvider>
      </ErrorBoundary>
    </GoogleOAuthProvider>
  );
}

export default App;