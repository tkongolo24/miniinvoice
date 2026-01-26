# BillKazi 📄

> **Professional invoicing application designed specifically for African freelancers and small businesses**

BillKazi is a modern, full-stack invoicing solution that simplifies billing for freelancers across Africa. With multi-currency support, client management, and beautiful PDF templates, BillKazi helps you get paid faster.

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)

---

## 🌟 Features

### ✅ Core Features
- **Invoice Management** - Create, edit, view, and delete invoices with ease
- **Client Database** - Store and manage client information with auto-fill
- **Product Catalog** - Pre-save products/services for quick invoice creation
- **Multi-Currency Support** - RWF, KES, NGN, XOF, XAF, USD, EUR, GBP
- **Smart Tax Calculation** - Product-level taxable/non-taxable items
- **Flexible Discounts** - Percentage or fixed amount discounts
- **Multiple PDF Templates** - Classic, Modern, and Elegant designs
- **Email Integration** - Send invoices directly via SendGrid
- **WhatsApp Sharing** - Share invoices via WhatsApp (mobile-friendly)
- **Payment Reminders** - Automated reminders for overdue invoices
- **Payment Terms** - Auto-calculate due dates based on client terms

### 🎨 User Experience
- **Responsive Design** - Works perfectly on desktop, tablet, and mobile
- **Dark/Light Mode** - Coming soon
- **Professional Templates** - Multiple invoice designs to choose from
- **Real-time Validation** - Prevent errors with smart form validation
- **Intuitive Dashboard** - Quick overview of paid/unpaid invoices

---

## 🚀 Tech Stack

### Frontend
- **React 18** - Modern UI library
- **Vite** - Lightning-fast build tool
- **React Router** - Client-side routing
- **Tailwind CSS** - Utility-first CSS framework
- **Heroicons** - Beautiful SVG icons
- **Axios** - HTTP client for API calls

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling
- **JWT** - Authentication and authorization
- **Bcrypt** - Password hashing
- **SendGrid** - Email service integration
- **PDFKit** - PDF generation

### Deployment
- **Frontend**: Vercel
- **Backend**: Back4App (MongoDB Atlas compatible)
- **Database**: MongoDB Atlas

---

## 📦 Installation

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- MongoDB (local or Atlas)
- SendGrid account (for email features)

### Clone Repository
```bash
git clone https://github.com/tkongolo24/miniinvoice.git
cd miniinvoice
```

### Backend Setup
```bash
cd backend
npm install

# Create .env file
touch .env
```

Add the following to your `.env` file:
```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
SENDGRID_API_KEY=your_sendgrid_api_key
SENDGRID_FROM_EMAIL=your_verified_sender_email
FRONTEND_URL=http://localhost:5173
```

Start the backend:
```bash
npm run dev
```

### Frontend Setup
```bash
cd frontend
npm install

# Create .env file
touch .env
```

Add the following to your `.env` file:
```env
VITE_API_URL=http://localhost:5000
```

Start the frontend:
```bash
npm run dev
```

The app will be available at `http://localhost:5173`

---

## 🔧 Configuration

### Environment Variables

#### Backend (.env)
| Variable | Description | Required |
|----------|-------------|----------|
| `PORT` | Server port number | Yes |
| `MONGODB_URI` | MongoDB connection string | Yes |
| `JWT_SECRET` | Secret key for JWT tokens | Yes |
| `SENDGRID_API_KEY` | SendGrid API key for emails | Optional |
| `SENDGRID_FROM_EMAIL` | Verified sender email | Optional |
| `FRONTEND_URL` | Frontend URL for CORS | Yes |

#### Frontend (.env)
| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_API_URL` | Backend API URL | Yes |

---

## 📱 Usage Guide

### Creating Your First Invoice

1. **Complete Company Profile**
   - Navigate to "Company Profile"
   - Add your business details (name, address, email, phone)
   - Upload your logo (optional)

2. **Add a Client** (Optional but recommended)
   - Go to "Clients" section
   - Click "Add Client"
   - Fill in client details and payment terms
   - Save client for future invoices

3. **Add Products/Services** (Optional but recommended)
   - Go to "Products" section
   - Click "Add Product"
   - Enter product name, description, price, and tax status
   - Save products for quick invoice creation

4. **Create Invoice**
   - Click "New Invoice" from Dashboard
   - Select client from dropdown (or enter manually)
   - Select products from dropdown (or enter manually)
   - Add quantities and adjust prices if needed
   - Apply discount (optional)
   - Review summary and click "Create Invoice"

5. **Share Invoice**
   - View invoice from Dashboard
   - Click "Send Email" to email the client
   - Or click "Share via WhatsApp" for instant sharing
   - Download PDF for your records

---

## 🎨 Invoice Templates

BillKazi offers three professional templates:

1. **Classic** - Traditional, clean design with clear sections
2. **Modern** - Contemporary design with bold typography
3. **Elegant** - Sophisticated design with subtle styling

Each template includes:
- Company logo and details
- Client information
- Itemized list with quantities and prices
- Tax calculation breakdown
- Payment terms and notes
- Professional formatting

---

## 🔐 Security Features

- **JWT Authentication** - Secure token-based authentication
- **Password Hashing** - Bcrypt encryption for passwords
- **Rate Limiting** - Protect against brute force attacks
- **Input Validation** - Prevent injection attacks
- **CORS Protection** - Restrict cross-origin requests
- **Environment Variables** - Sensitive data kept secure

---

## 📊 Project Structure

```
miniinvoice/
├── backend/
│   ├── models/          # MongoDB schemas
│   │   ├── User.js
│   │   ├── Invoice.js
│   │   ├── Client.js
│   │   └── Product.js
│   ├── routes/          # API routes
│   │   ├── auth.js
│   │   ├── invoices.js
│   │   ├── clients.js
│   │   └── products.js
│   ├── middleware/      # Authentication & validation
│   ├── utils/           # PDF generation, email
│   └── server.js        # Express server
│
├── frontend/
│   ├── src/
│   │   ├── components/  # Reusable components
│   │   ├── pages/       # Page components
│   │   │   ├── Dashboard.jsx
│   │   │   ├── CreateInvoice.jsx
│   │   │   ├── Clients.jsx
│   │   │   └── Products.jsx
│   │   ├── services/    # API service layer
│   │   └── App.jsx      # Root component
│   └── public/          # Static assets
│
└── README.md
```

---

## 🐛 Known Issues

1. **Invoice Editing** - Paid invoices cannot be edited (by design for record integrity)
2. **Tax Calculation** - Non-taxable items bug has been fixed in latest update
3. **Browser Compatibility** - Best experience on Chrome, Firefox, Safari (latest versions)

---

## 🛣️ Roadmap

### Phase 2 (Current Priority)
- [ ] Customizable invoice numbering (INV-2026-001 format)
- [ ] Payment tracking (mark as paid, partial payments)
- [ ] Dashboard search and filtering
- [ ] Payment instructions field

### Phase 3 (Future)
- [ ] Dashboard analytics and charts
- [ ] Expense tracking
- [ ] Recurring invoices
- [ ] Multi-language support
- [ ] Dark mode
- [ ] Mobile app (React Native)

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Development Guidelines
- Write clean, readable code
- Follow existing code style
- Add comments for complex logic
- Test your changes thoroughly
- Update documentation as needed

---

## 📝 API Documentation

### Authentication Endpoints

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securepassword"
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "securepassword"
}
```

### Invoice Endpoints

#### Get All Invoices
```http
GET /api/invoices
Authorization: Bearer {token}
```

#### Create Invoice
```http
POST /api/invoices
Authorization: Bearer {token}
Content-Type: application/json

{
  "invoiceNumber": "INV-001",
  "clientName": "Client Name",
  "clientEmail": "client@example.com",
  "items": [...],
  "currency": "RWF",
  "total": 100000
}
```

#### Update Invoice
```http
PUT /api/invoices/:id
Authorization: Bearer {token}
Content-Type: application/json
```

#### Delete Invoice
```http
DELETE /api/invoices/:id
Authorization: Bearer {token}
```

---

## 🙏 Acknowledgments

- **ALU (African Leadership University)** - For supporting this project
- **Anthropic Claude** - For development assistance
- **Open Source Community** - For amazing tools and libraries

---

## 📧 Support

For support, email tkongolo24@alustudent.com or open an issue on GitHub.

---

## 👨‍💻 Author

**Teejay Kongolo**
- GitHub: [@tkongolo24](https://github.com/tkongolo24)
- Project: BillKazi
- School: African Leadership University (ALU)

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🌍 Made for Africa

BillKazi is built with African freelancers in mind:
- Support for East African currencies (RWF, KES)
- West African CFA (XOF) and Central African CFA (XAF)
- WhatsApp integration for easy sharing
- Mobile-first design for on-the-go invoicing
- Low-bandwidth optimized

---

