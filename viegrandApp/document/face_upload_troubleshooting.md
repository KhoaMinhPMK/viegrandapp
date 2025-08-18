# Face Upload Troubleshooting Guide

## Network Error Diagnosis

The "Network Error" you're experiencing is likely due to one of these issues:

### 1. **Server Configuration Issues**

#### Check if the backend server is accessible:
```bash
# Test the server directly
curl -X GET https://viegrand.site/backend/test_face_upload.php
```

#### Verify the upload endpoint exists:
```bash
# Check if the upload file exists
curl -X GET https://viegrand.site/backend/upload_face_data.php
```

### 2. **PHP Configuration Issues**

#### Check PHP upload settings in your server:
```php
// Add this to upload_face_data.php temporarily for debugging
echo "Upload max filesize: " . ini_get('upload_max_filesize') . "\n";
echo "Post max size: " . ini_get('post_max_size') . "\n";
echo "Max execution time: " . ini_get('max_execution_time') . "\n";
```

#### Required PHP settings:
```ini
upload_max_filesize = 50M
post_max_size = 50M
max_execution_time = 300
memory_limit = 256M
```

### 3. **File Permissions**

#### Check upload directory permissions:
```bash
# On your server
ls -la backend/uploads/
ls -la backend/uploads/face_data/

# Set proper permissions
chmod 755 backend/uploads/
chmod 755 backend/uploads/face_data/
```

### 4. **Database Issues**

#### Verify the face_data table exists:
```sql
-- Run this on your database
SHOW TABLES LIKE 'face_data';
DESCRIBE face_data;
```

#### Create the table if missing:
```bash
# Run the setup script
php backend/create_face_data_table.php
```

## Debugging Steps

### Step 1: Test Server Connection
1. Open the Face Data Collection screen
2. Look for the server status indicator in the top-right corner
3. Tap the indicator to test connection
4. Check console logs for detailed error information

### Step 2: Check Console Logs
Look for these log messages in your React Native console:

```
🔄 testFaceUploadServer - Testing server connection...
🔄 testFaceUploadServer - Using baseURL: https://viegrand.site/backend/
✅ testFaceUploadServer - Server response: {...}
```

Or error messages like:
```
❌ testFaceUploadServer - Connection failed: Network Error
❌ uploadFaceData - Error details: {...}
```

### Step 3: Verify API Configuration
Check your `src/config/env.ts`:
```typescript
const config: EnvironmentConfig = {
  // Make sure this points to your correct backend URL
  BACKEND_API_URL: 'https://viegrand.site/backend/',
};
```

### Step 4: Test with Simple Request
Try uploading a small test file first:
```typescript
// Add this test function to your API service
export const testSimpleUpload = async () => {
  const formData = new FormData();
  formData.append('test', 'test data');
  
  try {
    const response = await nodeClient.post('/test_face_upload.php', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    console.log('Simple upload test successful:', response.data);
  } catch (error) {
    console.error('Simple upload test failed:', error);
  }
};
```

## Common Solutions

### Solution 1: Fix Server URL
If your backend is on a different URL, update the configuration:
```typescript
// In src/config/env.ts
BACKEND_API_URL: 'https://your-actual-server.com/backend/',
```

### Solution 2: Enable CORS
Add CORS headers to your PHP files:
```php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
```

### Solution 3: Increase Timeout
If uploads are timing out, increase the timeout:
```typescript
// In src/services/api.ts
const nodeClient = axios.create({
  baseURL: config.BACKEND_API_URL,
  timeout: 120000, // 2 minutes
});
```

### Solution 4: Check File Size
If the video file is too large, compress it before upload:
```typescript
// Add file size check before upload
const fileInfo = await RNFS.stat(videoPath);
if (fileInfo.size > 50 * 1024 * 1024) { // 50MB
  Alert.alert('File too large', 'Video must be less than 50MB');
  return;
}
```

## Testing Checklist

- [ ] Server is accessible via browser
- [ ] PHP upload settings are correct
- [ ] Upload directory exists and has proper permissions
- [ ] Database table exists
- [ ] CORS headers are set
- [ ] Network timeout is sufficient
- [ ] File size is within limits
- [ ] Video format is supported

## Emergency Debug Mode

Add this to your `upload_face_data.php` for detailed debugging:
```php
// At the top of the file
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Log all incoming data
error_log("Upload request received: " . print_r($_POST, true));
error_log("Files received: " . print_r($_FILES, true));
```

This will help identify exactly where the upload is failing. 