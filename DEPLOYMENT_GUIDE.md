# 🚀 Deployment Guide - HealthVault

## 🔧 Fixing Email Verification Redirect Issue

### Problem
Email verification links were redirecting to `localhost:3000` instead of production URL.

### Solution

#### 1️⃣ **Supabase Dashboard Configuration** (CRITICAL!)

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your **HealthVault** project
3. Navigate to **Settings** → **Authentication**
4. Update **URL Configuration**:

   **Site URL:**
   ```
   https://your-production-url.vercel.app
   ```

   **Redirect URLs (Add both):**
   ```
   https://your-production-url.vercel.app/**
   http://localhost:3000/**
   ```

   > ⚠️ **Important:** Replace `your-production-url.vercel.app` with your actual Vercel deployment URL

5. Click **Save** at the bottom

#### 2️⃣ **Code Configuration** (Already Fixed ✅)

The `SignupPage.jsx` now includes:
```javascript
emailRedirectTo: window.location.origin
```

This automatically uses:
- `https://your-site.vercel.app` in production
- `http://localhost:3000` during development

---

## 🌐 Vercel Deployment Checklist

### Environment Variables to Set in Vercel

Go to **Vercel Dashboard** → **Your Project** → **Settings** → **Environment Variables**

Add these variables:

| Variable Name | Value | Environment |
|--------------|-------|-------------|
| `VITE_SUPABASE_URL` | Your Supabase project URL | Production, Preview, Development |
| `VITE_SUPABASE_ANON_KEY` | Your Supabase anon key | Production, Preview, Development |
| `SUPABASE_URL` | Your Supabase project URL | Production, Preview, Development |
| `SUPABASE_SERVICE_ROLE_KEY` | Your Supabase service role key | Production, Preview, Development |
| `SENDGRID_API_KEY` | Your SendGrid API key | Production, Preview, Development |

### Build Settings

- **Framework Preset:** Vite
- **Build Command:** `npm run build`
- **Output Directory:** `dist`
- **Install Command:** `npm install --legacy-peer-deps`

---

## 📧 SendGrid Email Configuration

1. Go to [SendGrid Dashboard](https://app.sendgrid.com)
2. Navigate to **Settings** → **Sender Authentication**
3. Verify your sender email address
4. Update `api/services/email-service.js` with your verified email:
   ```javascript
   from: 'your-verified-email@yourdomain.com'
   ```

---

## 🔒 Security Checklist

- [ ] All environment variables added to Vercel
- [ ] Supabase Site URL updated to production URL
- [ ] Redirect URLs configured in Supabase
- [ ] SendGrid sender email verified
- [ ] Service role key kept secret (never commit to GitHub)
- [ ] `.env` file added to `.gitignore`

---

## 🔧 Email Verification Configuration

### Auth Callback Route

The app includes an `/auth/callback` route that handles email verification:
- Extracts tokens from URL hash parameters
- Establishes user session automatically
- Redirects to dashboard on success
- Shows error and redirects to login on failure

**Important:** Make sure your Supabase redirect URLs include the `/auth/callback` path.

---

## 🧪 Testing After Deployment

1. **Signup Flow:**
   - Sign up with a new email
   - Check inbox for verification email
   - Click the verification link
   - Should redirect to production site (not localhost)
   - Confirm account is verified

2. **Doctor Access Flow:**
   - Login as patient
   - Upload a medical record
   - Generate OTP/QR code
   - Test doctor access
   - Verify email notifications work

3. **Record Operations:**
   - Upload records
   - Share records
   - Revoke access
   - Delete records

---

## 🐛 Common Issues & Fixes

### Issue: Email links still going to localhost

**Fix:**
1. Clear your browser cache
2. Check Supabase dashboard Site URL is set correctly
3. Redeploy your Vercel app
4. Try signup with a fresh email address

### Issue: "Invalid redirect URL" error

**Fix:**
1. Add your production URL to **Redirect URLs** in Supabase
2. Make sure to include `/**` at the end
3. Save and wait 1-2 minutes for propagation

### Issue: Emails not sending

**Fix:**
1. Verify SendGrid API key is in Vercel environment variables
2. Check sender email is verified in SendGrid
3. Check SendGrid dashboard for error logs

---

## 📱 Production URL

Remember to update this URL everywhere after deployment:

- Supabase Site URL
- Supabase Redirect URLs
- README.md mentions
- Any hardcoded URLs in code

---

**Made with ❤️ for better healthcare**
