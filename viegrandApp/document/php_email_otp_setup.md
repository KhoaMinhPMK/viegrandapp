# PHP Email OTP Setup Guide

## Overview

This guide explains how to set up the password change functionality using PHP's built-in `mail()` function instead of Firebase Functions. This approach is simpler and doesn't require upgrading to Firebase's Blaze plan.

## Architecture

```
User Request → React Native App → PHP Backend → Database + Email
```

### Components:

1. **Frontend (React Native)**
   - `ChangePasswordScreen.tsx` - UI for password change
   - `api.ts` - API calls to backend

2. **Backend (PHP)**
   - `send_otp_email_php.php` - Generates OTP and sends email
   - `verify_otp_and_change_password.php` - Verifies OTP and updates password
   - `create_otp_table.sql` - Database table for OTP storage

3. **Database**
   - `password_reset_otp` table - Stores OTPs with expiration

## Setup Instructions

### Step 1: Create Database Table

Run the SQL script to create the OTP table:

```bash
mysql -u your_username -p your_database < backend/create_otp_table.sql
```

Or manually execute the SQL:

```sql
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

CREATE INDEX `idx_user_otp_expires` ON `password_reset_otp` (`user_id`, `otp`, `expires_at`);
```

### Step 2: Verify PHP Mail Configuration

Check if your server supports email sending:

1. **Test mail function availability:**
   ```php
   <?php
   if (function_exists('mail')) {
       echo "✅ Mail function is available";
   } else {
       echo "❌ Mail function is not available";
   }
   ?>
   ```

2. **Check mail configuration:**
   ```php
   <?php
   echo "Sendmail path: " . ini_get('sendmail_path');
   ?>
   ```

### Step 3: Test the Setup

Run the test script to verify everything works:

```bash
# Access via web browser
http://your-server.com/backend/test_otp_setup.php
```

This will:
- ✅ Check if OTP table exists
- ✅ Verify mail function availability
- ✅ Test email sending with a sample user
- ✅ Show current OTP records

### Step 4: Configure Server Mail Settings (if needed)

If emails are not being sent, you may need to configure your server's mail settings:

#### For Ubuntu/Debian:
```bash
sudo apt-get install postfix
sudo dpkg-reconfigure postfix
```

#### For CentOS/RHEL:
```bash
sudo yum install postfix
sudo systemctl enable postfix
sudo systemctl start postfix
```

#### For XAMPP:
- Edit `php.ini` file
- Set `sendmail_path` to your mail server path
- Restart Apache

## How It Works

### 1. User Requests Password Change

1. User navigates to Settings → Bảo mật
2. Enters their email address
3. App calls `sendPasswordChangeOTP(email)`

### 2. Backend Generates and Sends OTP

1. `send_otp_email_php.php` receives the request
2. Validates email and checks if user exists
3. Generates a 6-digit OTP
4. Stores OTP in database with 5-minute expiration
5. Sends HTML email using PHP `mail()` function
6. Returns success/error response

### 3. User Verifies OTP and Changes Password

1. User receives email with OTP
2. Enters OTP and new password in app
3. App calls `verifyOTPAndChangePassword(email, otp, newPassword)`

### 4. Backend Verifies and Updates

1. `verify_otp_and_change_password.php` receives the request
2. Validates OTP against database
3. Checks if OTP is expired and unused
4. Hashes new password using `password_hash()`
5. Updates user's password in database
6. Marks OTP as used
7. Returns success/error response

## Security Features

### OTP Security:
- ✅ 6-digit numeric OTP
- ✅ 5-minute expiration
- ✅ One-time use only
- ✅ Automatic cleanup of expired OTPs

### Password Security:
- ✅ Password hashing using `password_hash()`
- ✅ Minimum 6-character requirement
- ✅ Input validation and sanitization

### Email Security:
- ✅ HTML email with professional design
- ✅ Clear security warnings
- ✅ Plain text fallback

## File Structure

```
backend/
├── send_otp_email_php.php          # OTP generation and email sending
├── verify_otp_and_change_password.php  # OTP verification and password update
├── create_otp_table.sql            # Database table creation
├── test_otp_setup.php              # Setup verification script
└── config.php                      # Database configuration

src/
├── screens/Elderly/Settings/
│   └── ChangePasswordScreen.tsx    # Password change UI
└── services/
    └── api.ts                      # API calls

document/
└── php_email_otp_setup.md          # This documentation
```

## Troubleshooting

### Common Issues:

#### 1. "Mail function not available"
**Solution:** Install and configure a mail server (Postfix, Sendmail, etc.)

#### 2. "OTP table does not exist"
**Solution:** Run the SQL script to create the table

#### 3. "Emails not being received"
**Solutions:**
- Check spam folder
- Verify server mail configuration
- Test with a different email address
- Check server logs for mail errors

#### 4. "Database connection error"
**Solution:** Verify database credentials in `config.php`

### Testing:

1. **Test email sending:**
   ```bash
   # Run the test script
   http://your-server.com/backend/test_otp_setup.php
   ```

2. **Test in app:**
   - Go to Settings → Bảo mật
   - Enter your email
   - Check email for OTP
   - Complete password change

## Advantages of PHP Email Approach

### ✅ Pros:
- **No additional costs** - Uses existing server infrastructure
- **Simple setup** - No external services required
- **Full control** - Complete control over email sending
- **No plan upgrades** - Works with existing Firebase Spark plan

### ⚠️ Considerations:
- **Server dependency** - Requires mail server configuration
- **Deliverability** - May need to configure SPF/DKIM for better delivery
- **Maintenance** - Need to maintain mail server

## Alternative Email Services

If PHP mail() doesn't work, consider these alternatives:

### 1. PHPMailer with SMTP
```php
// Use PHPMailer with Gmail SMTP
require 'PHPMailer/PHPMailer.php';
$mail = new PHPMailer();
$mail->isSMTP();
$mail->Host = 'smtp.gmail.com';
$mail->SMTPAuth = true;
$mail->Username = 'your-email@gmail.com';
$mail->Password = 'your-app-password';
```

### 2. SendGrid (Free tier: 100 emails/day)
```php
// Use SendGrid API
$url = 'https://api.sendgrid.com/v3/mail/send';
$data = [
    'personalizations' => [
        ['to' => [['email' => $userEmail]]]
    ],
    'from' => ['email' => 'noreply@viegrandapp.com'],
    'subject' => 'OTP Code',
    'content' => [['type' => 'text/html', 'value' => $htmlContent]]
];
```

### 3. Mailgun (Free tier: 5,000 emails/month)
```php
// Use Mailgun API
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, "https://api.mailgun.net/v3/your-domain.com/messages");
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, $postData);
curl_setopt($ch, CURLOPT_USERPWD, "api:your-api-key");
```

## Conclusion

The PHP email approach provides a cost-effective and simple solution for password change functionality. It leverages your existing server infrastructure and doesn't require additional external services or plan upgrades.

For most use cases, this approach will work perfectly and provide a professional user experience with secure OTP-based password changes. 