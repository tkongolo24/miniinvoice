# MiniInvoice - Professional Invoice Management System

<div align="center">

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![Status](https://img.shields.io/badge/status-production--ready-green.svg)
![License](https://img.shields.io/badge/license-MIT-blue.svg)

**A modern, mobile-responsive invoice management platform for freelancers and small businesses**

[Live Demo](#) • [Documentation](#documentation) • [API Reference](#api-reference) • [Report Bug](#support)

</div>

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Variables](#environment-variables)
  - [Running Locally](#running-locally)
- [Project Structure](#project-structure)
- [Component Documentation](#component-documentation)
- [API Reference](#api-reference)
- [Mobile Responsive Design](#mobile-responsive-design)
- [PDF Templates](#pdf-templates)
- [Authentication & Security](#authentication--security)
- [Deployment](#deployment)
- [Testing](#testing)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)
- [License](#license)
- [Support](#support)

---

## 🎯 Overview

MiniInvoice is a full-stack web application designed to streamline invoice management for freelancers and small businesses, particularly targeting African markets. Built with modern technologies and mobile-first principles, it provides an intuitive interface for creating, managing, and tracking professional invoices with multiple PDF template options.

### Key Highlights

- 🚀 **Production Ready**: Fully functional with 100% feature completion
- 📱 **Mobile-First**: Responsive design optimized for all devices
- 🎨 **Professional PDFs**: Three customizable invoice templates
- 🔒 **Secure**: JWT authentication with bcrypt password hashing
- ⚡ **Fast**: Optimized performance with modern build tools
- 🌍 **Global Ready**: Multi-currency and tax rate support

### Target Users

- Freelancers (designers, developers, consultants)
- Small business owners
- Independent contractors
- Service providers in emerging markets

---

## ✨ Features

### Core Functionality

#### Invoice Management
- ✅ Create invoices with multiple line items
- ✅ Edit existing invoices
- ✅ Delete invoices with confirmation
- ✅ Duplicate invoices for reuse
- ✅ Mark invoices as paid/unpaid
- ✅ Filter invoices by status
- ✅ Auto-generated invoice numbers

#### PDF Generation
- ✅ **Classic Template**: Traditional professional layout
- ✅ **Modern Template**: Clean minimalist design
- ✅ **Elegant Template**: Sophisticated styling
- ✅ Template selection with default preferences
- ✅ Professional formatting with proper calculations

#### User Management
- ✅ Secure registration and authentication
- ✅ Profile customization (personal & company info)
- ✅ Password management
- ✅ Account deletion with confirmation
- ✅ Session management with JWT tokens

#### Dashboard & Analytics
- ✅ Invoice overview with statistics
- ✅ Status filtering (all, paid, unpaid)
- ✅ Quick actions (view, edit, duplicate, delete)
- ✅ Responsive data visualization

#### Mobile Optimization
- ✅ Touch-optimized interfaces (44px minimum tap targets)
- ✅ Responsive layouts (mobile, tablet, desktop)
- ✅ Adaptive navigation
- ✅ No horizontal scrolling
- ✅ Progressive web app ready

---

## 🛠 Tech Stack

### Frontend
```
React 18.x          - UI library
Vite 4.x            - Build tool & dev server
Tailwind CSS 3.x    - Utility-first CSS framework
React Router 6.x    - Client-side routing
Axios               - HTTP client
jsPDF               - PDF generation
jsPDF-AutoTable     - PDF table formatting
```

### Backend
```
Node.js 18.x        - JavaScript runtime
Express.js 4.x      - Web application framework
MongoDB             - NoSQL database
Mongoose            - MongoDB object modeling
JWT                 - Authentication tokens
bcryptjs            - Password hashing
Helmet              - Security middleware
Express-rate-limit  - Rate limiting
CORS                - Cross-origin resource sharing
```

### DevOps & Tools
```
Git & GitHub        - Version control
Vercel              - Frontend hosting
Render              - Backend hosting
MongoDB Atlas       - Database hosting
ESLint              - Code linting
Prettier            - Code formatting
```

---

## 🚀 Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18.x or higher) - [Download](https://nodejs.org/)
- **npm** (v9.x or higher) - Comes with Node.js
- **MongoDB Atlas Account** - [Sign Up](https://www.mongodb.com/cloud/atlas/register)
- **Git** - [Download](https://git-scm.com/)

### Installation

#### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/miniinvoice.git
cd miniinvoice
```

#### 2. Install Backend Dependencies

```bash
cd backend
npm install
```

**Backend Dependencies:**
```json
{
  "express": "^4.18.2",
  "mongoose": "^8.0.0",
  "jsonwebtoken": "^9.0.2",
  "bcryptjs": "^2.4.3",
  "cors": "^2.8.5",
  "dotenv": "^16.3.1",
  "helmet": "^7.1.0",
  "express-rate-limit": "^7.1.5"
}
```

#### 3. Install Frontend Dependencies

```bash
cd ../frontend
npm install
```

**Frontend Dependencies:**
```json
{
  "react": "^18.2.0",
  "react-dom": "^18.2.0",
  "react-router-dom": "^6.20.0",
  "axios": "^1.6.2",
  "jspdf": "^2.5.1",
  "jspdf-autotable": "^3.8.2"
}
```

### Environment Variables

#### Backend Configuration

Create a `.env` file in the `backend` directory:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database Configuration
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/miniinvoice?retryWrites=true&w=majority

# Authentication
JWT_SECRET=your_super_secret_random_string_minimum_32_characters_long

# Optional: JWT Expiration
JWT_EXPIRES_IN=7d
```

**Generating a Secure JWT Secret:**
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

#### Frontend Configuration

Create a `.env` file in the `frontend` directory:

```env
# API Configuration
VITE_API_URL=http://localhost:5000
```

### Running Locally

#### 1. Start Backend Server

```bash
cd backend
npm run dev
```

Backend will run on: `http://localhost:5000`

**Backend Scripts:**
```json
{
  "start": "node server.js",
  "dev": "nodemon server.js"
}
```

#### 2. Start Frontend Development Server

```bash
cd frontend
npm run dev
```

Frontend will run on: `http://localhost:5173`

**Frontend Scripts:**
```json
{
  "dev": "vite",
  "build": "vite build",
  "preview": "vite preview"
}
```

#### 3. Access the Application

Open your browser and navigate to: `http://localhost:5173`

---

## 📁 Project Structure

```
miniinvoice/
│
├── frontend/                       # React frontend application
│   ├── public/                     # Static assets
│   ├── src/
│   │   ├── pages/                  # Page components
│   │   │   ├── Login.jsx           # Authentication page
│   │   │   ├── Register.jsx        # User registration page
│   │   │   ├── Dashboard.jsx       # Main invoice dashboard
│   │   │   ├── CreateInvoice.jsx   # Invoice creation form
│   │   │   ├── EditInvoice.jsx     # Invoice editing form
│   │   │   ├── InvoiceDetail.jsx   # Single invoice view
│   │   │   ├── Profile.jsx         # User profile management
│   │   │   └── Settings.jsx        # Account settings
│   │   ├── App.jsx                 # Main app component & routing
│   │   ├── main.jsx                # Application entry point
│   │   └── index.css               # Global styles & Tailwind imports
│   ├── .env                        # Environment variables
│   ├── package.json                # Frontend dependencies
│   ├── vite.config.js              # Vite configuration
│   ├── tailwind.config.js          # Tailwind CSS configuration
│   └── index.html                  # HTML entry point
│
├── backend/                        # Node.js/Express backend
│   ├── models/                     # Mongoose schemas
│   │   ├── User.js                 # User model
│   │   └── Invoice.js              # Invoice model
│   ├── routes/                     # API route handlers
│   │   ├── auth.js                 # Authentication routes
│   │   ├── invoices.js             # Invoice CRUD routes
│   │   └── users.js                # User management routes
│   ├── middleware/                 # Custom middleware
│   │   └── auth.js                 # JWT authentication middleware
│   ├── server.js                   # Express server setup
│   ├── .env                        # Environment variables
│   └── package.json                # Backend dependencies
│
├── .gitignore                      # Git ignore file
└── README.md                       # This file
```

---

## 📦 Component Documentation

### Authentication Components

#### Login.jsx
**Purpose**: User authentication and session initiation

**Features**:
- Email and password validation
- JWT token generation and storage
- Error handling with user feedback
- Redirect to dashboard on success
- Mobile-responsive form layout

**Key Functions**:
```javascript
handleSubmit()  // Authenticates user and stores JWT
handleChange()  // Updates form state
```

**State Management**:
```javascript
{
  formData: { email: '', password: '' },
  error: '',
  loading: false
}
```

---

#### Register.jsx
**Purpose**: New user account creation

**Features**:
- Multi-field registration form
- Password confirmation validation
- Auto-login after registration
- Company information (optional)
- Mobile-optimized layout

**Validation Rules**:
- Email format validation
- Password minimum length (6 characters)
- Password match confirmation
- Required field validation

---

### Dashboard & Invoice Management

#### Dashboard.jsx
**Purpose**: Central hub for invoice management

**Features**:
- Invoice list with filtering (all, paid, unpaid)
- Statistics cards (total, paid, unpaid)
- Quick actions (view, edit, duplicate, delete)
- **Responsive Views**:
  - Desktop: Full data table
  - Mobile: Card-based layout
- Search and filter functionality

**Key Functions**:
```javascript
fetchInvoices()           // Retrieves all user invoices
handleDelete(id)          // Deletes invoice with confirmation
handleDuplicate(invoice)  // Creates copy of invoice
toggleStatus(id)          // Switches paid/unpaid status
```

**Mobile Optimizations**:
- Card view on screens < 768px
- Touch-friendly action buttons
- Stacked statistics cards
- Responsive filter buttons

---

#### CreateInvoice.jsx
**Purpose**: Invoice creation with template selection

**Features**:
- Multi-item invoice creation
- Dynamic item management (add/remove)
- Real-time calculations (subtotal, tax, total)
- Template selection (Classic, Modern, Elegant)
- "Set as default" template option
- Auto-generated invoice numbers

**Calculations**:
```javascript
calculateSubtotal()  // Sum of (quantity × price) for all items
calculateTax()       // Subtotal × (taxRate / 100)
calculateTotal()     // Subtotal + Tax
```

**Mobile Features**:
- Stacked form fields on mobile
- Large touch-friendly inputs
- Full-width buttons
- Responsive grid layout (1 column mobile, 2 columns desktop)

---

#### EditInvoice.jsx
**Purpose**: Modify existing invoices

**Features**:
- Pre-filled form with existing invoice data
- Same functionality as CreateInvoice
- Update instead of create operation
- Template modification
- Navigation back to invoice detail

**API Integration**:
```javascript
GET  /api/invoices/:id     // Fetch invoice data
PUT  /api/invoices/:id     // Update invoice
```

---

#### InvoiceDetail.jsx
**Purpose**: Detailed invoice view with actions

**Features**:
- Complete invoice information display
- **3 PDF Templates**:
  - Classic: Traditional professional layout
  - Modern: Clean minimalist design
  - Elegant: Sophisticated styling
- Action buttons:
  - Download PDF
  - Edit Invoice
  - Toggle Status (Paid/Unpaid)
  - Delete Invoice
- Mobile-responsive item display
  - Desktop: Table format
  - Mobile: Card format

**PDF Generation**:
```javascript
generatePDF()           // Router based on template
generateClassicPDF()    // Classic template generation
generateModernPDF()     // Modern template generation
generateElegantPDF()    // Elegant template generation
```

**Mobile Optimizations**:
- Stacked invoice details
- Card-based item display on mobile
- Touch-friendly action buttons
- Responsive summary section

---

### User Management

#### Profile.jsx
**Purpose**: User profile and company information management

**Features**:
- Personal information (name, email, phone)
- Company information (name, address, website)
- Real-time updates
- Success/error feedback
- Email (read-only, security measure)

**Editable Fields**:
```javascript
// Personal
name         // User's full name
phone        // Contact number

// Company
companyName     // Business name
companyAddress  // Business address
website         // Company website URL
```

---

#### Settings.jsx
**Purpose**: Account security and preferences

**Features**:
- Password change with validation
- Logout functionality
- Account deletion (double confirmation)
- Security best practices

**Security Features**:
- Current password verification
- New password strength validation
- Password confirmation
- Secure token management

---

## 🔌 API Reference

### Base URL

```
Development:  http://localhost:5000/api
Production:   https://your-backend.onrender.com/api
```

### Authentication

All protected endpoints require JWT token:

```javascript
headers: {
  'Authorization': 'Bearer <jwt_token>'
}
```

---

### Auth Endpoints

#### Register User
```http
POST /auth/register
```

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securepassword123",
  "companyName": "Acme Corp"  // Optional
}
```

**Response (201):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "64a1b2c3d4e5f6g7h8i9j0k1",
    "name": "John Doe",
    "email": "john@example.com",
    "companyName": "Acme Corp"
  }
}
```

**Error Responses:**
- `400` - Validation error (email exists, invalid format)
- `500` - Server error

---

#### Login User
```http
POST /auth/login
```

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "securepassword123"
}
```

**Response (200):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "64a1b2c3d4e5f6g7h8i9j0k1",
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

**Error Responses:**
- `400` - Invalid credentials
- `404` - User not found

---

### Invoice Endpoints

#### Get All Invoices
```http
GET /invoices
Authorization: Bearer <token>
```

**Response (200):**
```json
[
  {
    "_id": "64a1b2c3d4e5f6g7h8i9j0k1",
    "userId": "64a1b2c3d4e5f6g7h8i9j0k2",
    "invoiceNumber": "INV-1700000001",
    "date": "2024-01-15T00:00:00.000Z",
    "dueDate": "2024-02-15T00:00:00.000Z",
    "clientName": "Client Corp",
    "clientEmail": "client@example.com",
    "clientAddress": "123 Main St, City, Country",
    "items": [
      {
        "description": "Web Design Services",
        "quantity": 1,
        "price": 1500
      },
      {
        "description": "Logo Design",
        "quantity": 1,
        "price": 500
      }
    ],
    "subtotal": 2000,
    "taxRate": 18,
    "tax": 360,
    "total": 2360,
    "status": "unpaid",
    "template": "modern",
    "notes": "Payment due within 30 days. Thank you for your business!",
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
]
```

---

#### Get Single Invoice
```http
GET /invoices/:id
Authorization: Bearer <token>
```

**Response (200):** Single invoice object (same structure as above)

**Error Responses:**
- `404` - Invoice not found
- `401` - Unauthorized (not owner)

---

#### Create Invoice
```http
POST /invoices
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "invoiceNumber": "INV-001",
  "date": "2024-01-15",
  "dueDate": "2024-02-15",
  "clientName": "Client Corporation",
  "clientEmail": "contact@clientcorp.com",
  "clientAddress": "123 Business St\nCity, State 12345\nCountry",
  "items": [
    {
      "description": "Web Development",
      "quantity": 40,
      "price": 50
    },
    {
      "description": "UI/UX Design",
      "quantity": 20,
      "price": 75
    }
  ],
  "taxRate": 18,
  "notes": "Payment terms: Net 30\nBank transfer details: [Your bank info]",
  "template": "elegant"
}
```

**Response (201):** Created invoice object

**Validation Rules:**
- `invoiceNumber` - Required, string
- `date` - Required, valid date
- `dueDate` - Required, valid date, must be after date
- `clientName` - Required, string
- `clientEmail` - Required, valid email
- `items` - Required, array with at least 1 item
- `items[].description` - Required, string
- `items[].quantity` - Required, number > 0
- `items[].price` - Required, number >= 0
- `taxRate` - Optional, number >= 0, default 0
- `template` - Optional, one of: classic|modern|elegant, default classic

---

#### Update Invoice
```http
PUT /invoices/:id
Authorization: Bearer <token>
```

**Request Body:** Same as Create Invoice (all fields required)

**Response (200):** Updated invoice object

**Error Responses:**
- `404` - Invoice not found
- `401` - Unauthorized (not owner)
- `400` - Validation error

---

#### Toggle Invoice Status
```http
PATCH /invoices/:id/status
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "status": "paid"  // or "unpaid"
}
```

**Response (200):** Updated invoice object

---

#### Delete Invoice
```http
DELETE /invoices/:id
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "message": "Invoice deleted successfully"
}
```

**Error Responses:**
- `404` - Invoice not found
- `401` - Unauthorized (not owner)

---

### User Endpoints

#### Get User Profile
```http
GET /users/profile
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "id": "64a1b2c3d4e5f6g7h8i9j0k1",
  "name": "John Doe",
  "email": "john@example.com",
  "companyName": "Acme Corporation",
  "companyAddress": "456 Business Ave, Suite 100\nCity, State 54321",
  "phone": "+1-555-123-4567",
  "website": "https://acmecorp.com",
  "defaultTemplate": "modern",
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

---

#### Update User Profile
```http
PUT /users/profile
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "name": "John Updated Doe",
  "companyName": "New Acme Corp",
  "companyAddress": "789 New Street\nNew City, State 99999",
  "phone": "+1-555-987-6543",
  "website": "https://newacme.com"
}
```

**Response (200):** Updated user object

**Note:** Email cannot be changed for security reasons

---

#### Change Password
```http
PUT /users/change-password
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "currentPassword": "oldpassword123",
  "newPassword": "newstrongpassword456"
}
```

**Response (200):**
```json
{
  "message": "Password changed successfully"
}
```

**Error Responses:**
- `400` - Current password incorrect
- `400` - New password too weak (< 6 characters)

---

#### Set Default Template
```http
PUT /users/default-template
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "defaultTemplate": "elegant"
}
```

**Response (200):** Updated user object

**Valid Templates:** `classic`, `modern`, `elegant`

---

#### Delete Account
```http
DELETE /users/account
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "message": "Account and all associated data deleted successfully"
}
```

**Warning:** This action is irreversible and deletes:
- User account
- All invoices
- All profile data

---

## 📱 Mobile Responsive Design

### Design Philosophy

MiniInvoice follows a **mobile-first** approach, ensuring optimal user experience across all devices. The responsive design adapts content, layout, and interactions based on screen size.

### Breakpoint System

Using Tailwind CSS breakpoints:

| Breakpoint | Screen Size | Prefix | Target Devices |
|----------|-------------|--------|----------------|
| Mobile | < 640px | (default) | Phones in portrait |
| Small | ≥ 640px | `sm:` | Phones in landscape, small tablets |
| Medium | ≥ 768px | `md:` | Tablets in portrait |
| Large | ≥ 1024px | `lg:` | Tablets in landscape, laptops |
| Extra Large | ≥ 1280px | `xl:` | Desktops |

### Responsive Patterns

#### 1. Responsive Typography
```jsx
// Example: Headers
className="text-2xl sm:text-3xl lg:text-4xl"
// Mobile: 24px, Tablet: 30px, Desktop: 36px

// Example: Body Text
className="text-sm sm:text-base lg:text-lg"
// Mobile: 14px, Tablet: 16px, Desktop: 18px
```

#### 2. Responsive Spacing
```jsx
// Padding
className="p-4 sm:p-6 lg:p-8"
// Mobile: 1rem, Tablet: 1.5rem, Desktop: 2rem

// Margins
className="mb-4 sm:mb-6 lg:mb-8"
// Progressive spacing increase
```

#### 3. Responsive Layouts
```jsx
// Grid System
className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
// Mobile: 1 column, Tablet: 2 columns, Desktop: 3 columns

// Flexbox Direction
className="flex flex-col sm:flex-row"
// Mobile: Vertical stack, Desktop: Horizontal row
```

#### 4. Responsive Widths
```jsx
// Button Widths
className="w-full sm:w-auto"
// Mobile: Full width, Desktop: Auto width

// Container Widths
className="w-full sm:max-w-xl lg:max-w-4xl"
// Progressive max-width constraints
```

#### 5. Conditional Display
```jsx
// Hide on Mobile, Show on Desktop
className="hidden md:block"

// Show on Mobile, Hide on Desktop
className="block md:hidden"

// Example: Dashboard Table vs Cards
<div className="hidden md:block">
  {/* Desktop Table View */}
</div>
<div className="md:hidden">
  {/* Mobile Card View */}
</div>
```

### Component-Specific Mobile Features

#### Dashboard
**Desktop (≥768px)**:
- Full data table with all columns
- Horizontal action buttons
- Side-by-side statistics

**Mobile (<768px)**:
- Card-based layout for invoices
- Stacked action buttons
- Vertically stacked statistics
- Touch-optimized tap targets (44px minimum)

#### Forms (Create/Edit Invoice)
**Desktop**:
- Two-column grid for invoice details
- Side-by-side quantity and price fields
- Horizontal button layout

**Mobile**:
- Single-column form
- Stacked input fields
- Full-width inputs for easy typing
- Large, tappable buttons
- Adequate spacing between fields

#### Invoice Detail
**Desktop**:
- Two-column layout (client info | invoice details)
- Table format for line items
- Horizontal action buttons

**Mobile**:
- Single-column stacked layout
- Card format for line items
- Stacked action buttons
- Easy-to-read summary

### Touch Optimization

All interactive elements follow accessibility guidelines:

- **Minimum tap target**: 44px × 44px
- **Spacing between targets**: Minimum 8px
- **Button padding**: `px-4 py-3` on mobile
- **Input height**: Minimum 48px
- **Checkbox/Radio size**: 20px × 20px

### Performance Optimizations

- **Lazy loading**: Images and components loaded on demand
- **Code splitting**: Route-based splitting with React Router
- **Optimized assets**: Compressed images and minified code
- **Efficient rendering**: React.memo for expensive components
- **Debounced inputs**: Search and filter operations

---

## 🎨 PDF Templates

### Template System Overview

MiniInvoice includes three professionally designed PDF templates, each optimized for different business contexts. Templates are generated client-side using jsPDF and jsPDF-AutoTable.

### Available Templates

#### 1. Classic Template
**Characteristics:**
- Traditional business layout
- Blue color scheme (#428bca)
- Striped table rows
- Standard professional formatting

**Best For:**
- Corporate clients
- Government contracts
- Formal business relationships
- Conservative industries

**Visual Elements:**
- Bold "INVOICE" header
- Structured information blocks
- Standard table with alternating row colors
- Clear hierarchy

---

#### 2. Modern Template
**Characteristics:**
- Minimalist design
- Dark gray header (#34495e)
- Clean lines and spacing
- Contemporary typography

**Best For:**
- Tech companies
- Creative agencies
- Startups
- Modern brands

**Visual Elements:**
- Sleek header with white text
- Plain table design
- Generous white space
- Bold, modern fonts

---

#### 3. Elegant Template
**Characteristics:**
- Sophisticated styling
- Purple accent color (#4b0082)
- Subtle grid lines
- Refined typography

**Best For:**
- Luxury brands
- High-end services
- Boutique businesses
- Premium offerings

**Visual Elements:**
- Italic accents
- Colored information blocks
- Grid-style table
- Professional spacing

---

### Template Implementation

#### Selection Flow
1. User selects template in CreateInvoice/EditInvoice
2. Optional: Check "Set as default template"
3. Template preference saved to user profile
4. InvoiceDetail loads invoice's selected template
5. PDF generated using appropriate template function

#### Code Structure
```javascript
// InvoiceDetail.jsx
const generatePDF = () => {
  const template = invoice.template || 'classic';
  
  switch(template) {
    case 'modern':
      generateModernPDF();
      break;
    case 'elegant':
      generateElegantPDF();
      break;
    default:
      generateClassicPDF();
  }
};
```

#### PDF Generation Process
```javascript
const generateClassicPDF = () => {
  const doc = new jsPDF();
  
  // 1. Header Section
  doc.setFontSize(24);
  doc.text('INVOICE', 20, 20);
  
  // 2. Invoice Details
  doc.setFontSize(10);
  doc.text(`Invoice #: ${invoice.invoiceNumber}`, 20, 35);
  doc.text(`Date: ${formatDate(invoice.date)}`, 20, 42);
  
  // 3. Client Information
  doc.text(`Bill To: ${invoice.clientName}`, 20, 65);
  
  // 4. Line Items Table
  doc.autoTable({
    startY: 105,
    head: [['Description', 'Qty', 'Price', 'Total']],
    body: invoice.items.map(item => [
      item.description,
      item.quantity,
      `$${item.price.toFixed(2)}`,
      `$${(item.quantity * item.price).toFixed(2)}`
    ]),
    theme: 'striped'
  });
  
  // 5. Totals
  const finalY = doc.lastAutoTable.finalY + 10;
  doc.text(`Total: $${invoice.total.toFixed(2)}`, 140, finalY);
  
  // 6. Notes
  if (invoice.notes) {
    doc.text('Notes:', 20, finalY + 20);
    doc.text(invoice.notes, 20, finalY + 27);
  }
  
  // 7. Save PDF
  doc.save(`Invoice-${invoice.invoiceNumber}.pdf`);
};
```

### Adding Custom Templates

To add a new template:

1. **Create Template Function:**
```javascript
const generateCustomPDF = () => {
  const doc = new jsPDF();
  // Your custom design
  doc.save(`Invoice-${invoice.invoiceNumber}.pdf`);
};
```

2. **Add to Template Selector:**
```jsx
<option value="custom">Custom - Your Description</option>
```

3. **Update Router:**
```javascript
case 'custom':
  generateCustomPDF();
  break;
```

4. **Update User Model:**
```javascript
defaultTemplate: {
  type: String,
  enum: ['classic', 'modern', 'elegant', 'custom'],
  default: 'classic'
}
```

---

## 🔒 Authentication & Security

### Authentication Flow

#### Registration
```
1. User submits registration form
2. Backend validates input data
3. Password hashed using bcrypt (10 salt rounds)
4. User document created in MongoDB
5. JWT token generated with user ID
6. Token returned to client
7. Token stored in localStorage
8. User redirected to dashboard
```

#### Login
```
1. User submits email and password
2. Backend finds user by email
3. Password compared with hashed password
4. If valid, JWT token generated
5. Token returned to client
6. Token stored in localStorage
7. User redirected to dashboard
```

#### Authorization
```
1. Client includes token in request header:
   Authorization: Bearer <token>
2. Auth middleware extracts and verifies token
3. If valid, user ID added to request object
4. Route handler accesses user ID
5. If invalid, 401 Unauthorized returned
```

### Security Implementations

#### Password Security
```javascript
// Hashing (registration)
const salt = await bcrypt.genSalt(10);
const hashedPassword = await bcrypt.hash(password, salt);

// Verification (login)
const isMatch = await bcrypt.compare(password, user.password);
```

#### JWT Configuration
```javascript
// Token Generation
const token = jwt.sign(
  { userId: user._id },
  process.env.JWT_SECRET,
  { expiresIn: '7d' }
);

// Token Verification (middleware)
const decoded = jwt.verify(token, process.env.JWT_SECRET);
req.userId = decoded.userId;
```

#### Security Middleware

**Helmet.js** - HTTP Header Security
```javascript
app.use(helmet());
// Sets secure HTTP headers
```

**CORS** - Cross-Origin Resource Sharing
```javascript
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true
}));
```

**Rate Limiting** - Brute Force Protection
```javascript
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api/', limiter);
```

### Best Practices

#### Frontend Security
- ✅ No sensitive data in localStorage (only JWT token)
- ✅ Token cleared on logout
- ✅ Protected routes redirect to login
- ✅ Form validation before API calls
- ✅ HTTPS in production
- ✅ XSS prevention (React escapes by default)

#### Backend Security
- ✅ Environment variables for secrets
- ✅ Password hashing (never plain text)
- ✅ JWT token expiration
- ✅ Input validation and sanitization
- ✅ MongoDB injection prevention
- ✅ Rate limiting
- ✅ Security headers (Helmet)
- ✅ CORS configuration

### Security Checklist

- [ ] Strong JWT secret (minimum 32 characters)
- [ ] Environment variables not in repository
- [ ] HTTPS enabled in production
- [ ] Password minimum length enforced (6 characters)
- [ ] Rate limiting configured
- [ ] CORS restricted to specific domains
- [ ] Security headers set (Helmet)
- [ ] MongoDB connection string secured
- [ ] Error messages don't leak sensitive info
- [ ] Logs don't contain passwords or tokens

---

## 🚀 Deployment

### Pre-Deployment Checklist

#### Code Quality
- [ ] All features tested locally
- [ ] No console errors
- [ ] No ESLint warnings
- [ ] Code formatted consistently
- [ ] Comments added where necessary

#### Security
- [ ] Environment variables configured
- [ ] JWT_SECRET is strong and random
- [ ] No hardcoded secrets in code
- [ ] .env files in .gitignore
- [ ] CORS configured for production domain

#### Database
- [ ] MongoDB Atlas cluster created
- [ ] Database user with appropriate permissions
- [ ] Connection string tested
- [ ] IP whitelist configured

---

### Backend Deployment (Render)

#### Step 1: Prepare Repository
```bash
git add .
git commit -m "Prepare for deployment"
git push origin main
```

#### Step 2: Create Web Service on Render

1. Go to [render.com](https://render.com)
2. Click "New +" → "Web Service"
3. Connect GitHub repository
4. Configure service:

```
Name: miniinvoice-api
Environment: Node
Region: Frankfurt (or closest to target users)
Branch: main
Root Directory: backend
Build Command: npm install
Start Command: npm start
Instance Type: Free
```

#### Step 3: Environment Variables

Add in Render dashboard:
```env
PORT=5000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/miniinvoice
JWT_SECRET=your_super_secret_64_character_random_string_here
NODE_ENV=production
```

#### Step 4: Deploy

- Click "Create Web Service"
- Wait for build (5-10 minutes)
- Copy backend URL: `https://miniinvoice-api.onrender.com`

#### Step 5: Verify Deployment

Test health endpoint:
```bash
curl https://your-backend-url.onrender.com/api/health
# Should return: {"status":"OK"}
```

---

### Frontend Deployment (Vercel)

#### Step 1: Install Vercel CLI (Optional)

```bash
npm install -g vercel
```

#### Step 2: Deploy via Vercel Dashboard

1. Go to [vercel.com](https://vercel.com)
2. Click "Add New" → "Project"
3. Import GitHub repository
4. Configure project:

```
Framework Preset: Vite
Root Directory: frontend
Build Command: npm run build
Output Directory: dist
Install Command: npm install
Node Version: 18.x
```

#### Step 3: Environment Variables

Add in Vercel dashboard:
```env
VITE_API_URL=https://your-backend-url.onrender.com
```

#### Step 4: Deploy

- Click "Deploy"
- Wait for build (2-5 minutes)
- Copy frontend URL: `https://miniinvoice.vercel.app`

#### Step 5: Update Backend CORS

In `backend/server.js`, update CORS origin:
```javascript
app.use(cors({
  origin: 'https://miniinvoice.vercel.app',
  credentials: true
}));
```

Commit and push to trigger Render redeployment.

---

### MongoDB Atlas Configuration

#### Network Access
1. Go to MongoDB Atlas dashboard
2. Navigate to "Network Access"
3. Click "Add IP Address"
4. Select "Allow Access from Anywhere" (0.0.0.0/0)
5. Click "Confirm"

#### Database User
1. Navigate to "Database Access"
2. Ensure user has "Read and write to any database" permissions
3. Note username and password for connection string

---

### Post-Deployment Testing

#### Functional Tests
```
✓ User registration works
✓ User login works
✓ Dashboard loads with correct data
✓ Create invoice works
✓ Edit invoice works
✓ Delete invoice works
✓ PDF download works (all 3 templates)
✓ Profile update works
✓ Password change works
✓ Logout works
```

#### Performance Tests
```
✓ Page load time < 3 seconds
✓ API response time < 1 second
✓ No console errors in browser
✓ No warnings in Render logs
```

#### Mobile Tests
```
✓ Responsive on iPhone (375px)
✓ Responsive on iPad (768px)
✓ All buttons tappable
✓ Forms usable on mobile
✓ PDFs download on mobile browsers
```

#### Browser Tests
```
✓ Chrome (desktop & mobile)
✓ Safari (desktop & mobile)
✓ Firefox
✓ Edge
```

---

### Continuous Deployment

Both Vercel and Render support automatic deployment:

```bash
# Make changes
git add .
git commit -m "Update feature X"
git push origin main

# Auto-deployment triggered:
# - Vercel rebuilds frontend (2-5 mins)
# - Render rebuilds backend (5-10 mins)
```

### Rollback Strategy

If deployment issues occur:

**Vercel:**
1. Go to Deployments tab
2. Find last working deployment
3. Click "..." → "Promote to Production"

**Render:**
1. Go to "Manual Deploy" tab
2. Find last working commit
3. Click "Deploy"

---

### Custom Domain (Optional)

#### Frontend (Vercel)
1. Purchase domain (e.g., miniinvoice.app)
2. In Vercel: Settings → Domains
3. Add custom domain
4. Update DNS records as instructed
5. SSL certificate auto-configured

#### Backend (Render)
1. In Render: Settings → Custom Domain
2. Add custom domain (e.g., api.miniinvoice.app)
3. Update DNS records
4. Update frontend VITE_API_URL

---

## 🧪 Testing

### Manual Testing Checklist

#### Authentication
- [ ] Register with new email works
- [ ] Register with existing email fails gracefully
- [ ] Login with correct credentials works
- [ ] Login with incorrect credentials shows error
- [ ] Password change requires current password
- [ ] Logout clears token and redirects

#### Invoice Management
- [ ] Create invoice with valid data works
- [ ] Edit invoice updates all fields
- [ ] Delete invoice with confirmation works
- [ ] Duplicate invoice creates copy
- [ ] Toggle status changes paid/unpaid
- [ ] Filter by status works correctly

#### PDF Generation
- [ ] Classic template generates correctly
- [ ] Modern template generates correctly
- [ ] Elegant template generates correctly
- [ ] PDF includes all invoice data
- [ ] Calculations are accurate
- [ ] Notes appear in PDF

#### Mobile Responsiveness
- [ ] All pages render correctly on mobile
- [ ] Forms are usable on touchscreens
- [ ] Buttons are easily tappable
- [ ] No horizontal scrolling
- [ ] Cards display properly on Dashboard
- [ ] PDF downloads work on mobile browsers

#### Profile & Settings
- [ ] Profile updates save correctly
- [ ] Email cannot be changed
- [ ] Password change validates correctly
- [ ] Default template preference saves
- [ ] Account deletion works with confirmation

### Test User Accounts

Create test accounts for different scenarios:

```
Test User 1: Basic User
Email: test@example.com
Password: test123456
Purpose: General functionality testing

Test User 2: Power User
Email: power@example.com
Password: power123456
Purpose: Multiple invoices, all templates

Test User 3: Mobile User
Email: mobile@example.com
Password: mobile123456
Purpose: Mobile-specific testing
```

### Load Testing (Optional)

For production readiness:

```bash
# Install Apache Bench
sudo apt-get install apache2-utils

# Test API endpoint
ab -n 1000 -c 10 https://your-backend-url.onrender.com/api/invoices

# Results:
# - Requests per second
# - Time per request
# - Failed requests
```

---

## 🐛 Troubleshooting

### Common Issues

#### Issue: "Network Error" when calling API

**Symptoms:**
- Frontend can't reach backend
- Console shows CORS or network errors

**Solutions:**
```javascript
// 1. Check VITE_API_URL
console.log(import.meta.env.VITE_API_URL);
// Should match your backend URL

// 2. Verify backend CORS settings
// backend/server.js
app.use(cors({
  origin: 'https://your-frontend-url.vercel.app',
  credentials: true
}));

// 3. Check backend is running
curl https://your-backend-url.onrender.com/api/health
```

---

#### Issue: "Token expired" or "Unauthorized"

**Symptoms:**
- User gets logged out unexpectedly
- API returns 401 errors

**Solutions:**
```javascript
// 1. Check token in localStorage
console.log(localStorage.getItem('token'));

// 2. Verify JWT_SECRET is same in all environments

// 3. Clear localStorage and re-login
localStorage.clear();
window.location.href = '/login';

// 4. Check token expiration (backend)
// Increase if needed:
jwt.sign(payload, secret, { expiresIn: '30d' });
```

---

#### Issue: MongoDB connection fails

**Symptoms:**
- Backend crashes on startup
- "MongoNetworkError" in logs

**Solutions:**
```javascript
// 1. Verify connection string format
mongodb+srv://username:password@cluster.mongodb.net/miniinvoice

// 2. Check MongoDB Atlas IP whitelist
// Add 0.0.0.0/0 for development

// 3. Verify database user permissions
// User needs "Read and write to any database"

// 4. Test connection string
// backend/test-connection.js
const mongoose = require('mongoose');
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected!'))
  .catch(err => console.error('Error:', err));
```

---

#### Issue: PDF doesn't download on mobile

**Symptoms:**
- PDF generation works on desktop
- Fails or opens in new tab on mobile

**Solutions:**
```javascript
// 1. Check jsPDF version
// Use latest version: npm install jspdf@latest

// 2. Test on different mobile browsers
// Safari, Chrome, Firefox mobile

// 3. Alternative: Use blob and link
const blob = doc.output('blob');
const url = URL.createObjectURL(blob);
const link = document.createElement('a');
link.href = url;
link.download = `Invoice-${invoiceNumber}.pdf`;
link.click();
```

---

#### Issue: Layout breaks on mobile

**Symptoms:**
- Content overflows screen
- Elements not responsive
- Horizontal scrolling

**Solutions:**
```jsx
// 1. Check responsive classes
// Before:
className="text-base"
// After:
className="text-sm sm:text-base"

// 2. Verify container widths
// Before:
className="w-auto"
// After:
className="w-full sm:w-auto"

// 3. Test in Chrome DevTools
// F12 → Toggle Device Toolbar (Ctrl+Shift+M)

// 4. Check fixed widths
// Avoid: style={{width: '500px'}}
// Use: className="w-full max-w-lg"
```

---

#### Issue: Environment variables not loading

**Symptoms:**
- undefined values in code
- Build fails with missing env vars

**Solutions:**
```javascript
// Frontend (.env in root of frontend/)
VITE_API_URL=http://localhost:5000

// Check loading:
console.log(import.meta.env.VITE_API_URL);

// Backend (.env in root of backend/)
PORT=5000
MONGODB_URI=...
JWT_SECRET=...

// Check loading:
console.log(process.env.PORT);

// Production:
// Set in Vercel/Render dashboard
// Must start with VITE_ for frontend
```

---

#### Issue: Render service sleeps/slow first request

**Symptoms:**
- First API request takes 30+ seconds
- Service spins down after inactivity

**Solution:**
```
Free Render instances spin down after 15 mins of inactivity.
First request "wakes" the service (15-30 seconds).

Solutions:
1. Upgrade to paid plan ($7/month)
2. Implement keepalive ping
3. Use external monitoring (UptimeRobot)
4. Expect ~30s delay on first request
```

---

#### Issue: Build fails on Vercel/Render

**Symptoms:**
- Deployment fails
- Build logs show errors

**Solutions:**
```bash
# 1. Test build locally
cd frontend
npm run build
# Check for errors

cd ../backend
npm start
# Check for errors

# 2. Check Node version
# Vercel: Set in dashboard (Node 18.x)
# Render: Set in dashboard (Node 18.x)

# 3. Verify package.json scripts
{
  "scripts": {
    "build": "vite build",  // Frontend
    "start": "node server.js"  // Backend
  }
}

# 4. Check dependencies are in package.json
npm install  // Reinstall to verify
```

---

### Debug Mode

Enable detailed logging:

**Backend:**
```javascript
// server.js
if (process.env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`);
    next();
  });
}
```

**Frontend:**
```javascript
// Add to components
console.log('Component mounted');
console.log('State:', state);
console.log('Props:', props);
```

---

### Getting Help

1. **Check documentation first**
2. **Review error messages carefully**
3. **Test in isolation**
4. **Check browser console**
5. **Check server logs**
6. **Search GitHub issues**
7. **Ask in developer communities**

---

## 🤝 Contributing

### Development Workflow

1. **Fork the repository**
```bash
git clone https://github.com/yourusername/miniinvoice.git
cd miniinvoice
```

2. **Create feature branch**
```bash
git checkout -b feature/your-feature-name
```

3. **Make changes**
```bash
# Make your changes
# Test thoroughly
```

4. **Commit with descriptive messages**
```bash
git add .
git commit -m "Add: Feature description"
```

**Commit Message Format:**
```
Type: Short description

Detailed description if needed

- Bullet points for specifics
- Another bullet point

Fixes #issue-number
```

**Types:**
- `Add:` New feature
- `Fix:` Bug fix
- `Update:` Modify existing feature
- `Remove:` Delete feature/code
- `Refactor:` Code restructuring
- `Docs:` Documentation changes
- `Style:` Formatting changes
- `Test:` Add/modify tests

5. **Push to your fork**
```bash
git push origin feature/your-feature-name
```

6. **Create Pull Request**
- Go to original repository
- Click "New Pull Request"
- Select your branch
- Describe changes clearly

### Code Style Guidelines

#### JavaScript/React
```javascript
// Use functional components
const Component = () => {
  const [state, setState] = useState(initial);
  
  return (
    <div className="container">
      {/* JSX here */}
    </div>
  );
};

// Descriptive variable names
const userInvoices = [];  // Good
const arr = [];           // Bad

// Comments for complex logic
// Calculate tax based on subtotal and rate
const tax = subtotal * (taxRate / 100);

// Consistent formatting
// Use Prettier with default settings
```

#### CSS/Tailwind
```jsx
// Use Tailwind utility classes
className="flex items-center justify-between p-4"

// Responsive design
className="text-sm sm:text-base lg:text-lg"

// Avoid inline styles
// Bad: style={{color: 'red'}}
// Good: className="text-red-600"
```

### Areas for Contribution

#### High Priority
- [ ] Unit tests (Jest, React Testing Library)
- [ ] E2E tests (Cypress)
- [ ] More PDF templates
- [ ] Export to Excel/CSV
- [ ] Email invoice to clients
- [ ] Recurring invoices
- [ ] Payment tracking

#### Medium Priority
- [ ] Dark mode
- [ ] Multi-language support (i18n)
- [ ] Invoice analytics/reports
- [ ] Client management
- [ ] Expense tracking
- [ ] Time tracking integration

#### Nice to Have
- [ ] Mobile app (React Native)
- [ ] Invoice reminders
- [ ] Payment gateway integration
- [ ] Team collaboration
- [ ] Invoice templates customization
- [ ] Bulk operations

---

## 📄 License

MIT License

Copyright (c) 2024 MiniInvoice

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

---

## 📞 Support

### Documentation
- **Full Documentation**: See sections above
- **API Reference**: [API Reference](#api-reference)
- **Troubleshooting**: [Troubleshooting](#troubleshooting)

### Contact
- **Email**: support@miniinvoice.com
- **GitHub Issues**: [Report a bug](https://github.com/yourusername/miniinvoice/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/miniinvoice/discussions)

### Community
- **Discord**: [Join our Discord](https://discord.gg/miniinvoice)
- **Twitter**: [@miniinvoice](https://twitter.com/miniinvoice)
- **Blog**: [blog.miniinvoice.com](https://blog.miniinvoice.com)

---

## 🎉 Acknowledgments

### Technologies
- React team for the amazing framework
- Tailwind CSS for the utility-first CSS approach
- MongoDB team for the flexible database
- Vercel and Render for free hosting tiers

### Inspiration
Built to solve real problems faced by freelancers in African markets, particularly:
- Rwanda
- Kenya
- Nigeria
- Ghana
- South Africa

### Contributors
Thank you to all contributors who help make MiniInvoice better!

---

## 🗺 Roadmap

### Q1 2025
- [ ] Payment integration (Stripe, Flutterwave)
- [ ] Email invoice functionality
- [ ] Client management module
- [ ] Enhanced analytics

### Q2 2025
- [ ] Mobile app (React Native)
- [ ] Recurring invoices
- [ ] Expense tracking
- [ ] Multi-currency support

### Q3 2025
- [ ] Team collaboration
- [ ] Advanced reporting
- [ ] API for third-party integrations
- [ ] White-label solution

### Q4 2025
- [ ] Accounting software integration
- [ ] Tax compliance features
- [ ] Enterprise features
- [ ] Mobile money integration

---

## 📊 Project Status

| Metric | Status |
|--------|--------|
| **Version** | 1.0.0 |
| **Status** | Production Ready |
| **Features** | 100% Complete (10/10) |
| **Documentation** | Comprehensive |
| **Test Coverage** | Manual Testing Complete |
| **Mobile Support** | Full Support |
| **Browser Support** | Chrome, Safari, Firefox, Edge |
| **License** | MIT |

---

## 🌟 Star History

If you find MiniInvoice useful, please consider giving it a star on GitHub!

```
⭐ Star this repository to show your support!
```

---

<div align="center">

**Built with ❤️ for freelancers everywhere**

[Live Demo](#) • [Documentation](#) • [Report Bug](#) • [Request Feature](#)

**Version 1.0.0** • **Last Updated: November 2024**

</div>