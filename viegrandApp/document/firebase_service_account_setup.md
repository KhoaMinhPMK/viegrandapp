# Firebase Service Account Setup for FCM HTTP v1 API

## Overview

Since Firebase deprecated the legacy server key approach, we now use the **FCM HTTP v1 API** with service accounts for secure authentication.

## Step-by-Step Setup

### **1. Generate Service Account Key**

1. **Go to Firebase Console**: https://console.firebase.google.com/
2. **Select your project**: "viegrand"
3. **Go to Project Settings**: Click the gear icon ⚙️
4. **Go to "Service accounts" tab**
5. **Click "Generate new private key"**
6. **Click "Generate key"** in the popup
7. **Download** the JSON file (it will be named something like `viegrand-firebase-adminsdk-xxxxx-xxxxxxxxxx.json`)

### **2. Configure the Service Account File**

1. **Rename** the downloaded file to: `firebase-service-account.json`
2. **Place it** in your backend folder: `backend/firebase-service-account.json`
3. **Set proper permissions** (optional but recommended):
   ```bash
   chmod 600 backend/firebase-service-account.json
   ```

### **3. Update Project ID**

In `backend/send_push_notification.php`, make sure the project ID matches your Firebase project:

```php
define('FCM_PROJECT_ID', 'viegrand'); // Replace with your actual project ID
```

### **4. Test the Setup**

Run the test script to verify everything works:

```bash
php backend/test_push_notification.php
```

## Security Best Practices

### **1. File Security**
- ✅ **Keep the service account file secure** - never commit it to version control
- ✅ **Add to .gitignore**: `backend/firebase-service-account.json`
- ✅ **Set proper file permissions**: `chmod 600`

### **2. Environment Variables (Optional)**
For better security, you can use environment variables:

```php
// In send_push_notification.php
define('FCM_PROJECT_ID', $_ENV['FIREBASE_PROJECT_ID'] ?? 'viegrand');
define('FCM_SERVICE_ACCOUNT_FILE', $_ENV['FIREBASE_SERVICE_ACCOUNT_PATH'] ?? __DIR__ . '/firebase-service-account.json');
```

### **3. Service Account Permissions**
The service account should have the following roles:
- ✅ **Firebase Admin SDK Administrator Service Agent**
- ✅ **Cloud Messaging Admin** (if available)

## Troubleshooting

### **Common Issues:**

#### **1. "Service account file not found"**
- **Check**: File path is correct
- **Check**: File exists in `backend/firebase-service-account.json`
- **Check**: File permissions allow PHP to read it

#### **2. "Failed to get access token"**
- **Check**: Service account JSON is valid
- **Check**: Project ID matches Firebase project
- **Check**: Service account has proper permissions

#### **3. "FCM Error: HTTP 401"**
- **Check**: Access token is valid
- **Check**: Service account has FCM permissions
- **Check**: Project ID is correct

#### **4. "FCM Error: HTTP 404"**
- **Check**: Device token is valid
- **Check**: User has granted notification permissions
- **Check**: App is properly configured with Firebase

### **Debug Commands:**

#### **Check Service Account File:**
```bash
# Verify file exists and is readable
ls -la backend/firebase-service-account.json

# Check JSON format
php -r "echo json_encode(json_decode(file_get_contents('backend/firebase-service-account.json')));"
```

#### **Test Access Token Generation:**
```php
<?php
require_once 'send_push_notification.php';
$token = getFirebaseAccessToken();
echo $token ? "✅ Token generated: " . substr($token, 0, 20) . "..." : "❌ Token generation failed";
?>
```

## File Structure

After setup, your backend folder should look like:

```
backend/
├── firebase-service-account.json  ← Your service account file
├── send_push_notification.php     ← Updated FCM v1 API implementation
├── test_push_notification.php     ← Test script
└── ... (other files)
```

## Next Steps

1. **Complete the service account setup** above
2. **Test with a real user** by updating the test script
3. **Verify push notifications work** on both Android and iOS
4. **Monitor delivery rates** and user engagement

## Important Notes

- 🔒 **Never share** your service account file publicly
- 🔄 **Service account keys don't expire** but can be rotated for security
- 📱 **Test on real devices** - emulators may not support FCM properly
- 🚀 **The new API is more secure** and provides better error handling 