# Gmail SMTP Setup Guide

## Overview

This guide will help you set up Gmail SMTP to send OTP emails for the password change functionality in VieGrand App.

## Prerequisites

1. **Gmail Account**: You need a Gmail account
2. **2-Factor Authentication**: Must be enabled on your Gmail account
3. **App Password**: A 16-character app password for the application

## Step-by-Step Setup

### Step 1: Enable 2-Factor Authentication

1. Go to [Google Account Settings](https://myaccount.google.com/)
2. Click on **Security** in the left sidebar
3. Under **Signing in to Google**, click on **2-Step Verification**
4. Follow the prompts to enable 2-Factor Authentication

### Step 2: Generate App Password

1. Go to [Google Account Settings](https://myaccount.google.com/)
2. Click on **Security** in the left sidebar
3. Under **Signing in to Google**, click on **App passwords**
4. Select **Mail** as the app and **Other** as the device
5. Enter "VieGrand App" as the name
6. Click **Generate**
7. **Copy the 16-character password** (it will look like: `abcd efgh ijkl mnop`)

### Step 3: Install PHPMailer

1. Visit: **https://viegrand.site/backend/install_phpmailer.php**
2. This will automatically download and install PHPMailer files

### Step 4: Configure Gmail Credentials

1. Open the file: `backend/send_otp_email_gmail.php`
2. Find these lines (around line 95-96):
   ```php
   $gmailUsername = 'your-email@gmail.com'; // Replace with your Gmail
   $gmailPassword = 'your-16-char-app-password'; // Replace with your Gmail App Password
   ```
3. Replace with your actual credentials:
   ```php
   $gmailUsername = 'your-actual-email@gmail.com';
   $gmailPassword = 'abcd efgh ijkl mnop'; // Your 16-character app password
   ```

### Step 5: Test the Setup

1. **Test PHPMailer Installation:**
   Visit: **https://viegrand.site/backend/test_phpmailer.php**

2. **Test Email Sending:**
   Visit: **https://viegrand.site/backend/test_gmail_email.php**

3. **Test in App:**
   - Open VieGrand app
   - Go to Settings → Bảo mật
   - Enter your email
   - Check your email for the OTP

## Troubleshooting

### Common Issues:

#### 1. "Authentication failed"
**Solution:** 
- Make sure 2-Factor Authentication is enabled
- Verify the app password is correct (16 characters, no spaces)
- Check that you're using the app password, not your regular Gmail password

#### 2. "Connection failed"
**Solution:**
- Check your internet connection
- Verify Gmail SMTP settings:
  - Host: `smtp.gmail.com`
  - Port: `587`
  - Security: `STARTTLS`

#### 3. "PHPMailer not found"
**Solution:**
- Run the PHPMailer installation script again
- Check that the PHPMailer directory exists in the backend folder

#### 4. "Email not received"
**Solutions:**
- Check spam folder
- Verify the recipient email address
- Check Gmail account settings for any restrictions

### Security Best Practices:

1. **Never commit credentials to version control**
2. **Use environment variables in production**
3. **Regularly rotate app passwords**
4. **Monitor email sending logs**

## Production Configuration

For production, consider using environment variables:

```php
// In production, use environment variables
$gmailUsername = $_ENV['GMAIL_USERNAME'] ?? 'your-email@gmail.com';
$gmailPassword = $_ENV['GMAIL_APP_PASSWORD'] ?? 'your-app-password';
```

## Alternative Email Services

If Gmail doesn't work for you, consider these alternatives:

### 1. SendGrid (Free: 100 emails/day)
```php
// Configure SendGrid API
$apiKey = 'your-sendgrid-api-key';
$url = 'https://api.sendgrid.com/v3/mail/send';
```

### 2. Mailgun (Free: 5,000 emails/month)
```php
// Configure Mailgun API
$apiKey = 'your-mailgun-api-key';
$domain = 'your-domain.com';
```

### 3. Amazon SES
```php
// Configure AWS SES
$accessKey = 'your-aws-access-key';
$secretKey = 'your-aws-secret-key';
$region = 'us-east-1';
```

## Testing Checklist

- [ ] 2-Factor Authentication enabled
- [ ] App password generated
- [ ] PHPMailer installed
- [ ] Gmail credentials configured
- [ ] Test email sent successfully
- [ ] OTP received in email
- [ ] Password change works in app

## Support

If you encounter issues:

1. Check the error logs in your server
2. Verify all configuration steps
3. Test with a different email address
4. Contact support with specific error messages

## Next Steps

Once Gmail SMTP is working:

1. Test the complete password change flow
2. Monitor email delivery rates
3. Set up email logging for debugging
4. Consider implementing email templates
5. Plan for production deployment 