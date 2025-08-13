# Firebase Functions Setup for Email OTP

## Overview

This document describes how to set up Firebase Functions to send OTP emails for the VieGrand app password change functionality. This solution uses Firebase Functions with Gmail SMTP to send emails, eliminating the need for external email services like SendGrid.

## Prerequisites

### **1. Firebase Project Setup**
- ✅ Firebase project already exists: `viegrand-487bd`
- ✅ Firebase CLI installed
- ✅ Firebase project initialized

### **2. Gmail Account Setup**
- Gmail account for sending emails
- App password generated (not regular password)

## Step-by-Step Setup

### **Step 1: Initialize Firebase Functions**

```bash
# Navigate to your project root
cd viegrandApp

# Initialize Firebase Functions (if not already done)
firebase init functions

# Select your project: viegrand-487bd
# Choose JavaScript
# Use ESLint: Yes
# Install dependencies: Yes
```

### **Step 2: Set Up Gmail App Password**

#### **2.1 Enable 2-Factor Authentication**
1. Go to [Google Account Settings](https://myaccount.google.com/)
2. Navigate to Security → 2-Step Verification
3. Enable 2-Step Verification if not already enabled

#### **2.2 Generate App Password**
1. Go to Security → App passwords
2. Select "Mail" and "Other (Custom name)"
3. Enter "VieGrand App" as the name
4. Click "Generate"
5. **Copy the 16-character app password** (you'll need this)

### **Step 3: Configure Firebase Functions**

#### **3.1 Set Environment Variables**
```bash
# Set Gmail credentials
firebase functions:config:set email.user="your-email@gmail.com"
firebase functions:config:set email.password="your-16-char-app-password"

# Verify configuration
firebase functions:config:get
```

#### **3.2 Install Dependencies**
```bash
cd firebase-functions/functions
npm install nodemailer
```

### **Step 4: Deploy Firebase Functions**

```bash
# Deploy the functions
firebase deploy --only functions

# You should see output like:
# ✔  functions[sendOTPEmail(us-central1)] Successful create operation.
# Function URL: https://us-central1-viegrand-487bd.cloudfunctions.net/sendOTPEmail
```

### **Step 5: Update PHP Configuration**

Update the Firebase Functions URL in your PHP file:

```php
// In backend/send_otp_email_firebase.php
define('FIREBASE_FUNCTIONS_URL', 'https://us-central1-viegrand-487bd.cloudfunctions.net/sendOTPEmail');
```

### **Step 6: Create Database Table**

Run the SQL script to create the OTP table:

```sql
-- Run this in your MySQL database
CREATE TABLE IF NOT EXISTS `password_reset_otp` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `otp` varchar(6) NOT NULL,
  `expires_at` datetime NOT NULL,
  `used` tinyint(1) NOT NULL DEFAULT 0,
  `used_at` datetime NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_otp` (`otp`),
  KEY `idx_expires_at` (`expires_at`),
  KEY `idx_used` (`used`),
  CONSTRAINT `fk_password_reset_otp_user` FOREIGN KEY (`user_id`) REFERENCES `user` (`userId`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Add index for better performance
CREATE INDEX `idx_user_otp_expires` ON `password_reset_otp` (`user_id`, `otp`, `expires_at`);
```

## Testing the Setup

### **1. Test Firebase Function Locally**

```bash
cd firebase-functions
firebase emulators:start --only functions
```

### **2. Test Email Sending**

```bash
# Test the function with curl
curl -X POST https://us-central1-viegrand-487bd.cloudfunctions.net/sendOTPEmail \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "userName": "Test User",
    "otp": "123456",
    "subject": "Test OTP Email",
    "template": "password_reset"
  }'
```

### **3. Test from PHP Backend**

```bash
# Test the PHP endpoint
curl -X POST http://your-server/backend/send_otp_email_firebase.php \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com"}'
```

## File Structure

```
viegrandApp/
├── firebase-functions/
│   ├── functions/
│   │   ├── index.js          # Firebase Functions code
│   │   └── package.json      # Dependencies
│   ├── firebase.json         # Firebase configuration
│   └── .firebaserc          # Project configuration
├── backend/
│   ├── send_otp_email_firebase.php    # PHP endpoint
│   ├── verify_otp_and_change_password.php
│   └── create_otp_table.sql
└── src/
    ├── screens/Elderly/Settings/
    │   └── ChangePasswordScreen.tsx
    └── services/
        └── api.ts
```

## Configuration Details

### **Firebase Functions Configuration**

```javascript
// functions/index.js
const functions = require('firebase-functions');
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransporter({
  service: 'gmail',
  auth: {
    user: functions.config().email.user,        // Your Gmail
    pass: functions.config().email.password     // App password
  }
});
```

### **Environment Variables**

```bash
# Set these in Firebase
firebase functions:config:set email.user="your-email@gmail.com"
firebase functions:config:set email.password="your-16-char-app-password"
```

### **PHP Configuration**

```php
// backend/send_otp_email_firebase.php
define('FIREBASE_FUNCTIONS_URL', 'https://us-central1-viegrand-487bd.cloudfunctions.net/sendOTPEmail');
define('FIREBASE_PROJECT_ID', 'viegrand-487bd');
```

## Security Features

### **1. Gmail Security**
- ✅ **App Password**: Uses Gmail app password, not regular password
- ✅ **2FA Required**: Requires 2-factor authentication
- ✅ **Secure SMTP**: Uses Gmail's secure SMTP servers

### **2. Firebase Security**
- ✅ **HTTPS Only**: Functions only accessible via HTTPS
- ✅ **CORS Protection**: Proper CORS headers
- ✅ **Input Validation**: Validates all input parameters

### **3. Email Security**
- ✅ **Professional Template**: Beautiful, branded email design
- ✅ **Security Warnings**: Clear instructions for users
- ✅ **OTP Expiration**: 5-minute validity period

## Troubleshooting

### **Common Issues:**

#### **1. "Authentication failed" Error**
- **Check**: Gmail app password is correct
- **Check**: 2-factor authentication is enabled
- **Check**: App password is 16 characters long

#### **2. "Function not found" Error**
- **Check**: Firebase Functions are deployed
- **Check**: Function URL is correct
- **Check**: Project ID matches

#### **3. "Email not received"**
- **Check**: Gmail account has sending permissions
- **Check**: Email is not in spam folder
- **Check**: Firebase Function logs for errors

#### **4. "CORS Error"**
- **Check**: CORS headers are set correctly
- **Check**: Request method is POST
- **Check**: Content-Type header is set

### **Debug Commands:**

#### **Check Firebase Function Logs:**
```bash
firebase functions:log --only sendOTPEmail
```

#### **Test Function Locally:**
```bash
cd firebase-functions
firebase emulators:start --only functions
```

#### **Check Configuration:**
```bash
firebase functions:config:get
```

#### **Redeploy Functions:**
```bash
firebase deploy --only functions
```

## Monitoring and Maintenance

### **1. Firebase Console Monitoring**
- Monitor function execution in Firebase Console
- Check function logs for errors
- Monitor execution time and memory usage

### **2. Email Delivery Monitoring**
- Check Gmail sent folder
- Monitor for bounce emails
- Check spam reports

### **3. Database Monitoring**
- Monitor OTP table size
- Clean up expired OTPs periodically
- Check for failed password updates

## Cost Considerations

### **Firebase Functions Pricing**
- **Free Tier**: 2 million invocations/month
- **Paid Tier**: $0.40 per million invocations
- **Email Sending**: Gmail is free (up to 500/day for regular accounts)

### **Optimization Tips**
- Use function caching where possible
- Implement rate limiting
- Monitor function execution time

## Alternative Email Services

If Gmail doesn't work for your needs, you can easily switch to other services:

### **Outlook/Hotmail**
```javascript
const transporter = nodemailer.createTransporter({
  service: 'outlook',
  auth: {
    user: 'your-email@outlook.com',
    pass: 'your-app-password'
  }
});
```

### **Custom SMTP**
```javascript
const transporter = nodemailer.createTransporter({
  host: 'smtp.your-provider.com',
  port: 587,
  secure: false,
  auth: {
    user: 'your-email@domain.com',
    pass: 'your-password'
  }
});
```

## Next Steps

1. **Complete the setup** following the steps above
2. **Test the email flow** with a real user
3. **Monitor function performance** in Firebase Console
4. **Set up monitoring alerts** for function errors
5. **Consider rate limiting** for production use

## Conclusion

This Firebase Functions solution provides a secure, reliable, and cost-effective way to send OTP emails for password changes. It leverages your existing Firebase infrastructure and eliminates the need for external email services.

The solution includes:
- ✅ **Secure email delivery** via Gmail SMTP
- ✅ **Professional email templates** with VieGrand branding
- ✅ **Comprehensive error handling** and logging
- ✅ **Easy deployment** and monitoring
- ✅ **Cost-effective** solution with generous free tiers

Once set up, users can securely change their passwords through the app's "Bảo mật" section, receiving professional OTP emails via Firebase Functions. 