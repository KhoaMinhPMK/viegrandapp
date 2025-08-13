# Password Change Implementation with OTP via Email (Firebase Functions)

## Overview

This document describes the implementation of password change functionality for the VieGrand app, allowing users to securely change their passwords using OTP (One-Time Password) verification via email using Firebase Functions.

## Architecture

### **Frontend (React Native)**
- **ChangePasswordScreen**: Multi-step password change flow
- **API Integration**: Send OTP and verify OTP endpoints
- **User Experience**: Step-by-step guided process

### **Backend (PHP)**
- **Firebase Functions Integration**: Reliable email delivery via Gmail SMTP
- **OTP Management**: Secure OTP generation and storage
- **Password Hashing**: Using PHP's built-in `password_hash()` function
- **Database**: OTP storage with expiration and usage tracking

### **Firebase Functions (Node.js)**
- **Email Service**: Gmail SMTP integration via Nodemailer
- **Professional Templates**: Beautiful HTML email design
- **Security**: App password authentication with 2FA

## Implementation Details

### **1. Database Schema**

**Table:** `password_reset_otp`

```sql
CREATE TABLE `password_reset_otp` (
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
```

### **2. Backend API Endpoints**

#### **Send OTP Email**
**File:** `backend/send_otp_email_firebase.php`

**Endpoint:** `POST /backend/send_otp_email_firebase.php`

**Request:**
```json
{
  "email": "user@example.com"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "message": "OTP sent successfully",
    "expires_in": 300
  },
  "message": "OTP sent to your email address"
}
```

**Features:**
- ✅ **Email Validation**: Validates email format and user existence
- ✅ **OTP Generation**: Generates secure 6-digit OTP
- ✅ **Database Storage**: Stores OTP with 5-minute expiration
- ✅ **Firebase Functions**: Calls Firebase Function for email delivery
- ✅ **Error Handling**: Comprehensive error handling and logging

#### **Verify OTP and Change Password**
**File:** `backend/verify_otp_and_change_password.php`

**Endpoint:** `POST /backend/verify_otp_and_change_password.php`

**Request:**
```json
{
  "email": "user@example.com",
  "otp": "123456",
  "newPassword": "newSecurePassword123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "message": "Password changed successfully",
    "user": {
      "userId": 123,
      "userName": "John Doe",
      "email": "user@example.com"
    }
  },
  "message": "Password changed successfully"
}
```

**Features:**
- ✅ **OTP Verification**: Validates OTP and expiration
- ✅ **Password Strength**: Minimum 6 characters validation
- ✅ **Secure Hashing**: Uses `password_hash()` with `PASSWORD_DEFAULT`
- ✅ **Database Update**: Updates user password securely
- ✅ **OTP Cleanup**: Marks OTP as used and cleans up expired OTPs

### **3. Firebase Functions**

#### **Email Service Function**
**File:** `firebase-functions/functions/index.js`

**Features:**
- ✅ **Gmail SMTP**: Uses Gmail with app password authentication
- ✅ **Professional Templates**: Beautiful HTML email design
- ✅ **CORS Support**: Proper CORS headers for cross-origin requests
- ✅ **Error Handling**: Comprehensive error handling and logging
- ✅ **Security**: Input validation and secure email delivery

**Function URL:** `https://us-central1-viegrand-487bd.cloudfunctions.net/sendOTPEmail`

### **4. Frontend Implementation**

#### **ChangePasswordScreen**
**File:** `src/screens/Elderly/Settings/ChangePasswordScreen.tsx`

**Features:**
- ✅ **Multi-step Flow**: Email → OTP → Password
- ✅ **Progress Indicator**: Visual progress bar
- ✅ **OTP Input**: 6-digit OTP with auto-focus
- ✅ **Password Validation**: Real-time password strength checking
- ✅ **Resend OTP**: 60-second countdown timer
- ✅ **Beautiful UI**: Consistent with app design
- ✅ **Error Handling**: Comprehensive error messages

**Flow:**
1. **Step 1**: User enters email address
2. **Step 2**: User receives OTP via email and enters it
3. **Step 3**: User enters new password and confirms it
4. **Success**: Password is updated and user is redirected

#### **API Integration**
**File:** `src/services/api.ts`

**Functions:**
```typescript
// Send OTP to user's email via Firebase Functions
export const sendPasswordChangeOTP = async (email: string): Promise<ApiResponse>

// Verify OTP and change password
export const verifyOTPAndChangePassword = async (
  email: string, 
  otp: string, 
  newPassword: string
): Promise<ApiResponse>
```

## Setup Instructions

### **1. Firebase Functions Setup**

#### **Step 1: Initialize Firebase Functions**
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

#### **Step 2: Set Up Gmail App Password**
1. **Enable 2-Factor Authentication** in your Google Account
2. **Generate App Password**:
   - Go to Security → App passwords
   - Select "Mail" and "Other (Custom name)"
   - Enter "VieGrand App" as the name
   - Copy the 16-character app password

#### **Step 3: Configure Firebase Functions**
```bash
# Set Gmail credentials
firebase functions:config:set email.user="your-email@gmail.com"
firebase functions:config:set email.password="your-16-char-app-password"

# Install dependencies
cd firebase-functions/functions
npm install nodemailer

# Deploy functions
firebase deploy --only functions
```

### **2. Database Setup**

#### **Create OTP Table**
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

### **3. Frontend Integration**

#### **Navigation Setup**
The ChangePasswordScreen is already integrated into the ElderlyNavigator.

#### **Settings Integration**
The "Bảo mật" section in settings now navigates to the password change screen.

## Security Features

### **1. OTP Security**
- ✅ **6-digit OTP**: Secure random generation
- ✅ **5-minute Expiration**: Short validity period
- ✅ **Single Use**: OTP can only be used once
- ✅ **Rate Limiting**: Can be added for production

### **2. Password Security**
- ✅ **Strong Hashing**: Uses `password_hash()` with `PASSWORD_DEFAULT`
- ✅ **Minimum Length**: 6 characters minimum
- ✅ **Secure Storage**: Passwords are never stored in plain text

### **3. Email Security**
- ✅ **Gmail App Password**: Uses app password, not regular password
- ✅ **2FA Required**: Requires 2-factor authentication
- ✅ **Secure SMTP**: Uses Gmail's secure SMTP servers
- ✅ **No Sensitive Data**: OTP is the only sensitive data sent

### **4. Firebase Security**
- ✅ **HTTPS Only**: Functions only accessible via HTTPS
- ✅ **CORS Protection**: Proper CORS headers
- ✅ **Input Validation**: Validates all input parameters

### **5. Database Security**
- ✅ **Foreign Key Constraints**: Maintains data integrity
- ✅ **Indexed Queries**: Optimized for performance
- ✅ **Automatic Cleanup**: Expired OTPs are cleaned up

## Usage Examples

### **1. User Flow**

#### **Step 1: Access Password Change**
1. User goes to Settings → Bảo mật
2. App navigates to ChangePasswordScreen

#### **Step 2: Enter Email**
1. User enters their email address
2. App sends OTP request to backend
3. Backend calls Firebase Function
4. User receives email with OTP

#### **Step 3: Enter OTP**
1. User enters 6-digit OTP from email
2. App validates OTP format
3. User proceeds to password step

#### **Step 4: Set New Password**
1. User enters new password
2. User confirms new password
3. App validates password strength
4. App sends password change request

#### **Step 5: Success**
1. Password is updated in database
2. User sees success message
3. User is redirected back to settings

### **2. API Usage**

#### **Send OTP**
```typescript
const result = await sendPasswordChangeOTP('user@example.com');
if (result.success) {
  console.log('OTP sent successfully');
} else {
  console.error('Failed to send OTP:', result.message);
}
```

#### **Change Password**
```typescript
const result = await verifyOTPAndChangePassword(
  'user@example.com',
  '123456',
  'newSecurePassword123'
);
if (result.success) {
  console.log('Password changed successfully');
} else {
  console.error('Failed to change password:', result.message);
}
```

## Testing

### **1. Manual Testing**

#### **Test Firebase Function**
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

#### **Test Password Change Flow**
1. Navigate to Settings → Bảo mật
2. Enter valid email address
3. Check email for OTP
4. Enter OTP in app
5. Set new password
6. Verify password change

#### **Test Error Cases**
1. Invalid email format
2. Non-existent email
3. Expired OTP
4. Invalid OTP
5. Weak password
6. Mismatched password confirmation

### **2. Database Testing**

#### **Check OTP Records**
```sql
SELECT * FROM password_reset_otp WHERE user_id = [USER_ID];
```

#### **Verify Password Update**
```sql
SELECT userId, userName, email FROM user WHERE email = 'user@example.com';
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

## Performance Considerations

### **1. Firebase Functions Performance**
- ✅ **Cold Start**: Functions may have cold start delays
- ✅ **Warm Functions**: Keep functions warm for better performance
- ✅ **Memory Usage**: Monitor function memory usage

### **2. Email Delivery Performance**
- ✅ **Gmail SMTP**: Reliable and fast email delivery
- ✅ **Template Caching**: Email templates are optimized
- ✅ **Batch Processing**: Can handle multiple requests

### **3. Database Performance**
- ✅ **Indexed Queries**: Fast OTP lookups
- ✅ **Efficient Cleanup**: Automatic expired OTP removal
- ✅ **Connection Pooling**: Reuses database connections

### **4. Frontend Performance**
- ✅ **Optimized UI**: Smooth animations and transitions
- ✅ **Efficient State Management**: Minimal re-renders
- ✅ **Error Handling**: Graceful error recovery

## Cost Considerations

### **Firebase Functions Pricing**
- **Free Tier**: 2 million invocations/month
- **Paid Tier**: $0.40 per million invocations
- **Email Sending**: Gmail is free (up to 500/day for regular accounts)

### **Optimization Tips**
- Use function caching where possible
- Implement rate limiting
- Monitor function execution time

## Future Enhancements

### **1. Additional Security**
- **Rate Limiting**: Prevent OTP abuse
- **IP Tracking**: Monitor suspicious IP addresses
- **Device Fingerprinting**: Track device changes

### **2. User Experience**
- **Biometric Authentication**: Fingerprint/Face ID support
- **Remember Device**: Skip OTP for trusted devices
- **Password Strength Meter**: Visual password strength indicator

### **3. Email Enhancements**
- **Custom Templates**: Branded email templates
- **Localization**: Multi-language email support
- **Email Preferences**: User email notification settings

## Conclusion

The password change implementation provides a secure, user-friendly way for VieGrand app users to change their passwords. The solution leverages Firebase Functions with Gmail SMTP for reliable email delivery and includes comprehensive security measures to protect user accounts.

The implementation follows best practices for:
- ✅ **Security**: Secure OTP generation, password hashing, and email delivery
- ✅ **User Experience**: Intuitive multi-step flow with clear guidance
- ✅ **Reliability**: Robust error handling and fallback mechanisms
- ✅ **Maintainability**: Clean code structure and comprehensive documentation
- ✅ **Cost-Effectiveness**: Uses Firebase free tier and Gmail free email

Users can now securely change their passwords through the "Bảo mật" section in the app settings, with the confidence that their accounts are protected by industry-standard security measures and reliable email delivery via Firebase Functions. 