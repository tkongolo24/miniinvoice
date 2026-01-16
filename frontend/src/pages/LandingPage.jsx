import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const LandingPage = () => {
  const [isTransitioning, setIsTransitioning] = useState(false);
  const navigate = useNavigate();

  const handleSignUpClick = (e) => {
    e.preventDefault();
    setIsTransitioning(true);
    setTimeout(() => {
      navigate('/register');
    }, 800);
  };

  const handleLoginClick = (e) => {
    e.preventDefault();
    setIsTransitioning(true);
    setTimeout(() => {
      navigate('/login');
    }, 800);
  };

  // Transition overlay
  if (isTransitioning) {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center z-50">
        <div className="text-center animate-pulse">
          <div className="relative">
            {/* Logo animation */}
            <div className="w-16 h-16 bg-blue-600 rounded-xl flex items-center justify-center mx-auto mb-4 animate-bounce">
              <svg 
                className="w-8 h-8 text-white" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" 
                />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-blue-600">BillKazi</h1>
            <div className="mt-4 flex justify-center gap-1">
              <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
              <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
              <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <span className="text-xl font-bold text-blue-600">BillKazi</span>
            <div className="flex items-center gap-6">
              <a href="#pricing" className="text-gray-600 hover:text-gray-900 text-sm hidden sm:block">
                Pricing
              </a>
              <button
                onClick={handleLoginClick}
                className="text-gray-600 hover:text-gray-900 text-sm"
              >
                Log in
              </button>
              <button
                onClick={handleSignUpClick}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition text-sm font-medium"
              >
                Sign up
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-20 pb-24 sm:pt-28 sm:pb-32 bg-gradient-to-b from-white to-blue-50/30">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 leading-tight tracking-tight">
            Invoice your clients.<br />
            <span className="text-blue-600">Get paid.</span>
          </h1>
          <p className="mt-6 text-lg text-gray-600 max-w-xl mx-auto">
            Create professional invoices, share them on WhatsApp, and track payments. 
            Simple tools for freelancers and small businesses.
          </p>
          <div className="mt-10">
            <button
              onClick={handleSignUpClick}
              className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition text-base font-medium shadow-lg shadow-blue-600/20 hover:shadow-xl hover:shadow-blue-600/30"
            >
              Create your first invoice
            </button>
            <p className="mt-3 text-sm text-gray-500">
              Free to use · No credit card required
            </p>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-16">
            <div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-8">
                Everything you need, nothing you don't
              </h2>
              <div className="space-y-6">
                <div>
                  <h3 className="font-medium text-gray-900">Create invoices quickly</h3>
                  <p className="text-gray-600 text-sm mt-1">
                    Add your items, set your price, done. Takes about 30 seconds.
                  </p>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Share on WhatsApp</h3>
                  <p className="text-gray-600 text-sm mt-1">
                    Send a link your clients can open without downloading anything or creating an account.
                  </p>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Track what's paid</h3>
                  <p className="text-gray-600 text-sm mt-1">
                    See which invoices are pending and which are settled. Send reminders when needed.
                  </p>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Download PDFs</h3>
                  <p className="text-gray-600 text-sm mt-1">
                    Professional invoices and receipts you can print or attach to emails.
                  </p>
                </div>
              </div>
            </div>
            
            {/* Mock Invoice Card */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition">
              <div className="border-b border-gray-100 pb-4 mb-4">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide">Invoice</p>
                    <p className="text-lg font-semibold text-gray-900">#INV-0042</p>
                  </div>
                  <span className="bg-green-100 text-green-700 text-xs font-medium px-2.5 py-1 rounded-full">
                    Paid
                  </span>
                </div>
              </div>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Client</span>
                  <span className="text-gray-900 font-medium">Amara Solutions</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Amount</span>
                  <span className="text-gray-900 font-semibold">KES 45,000</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Due date</span>
                  <span className="text-gray-900">Jan 20, 2026</span>
                </div>
              </div>
              <div className="mt-6 pt-4 border-t border-gray-100 flex gap-2">
                <button className="flex-1 bg-gray-100 text-gray-700 text-sm py-2.5 rounded-lg hover:bg-gray-200 transition font-medium">
                  Download
                </button>
                <button className="flex-1 bg-blue-600 text-white text-sm py-2.5 rounded-lg hover:bg-blue-700 transition font-medium">
                  Share
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 bg-gradient-to-b from-blue-50/50 to-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-12 text-center">
            How it works
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center text-lg font-semibold mx-auto mb-4">
                1
              </div>
              <h3 className="font-medium text-gray-900 mb-2">Create an invoice</h3>
              <p className="text-gray-600 text-sm">
                Add your client's details and line items. The math is done for you.
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center text-lg font-semibold mx-auto mb-4">
                2
              </div>
              <h3 className="font-medium text-gray-900 mb-2">Send it to your client</h3>
              <p className="text-gray-600 text-sm">
                Share via WhatsApp, email, or copy the link. They can view it instantly.
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center text-lg font-semibold mx-auto mb-4">
                3
              </div>
              <h3 className="font-medium text-gray-900 mb-2">Mark it paid</h3>
              <p className="text-gray-600 text-sm">
                When the money comes in, update the status and generate a receipt.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-semibold text-gray-900">
              Pricing
            </h2>
            <p className="mt-2 text-gray-600">
              Start free. Upgrade if you need more.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {/* Free */}
            <div className="bg-white rounded-xl p-6 border border-gray-200 hover:border-gray-300 transition">
              <h3 className="font-semibold text-gray-900">Free</h3>
              <div className="mt-2 mb-4">
                <span className="text-3xl font-bold text-gray-900">0</span>
                <span className="text-gray-500 text-sm"> /month</span>
              </div>
              <p className="text-gray-600 text-sm mb-6">
                For freelancers just getting started
              </p>
              <ul className="space-y-3 text-sm text-gray-600 mb-6">
                <li className="flex items-center">
                  <svg className="w-4 h-4 text-blue-600 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  5 invoices per month
                </li>
                <li className="flex items-center">
                  <svg className="w-4 h-4 text-blue-600 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  PDF downloads
                </li>
                <li className="flex items-center">
                  <svg className="w-4 h-4 text-blue-600 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  WhatsApp sharing
                </li>
                <li className="flex items-center">
                  <svg className="w-4 h-4 text-blue-600 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Public invoice links
                </li>
              </ul>
              <button
                onClick={handleSignUpClick}
                className="block w-full text-center py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
              >
                Get started
              </button>
            </div>

            {/* Pro */}
            <div className="bg-blue-600 rounded-xl p-6 text-white shadow-xl shadow-blue-600/20 relative">
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <span className="bg-amber-400 text-amber-900 text-xs font-semibold px-3 py-1 rounded-full">
                  Popular
                </span>
              </div>
              <h3 className="font-semibold">Pro</h3>
              <div className="mt-2 mb-4">
                <span className="text-3xl font-bold">8,000</span>
                <span className="text-blue-200 text-sm"> RWF/month</span>
              </div>
              <p className="text-blue-100 text-sm mb-6">
                For active freelancers and consultants
              </p>
              <ul className="space-y-3 text-sm text-blue-100 mb-6">
                <li className="flex items-center">
                  <svg className="w-4 h-4 text-white mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Unlimited invoices
                </li>
                <li className="flex items-center">
                  <svg className="w-4 h-4 text-white mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Automatic reminders
                </li>
                <li className="flex items-center">
                  <svg className="w-4 h-4 text-white mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Your logo on invoices
                </li>
                <li className="flex items-center">
                  <svg className="w-4 h-4 text-white mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Receipt generation
                </li>
              </ul>
              <button
                onClick={handleSignUpClick}
                className="block w-full text-center py-2.5 bg-white text-blue-600 rounded-lg text-sm font-medium hover:bg-blue-50 transition"
              >
                Start with Pro
              </button>
            </div>

            {/* Business */}
            <div className="bg-white rounded-xl p-6 border border-gray-200 hover:border-gray-300 transition">
              <h3 className="font-semibold text-gray-900">Business</h3>
              <div className="mt-2 mb-4">
                <span className="text-3xl font-bold text-gray-900">15,000</span>
                <span className="text-gray-500 text-sm"> RWF/month</span>
              </div>
              <p className="text-gray-600 text-sm mb-6">
                For teams and growing agencies
              </p>
              <ul className="space-y-3 text-sm text-gray-600 mb-6">
                <li className="flex items-center">
                  <svg className="w-4 h-4 text-blue-600 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Everything in Pro
                </li>
                <li className="flex items-center">
                  <svg className="w-4 h-4 text-blue-600 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Up to 5 team members
                </li>
                <li className="flex items-center">
                  <svg className="w-4 h-4 text-blue-600 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Client database
                </li>
                <li className="flex items-center">
                  <svg className="w-4 h-4 text-blue-600 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Priority support
                </li>
              </ul>
              <button
                onClick={handleSignUpClick}
                className="block w-full text-center py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
              >
                Contact us
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 bg-gradient-to-b from-white to-blue-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl font-semibold text-gray-900">
            Ready to get started?
          </h2>
          <p className="mt-3 text-gray-600">
            Create your account and send your first invoice in minutes.
          </p>
          <div className="mt-8">
            <button
              onClick={handleSignUpClick}
              className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition text-base font-medium shadow-lg shadow-blue-600/20"
            >
              Create free account
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-8 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <span className="text-sm text-gray-500">
              © {new Date().getFullYear()} BillKazi
            </span>
            <div className="flex gap-6 text-sm text-gray-500">
              <button onClick={handleLoginClick} className="hover:text-gray-900 transition">
                Log in
              </button>
              <button onClick={handleSignUpClick} className="hover:text-gray-900 transition">
                Sign up
              </button>
              <a href="mailto:hello@billkazi.me" className="hover:text-gray-900 transition">
                Contact
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;