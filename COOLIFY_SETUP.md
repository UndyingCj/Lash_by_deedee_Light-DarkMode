# Quick Coolify Deployment Setup

## 🚀 Deploy to Coolify from GitHub

### Step 1: Create Application in Coolify
1. Go to your Coolify dashboard
2. Click **"New Resource"** → **"Application"**
3. Select **"Public Repository"** 
4. Enter your GitHub repository URL
5. Select branch: `main` or `master`
6. Build pack will auto-detect as **Node.js**

### Step 2: Set Environment Variables
Copy these variables to Coolify → Your App → **Environment Variables**:

```bash
# 🔐 ADMIN ACCESS (CHANGE THESE!)
ADMIN_USERNAME=your-admin-username
ADMIN_PASSWORD=your-secure-password
JWT_SECRET=your-64-character-jwt-secret-key-here

# 🗄️ DATABASE (from Supabase)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# 💳 PAYMENTS (from Paystack)
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=pk_live_your-live-public-key
PAYSTACK_SECRET_KEY=sk_live_your-live-secret-key

# 📧 EMAIL (from Zoho Mail)
ZOHO_EMAIL_USER=admin@yourdomain.com
ZOHO_EMAIL_PASSWORD=your-zoho-app-password

# 🌐 SITE CONFIG
NEXT_PUBLIC_SITE_URL=https://your-domain.com
NODE_ENV=production
```

### Step 3: Generate Secure Values

**JWT Secret:**
```bash
openssl rand -base64 64
```

**Admin Password:** Use a strong password generator

### Step 4: Add Custom Domain
1. In Coolify → Your App → **Domains**
2. Add your domain (e.g., `lashedbydeedee.com`)
3. SSL is automatic via Let's Encrypt

### Step 5: Deploy
1. Click **"Deploy"** in Coolify
2. Watch build logs
3. Test at your domain

## 🧪 Test After Deployment

1. **Main site:** `https://your-domain.com`
2. **Admin login:** `https://your-domain.com/egusi`
3. **Health check:** `https://your-domain.com/api/health`

## ⚡ GitHub Integration Benefits

- ✅ **Auto-deploy** on push to main branch
- ✅ **Build testing** via GitHub Actions
- ✅ **Rollback** capability in Coolify
- ✅ **Build logs** in both GitHub and Coolify

## 🔧 Quick Troubleshooting

**Build fails?** Check GitHub Actions first - if it passes there, the issue is in Coolify config.

**Can't login to admin?** Verify `ADMIN_USERNAME`, `ADMIN_PASSWORD`, and `JWT_SECRET` are set.

**Database errors?** Check Supabase keys and ensure project is active.

**Emails not sending?** Verify Zoho credentials and enable SMTP in your Zoho account.

## 📋 Pre-Launch Checklist

- [ ] All environment variables set
- [ ] Custom domain added and SSL active  
- [ ] Admin login works
- [ ] Test booking flow works
- [ ] Emails are being sent
- [ ] Paystack webhook configured
- [ ] Database tables created in Supabase

You're ready for production! 🎉