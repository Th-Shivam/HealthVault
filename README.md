# 🏥 HealthVault

> **Your Secure Digital Health Locker** - Manage, share, and control access to your medical records with ease.

![React](https://img.shields.io/badge/React-19.2.0-61DAFB?logo=react&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-7.2.4-646CFF?logo=vite&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-2.84.0-3ECF8E?logo=supabase&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4.18-38B2AC?logo=tailwind-css&logoColor=white)
![Vercel](https://img.shields.io/badge/Deployed_on-Vercel-000000?logo=vercel&logoColor=white)

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Architecture](#-architecture)
- [Getting Started](#-getting-started)
- [Environment Setup](#-environment-setup)
- [Database Setup](#-database-setup)
- [API Documentation](#-api-documentation)
- [Deployment](#-deployment)
- [Security](#-security)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🌟 Overview

**HealthVault** is a modern, secure digital health records management system that empowers patients to:
- Upload and store medical documents securely
- Share records with healthcare providers via OTP or QR code
- Control and revoke access to their medical data
- Track who accessed their records and when

Built with privacy and security at its core, HealthVault uses end-to-end encryption, temporary access tokens, and granular access controls to ensure your medical data remains strictly under your control.

---

## ✨ Features

### 👤 **Patient Features**
- 🔐 **Secure Authentication** - Email/password login with Supabase Auth
- 📤 **Upload Medical Records** - Support for PDFs, images (JPG, PNG)
- 🔗 **Flexible Sharing Options**:
  - **OTP-based sharing** - Generate 6-digit codes for doctors
  - **QR code sharing** - Instant access via QR scan
- 🕒 **Time-limited Access** - All shared access expires automatically
- ❌ **Revoke Access** - Instantly revoke doctor access at any time
- 📊 **Access Logs** - View who accessed your records and when
- 🗑️ **Delete Records** - Permanently remove records from the system

### 👨‍⚕️ **Doctor Features**
- 🔓 **Quick Access** - Verify via OTP or QR code scan
- 📱 **Mobile-Friendly** - QR scanner works on mobile devices
- 📄 **View & Download** - Access shared medical records
- ⏱️ **Session Management** - Secure, time-limited access tokens
- 📖 **Read-Only Access** - View records without modification rights

### 🔒 **Security Features**
- 🛡️ **Row-Level Security (RLS)** - Database-level access control
- 🔑 **JWT Authentication** - Secure token-based authentication
- 🔐 **Encrypted Storage** - Files stored in Supabase secure storage
- 📝 **Access Logging** - Complete audit trail of all record access
- ⏲️ **Token Expiration** - Auto-expiring access grants (15 minutes for doctors)
- 🚫 **No Data Leakage** - Signed URLs expire after 1 hour

---

## 🛠️ Tech Stack

### **Frontend**
- **React 19.2** - Modern React with Hooks
- **Vite 7.2** - Lightning-fast build tool
- **React Router 7.9** - Client-side routing
- **Tailwind CSS 3.4** - Utility-first CSS framework
- **React Hot Toast** - Beautiful toast notifications
- **React QR Reader** - QR code scanning
- **React QR Code** - QR code generation

### **Backend**
- **Vercel Serverless Functions** - API routes
- **Supabase** - Backend-as-a-Service
  - PostgreSQL database
  - Authentication
  - File storage
  - Row-Level Security (RLS)
- **JWT** - JSON Web Tokens for doctor sessions

### **DevOps**
- **Vercel** - Hosting & CI/CD
- **GitHub** - Version control
- **ESLint** - Code linting

---

## 🏗️ Architecture

### **High-Level Architecture**

```
┌─────────────────────────────────────────────────────────────┐
│                      Client (React SPA)                      │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │  Login   │  │Dashboard │  │  Share   │  │  Doctor  │   │
│  │  Signup  │  │  Upload  │  │  Record  │  │  Portal  │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│              Vercel Serverless API Routes                    │
│  /api/upload-record    /api/generate-otp                    │
│  /api/get-records      /api/generate-qr                     │
│  /api/verify-otp       /api/verify-qr                       │
│  /api/revoke-access    /api/log-access                      │
│  /api/delete-record    /api/signed-url                      │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                   Supabase Backend                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │  PostgreSQL  │  │     Auth     │  │   Storage    │     │
│  │   Database   │  │   (Users)    │  │   (Files)    │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│  Tables: records, grants, access_logs                       │
└─────────────────────────────────────────────────────────────┘
```

### **Database Schema**

```sql
-- Records table
records (
  id          UUID PRIMARY KEY,
  patient_id  UUID REFERENCES auth.users(id),
  title       TEXT,
  description TEXT,
  file_url    TEXT,
  uploaded_at TIMESTAMP
)

-- Access grants table
grants (
  id           UUID PRIMARY KEY,
  patient_id   UUID REFERENCES auth.users(id),
  doctor_email TEXT,
  otp_hash     TEXT,
  qr_token     TEXT,
  expires_at   TIMESTAMP,
  is_active    BOOLEAN,
  records      JSONB,
  created_at   TIMESTAMP
)

-- Access logs table
access_logs (
  id          UUID PRIMARY KEY,
  grant_id    UUID REFERENCES grants(id),
  doctor_id   TEXT,
  record_id   UUID REFERENCES records(id),
  accessed_at TIMESTAMP
)
```

---

## 🚀 Getting Started

### **Prerequisites**
- Node.js 18+ and npm
- Supabase account ([supabase.com](https://supabase.com))
- Vercel account (for deployment)

### **Installation**

1. **Clone the repository**
```bash
git clone https://github.com/Th-Shivam/HealthVault.git
cd HealthVault
```

2. **Install dependencies**
```bash
npm install --legacy-peer-deps
```

3. **Set up environment variables**

Create a `.env` file in the root directory:

```env
# Frontend (Vite)
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Backend (Serverless functions)
SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

4. **Set up Supabase database**

Run the SQL commands in `supabase_setup.sql`:
```bash
# Copy the contents of supabase_setup.sql
# Paste and execute in Supabase SQL Editor
```

5. **Run development server**
```bash
# For frontend only
npm run dev

# For full-stack (API routes + frontend)
npx vercel dev
```

6. **Access the application**
```
http://localhost:3000
```

---

## 🔧 Environment Setup

### **Supabase Configuration**

1. Create a new project at [supabase.com](https://supabase.com)
2. Navigate to **Settings** → **API**
3. Copy the following values:
   - **Project URL** → `VITE_SUPABASE_URL` and `SUPABASE_URL`
   - **Anon/Public Key** → `VITE_SUPABASE_ANON_KEY`
   - **Service Role Key** → `SUPABASE_SERVICE_ROLE_KEY` ⚠️ (Keep this secret!)

### **Storage Bucket Setup**

1. Go to **Storage** in Supabase dashboard
2. Create a new bucket named `medical-records`
3. Set it to **Public** (for now) or configure RLS policies
4. Note: For production, use private buckets with signed URLs

---

## 💾 Database Setup

Execute the following SQL in your Supabase SQL Editor:

```bash
# Run the complete setup script
cat supabase_setup.sql | supabase db reset
```

This creates:
- ✅ `records` table with RLS policies
- ✅ `grants` table with RLS policies
- ✅ `access_logs` table with RLS policies
- ✅ `medical-records` storage bucket
- ✅ Storage policies for authenticated uploads

---

## 📡 API Documentation

### **Patient APIs**

#### `POST /api/upload-record`
Upload a medical record.

**Request:**
```json
{
  "patient_id": "uuid",
  "title": "Blood Test Report",
  "description": "Annual checkup",
  "file": "base64_encoded_file",
  "file_name": "report.pdf"
}
```

**Response:**
```json
{
  "success": true,
  "record_id": "uuid"
}
```

#### `POST /api/generate-otp`
Generate OTP for sharing records.

**Request:**
```json
{
  "patient_id": "uuid",
  "doctor_email": "doctor@example.com",
  "record_ids": ["uuid1", "uuid2"]
}
```

**Response:**
```json
{
  "success": true,
  "otp": "123456"
}
```

#### `POST /api/generate-qr`
Generate QR code token for sharing.

**Request:**
```json
{
  "patient_id": "uuid",
  "record_ids": ["uuid1", "uuid2"]
}
```

**Response:**
```json
{
  "success": true,
  "qr_token": "signed_token_string"
}
```

#### `POST /api/revoke-access`
Revoke doctor access to records.

**Request:**
```json
{
  "grant_id": "uuid"
}
```

**Response:**
```json
{
  "success": true
}
```

#### `POST /api/delete-record`
Delete a medical record (requires auth).

**Headers:**
```
Authorization: Bearer <supabase_access_token>
```

**Request:**
```json
{
  "record_id": "uuid",
  "file_path": "path/to/file",
  "patient_id": "uuid"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Record deleted successfully"
}
```

### **Doctor APIs**

#### `POST /api/verify-otp`
Verify OTP and get access token.

**Request:**
```json
{
  "doctor_email": "doctor@example.com",
  "otp": "123456"
}
```

**Response:**
```json
{
  "success": true,
  "token": "jwt_access_token"
}
```

#### `POST /api/verify-qr`
Verify QR token and get access.

**Request:**
```json
{
  "qr_token": "signed_token_string"
}
```

**Response:**
```json
{
  "success": true,
  "token": "jwt_access_token"
}
```

#### `POST /api/get-records`
Get shared medical records (requires doctor JWT).

**Headers:**
```
Authorization: Bearer <doctor_jwt_token>
```

**Response:**
```json
{
  "success": true,
  "records": [
    {
      "id": "uuid",
      "title": "Blood Test",
      "description": "Annual checkup",
      "file_url": "original_url",
      "signed_url": "signed_url_with_token",
      "uploaded_at": "2024-01-01T00:00:00Z"
    }
  ],
  "grant_id": "uuid",
  "doctor_email": "doctor@example.com"
}
```

#### `POST /api/log-access`
Log when a doctor views a record.

**Request:**
```json
{
  "grant_id": "uuid",
  "doctor_id": "doctor@example.com",
  "record_id": "uuid"
}
```

**Response:**
```json
{
  "success": true
}
```

---

## 🌐 Deployment

### **Deploy to Vercel**

1. **Install Vercel CLI**
```bash
npm install -g vercel
```

2. **Link your project**
```bash
vercel link
```

3. **Set environment variables in Vercel**
   - Go to your project settings on [vercel.com](https://vercel.com)
   - Add all environment variables from `.env`

4. **Deploy**
```bash
git push origin main
# Vercel auto-deploys on push
```

### **Build Configuration**

The project uses the following build settings:
- **Framework**: Vite
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install --legacy-peer-deps`

---

## 🔒 Security

### **Best Practices Implemented**

✅ **Authentication & Authorization**
- Supabase Auth for patient login
- JWT tokens for doctor sessions
- Row-Level Security (RLS) on all tables

✅ **Data Protection**
- Encrypted file storage
- Signed URLs with expiration
- OTP hashing (SHA-256)
- HMAC-signed QR tokens

✅ **Access Control**
- Temporary access grants (15 min for doctors)
- Manual revocation capability
- Audit logging for all access

✅ **API Security**
- CORS headers configured
- Input validation
- Error handling without data leakage

### **Security Considerations**

⚠️ **For Production**
1. Use a dedicated JWT secret (not Supabase service key)
2. Set storage bucket to private
3. Implement rate limiting
4. Add CAPTCHA to signup/login
5. Enable MFA for patient accounts
6. Regular security audits

---

## 🤝 Contributing

Contributions are welcome! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### **Development Guidelines**

- Follow existing code style
- Write meaningful commit messages
- Add comments for complex logic
- Test your changes thoroughly
- Update documentation as needed

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

## 👥 Authors

- **Shivam** - [@Th-Shivam](https://github.com/Th-Shivam)

---

## 🙏 Acknowledgments

- [Supabase](https://supabase.com) - Backend infrastructure
- [Vercel](https://vercel.com) - Hosting platform
- [Tailwind CSS](https://tailwindcss.com) - UI framework
- [React](https://react.dev) - Frontend framework

---

## 📧 Support

For support, email support@healthvault.com or open an issue on GitHub.

---

<div align="center">

**Made with ❤️ for better healthcare**

[Report Bug](https://github.com/Th-Shivam/HealthVault/issues) · [Request Feature](https://github.com/Th-Shivam/HealthVault/issues)

</div>
