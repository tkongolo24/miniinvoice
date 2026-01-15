import { Link } from 'react-router-dom';

const LandingPage = () => {
  const features = [
    {
      icon: '⚡',
      title: 'Create Invoices in Seconds',
      description: 'Professional invoices in under 30 seconds. No accounting degree needed.'
    },
    {
      icon: '💬',
      title: 'Share via WhatsApp',
      description: 'Send invoices directly to clients on WhatsApp - where African business happens.'
    },
    {
      icon: '🔗',
      title: 'Public Invoice Links',
      description: 'Clients view and verify invoices online. No login required.'
    },
    {
      icon: '🧾',
      title: 'Auto Receipts',
      description: 'Generate professional receipts instantly when payments are confirmed.'
    },
    {
      icon: '⏰',
      title: 'Payment Reminders',
      description: 'Automated WhatsApp reminders for overdue invoices. Get paid faster.'
    },
    {
      icon: '🌍',
      title: 'Built for Africa',
      description: 'Support for RWF, KES, NGN, CFA. Multi-language: English, French, Kinyarwanda.'
    }
  ];

  const steps = [
    {
      number: '1',
      title: 'Create Invoice',
      description: 'Add client details, items, and prices'
    },
    {
      number: '2',
      title: 'Share on WhatsApp',
      description: 'Send invoice link directly to your client'
    },
    {
      number: '3',
      title: 'Get Paid',
      description: 'Track payments and send reminders'
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <span className="text-2xl font-bold text-blue-600">BillKazi</span>
            </div>
            <div className="flex items-center gap-4">
              <Link
                to="/login"
                className="text-gray-600 hover:text-gray-900 font-medium text-sm sm:text-base"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition font-medium text-sm sm:text-base"
              >
                Get Started Free
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 via-white to-indigo-50 pt-16 pb-20 sm:pt-24 sm:pb-28">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
            Get Paid Faster.
            <span className="text-blue-600"> Invoice Smarter.</span>
          </h1>
          <p className="mt-6 text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto">
            The invoicing app built for African freelancers. Create professional invoices, 
            share on WhatsApp, and get paid faster.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/register"
              className="bg-blue-600 text-white px-8 py-4 rounded-lg hover:bg-blue-700 transition font-semibold text-lg shadow-lg hover:shadow-xl"
            >
              Start Free Today →
            </Link>
            <a
              href="#how-it-works"
              className="bg-white text-gray-700 px-8 py-4 rounded-lg hover:bg-gray-50 transition font-semibold text-lg border border-gray-200"
            >
              See How It Works
            </a>
          </div>
          <p className="mt-4 text-sm text-gray-500">
            ✓ Free forever plan &nbsp; ✓ No credit card required &nbsp; ✓ Setup in 2 minutes
          </p>
        </div>
      </section>

      {/* Problem Section */}
      <section className="py-16 sm:py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
              Invoicing Shouldn't Be This Hard
            </h2>
            <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
              African freelancers face unique challenges that global tools don't solve.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-red-50 rounded-xl p-6 border border-red-100">
              <div className="text-3xl mb-4">😤</div>
              <h3 className="font-semibold text-gray-900 mb-2">Excel & Word Invoices</h3>
              <p className="text-gray-600 text-sm">
                Manually creating invoices in Excel takes forever and looks unprofessional.
              </p>
            </div>
            <div className="bg-red-50 rounded-xl p-6 border border-red-100">
              <div className="text-3xl mb-4">💸</div>
              <h3 className="font-semibold text-gray-900 mb-2">Wrong Currencies</h3>
              <p className="text-gray-600 text-sm">
                Global tools don't support RWF, KES, NGN, or CFA. You're stuck with USD.
              </p>
            </div>
            <div className="bg-red-50 rounded-xl p-6 border border-red-100">
              <div className="text-3xl mb-4">📧</div>
              <h3 className="font-semibold text-gray-900 mb-2">Email? Really?</h3>
              <p className="text-gray-600 text-sm">
                In Africa, business happens on WhatsApp. Email invoices get ignored.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 sm:py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
              Everything You Need to Get Paid
            </h2>
            <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
              Built specifically for how African freelancers work.
            </p>
          </div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition border border-gray-100"
              >
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="font-semibold text-gray-900 text-lg mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600 text-sm">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-16 sm:py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
              How It Works
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Three simple steps to get paid faster.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((step, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                  {step.number}
                </div>
                <h3 className="font-semibold text-gray-900 text-xl mb-2">
                  {step.title}
                </h3>
                <p className="text-gray-600">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-16 sm:py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
              Simple Pricing
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Start free, upgrade when you're ready.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Free Plan */}
            <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm">
              <h3 className="text-xl font-bold text-gray-900">Free</h3>
              <p className="text-gray-600 mt-1">Perfect for getting started</p>
              <div className="mt-6">
                <span className="text-4xl font-bold text-gray-900">0</span>
                <span className="text-gray-600"> RWF/month</span>
              </div>
              <ul className="mt-6 space-y-3">
                <li className="flex items-center text-sm text-gray-600">
                  <span className="text-green-500 mr-2">✓</span>
                  Up to 10 invoices/month
                </li>
                <li className="flex items-center text-sm text-gray-600">
                  <span className="text-green-500 mr-2">✓</span>
                  WhatsApp sharing
                </li>
                <li className="flex items-center text-sm text-gray-600">
                  <span className="text-green-500 mr-2">✓</span>
                  PDF downloads
                </li>
                <li className="flex items-center text-sm text-gray-600">
                  <span className="text-green-500 mr-2">✓</span>
                  Public invoice links
                </li>
                <li className="flex items-center text-sm text-gray-600">
                  <span className="text-green-500 mr-2">✓</span>
                  Auto receipts
                </li>
              </ul>
              <Link
                to="/register"
                className="mt-8 block w-full bg-gray-100 text-gray-900 text-center py-3 rounded-lg font-semibold hover:bg-gray-200 transition"
              >
                Get Started Free
              </Link>
            </div>

            {/* Pro Plan */}
            <div className="bg-blue-600 rounded-2xl p-8 text-white shadow-lg relative">
              <div className="absolute top-4 right-4 bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-1 rounded">
                POPULAR
              </div>
              <h3 className="text-xl font-bold">Pro</h3>
              <p className="text-blue-100 mt-1">For growing freelancers</p>
              <div className="mt-6">
                <span className="text-4xl font-bold">8,000</span>
                <span className="text-blue-100"> RWF/month</span>
              </div>
              <ul className="mt-6 space-y-3">
                <li className="flex items-center text-sm text-blue-100">
                  <span className="text-white mr-2">✓</span>
                  Unlimited invoices
                </li>
                <li className="flex items-center text-sm text-blue-100">
                  <span className="text-white mr-2">✓</span>
                  Auto payment reminders
                </li>
                <li className="flex items-center text-sm text-blue-100">
                  <span className="text-white mr-2">✓</span>
                  Company branding on invoices
                </li>
                <li className="flex items-center text-sm text-blue-100">
                  <span className="text-white mr-2">✓</span>
                  Priority support
                </li>
                <li className="flex items-center text-sm text-blue-100">
                  <span className="text-white mr-2">✓</span>
                  Everything in Free
                </li>
              </ul>
              <Link
                to="/register"
                className="mt-8 block w-full bg-white text-blue-600 text-center py-3 rounded-lg font-semibold hover:bg-blue-50 transition"
              >
                Start Pro Trial
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonial / Social Proof */}
      <section className="py-16 sm:py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-8 sm:p-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
              Join African Freelancers Getting Paid Faster
            </h2>
            <p className="text-gray-600 text-lg mb-8 max-w-2xl mx-auto">
              Designers, developers, consultants, and creators across Rwanda, Kenya, 
              Nigeria, and beyond trust BillKazi for their invoicing.
            </p>
            <div className="flex flex-wrap justify-center gap-8 text-center">
              <div>
                <div className="text-3xl font-bold text-blue-600">🇷🇼 🇰🇪 🇳🇬</div>
                <p className="text-sm text-gray-600 mt-1">Countries Supported</p>
              </div>
              <div>
                <div className="text-3xl font-bold text-blue-600">4</div>
                <p className="text-sm text-gray-600 mt-1">Currencies</p>
              </div>
              <div>
                <div className="text-3xl font-bold text-blue-600">3</div>
                <p className="text-sm text-gray-600 mt-1">Languages</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16 sm:py-20 bg-blue-600">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Ready to Get Paid Faster?
          </h2>
          <p className="text-blue-100 text-lg mb-8 max-w-2xl mx-auto">
            Join hundreds of African freelancers who've simplified their invoicing. 
            It's free to start.
          </p>
          <Link
            to="/register"
            className="inline-block bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-blue-50 transition shadow-lg"
          >
            Create Your First Invoice →
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <span className="text-2xl font-bold text-white">BillKazi</span>
              <p className="mt-2 text-sm">
                Invoicing made simple for African freelancers.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-3">Product</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#how-it-works" className="hover:text-white transition">How It Works</a></li>
                <li><Link to="/register" className="hover:text-white transition">Pricing</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-3">Account</h4>
              <ul className="space-y-2 text-sm">
                <li><Link to="/login" className="hover:text-white transition">Login</Link></li>
                <li><Link to="/register" className="hover:text-white transition">Sign Up</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-3">Connect</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="mailto:support@billkazi.me" className="hover:text-white transition">support@billkazi.me</a></li>
                <li><a href="https://twitter.com/billkazi" className="hover:text-white transition">Twitter</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-sm text-center">
            <p>© {new Date().getFullYear()} BillKazi.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;