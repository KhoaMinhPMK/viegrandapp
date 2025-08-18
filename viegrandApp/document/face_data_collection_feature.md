# Face Data Collection Feature

## Overview
The Face Data Collection feature allows elderly users to record video clips of their faces and upload them to the server for processing and storage. This feature is designed to collect facial data for potential AI-powered features like face recognition, emotion detection, or health monitoring.

## Key Features

### Frontend (React Native)
- **Camera Integration**: Uses `react-native-vision-camera` for high-quality video recording
- **Front Camera**: Automatically uses the front-facing camera for selfie-style recording
- **Recording Controls**: Start/stop recording with visual feedback
- **Timer Display**: Shows recording duration in real-time
- **Preview Mode**: Shows recorded video information before upload
- **Upload Progress**: Visual feedback during video upload
- **Permission Handling**: Proper camera permission requests and error handling
- **Debug Tools**: Multiple test buttons for troubleshooting upload issues

### Backend (PHP)
- **File Upload**: Handles multipart form data for video uploads
- **File Validation**: Validates video format, size, and content
- **Database Storage**: Stores video metadata in `face_data` table
- **Security**: Validates user authentication and file integrity
- **Error Handling**: Comprehensive error handling and logging
- **Private Key Filenames**: Uses user's private key as filename for consistency
- **File Appending**: Automatically appends new data to existing files

## Implementation Details

### Database Schema
```sql
CREATE TABLE `face_data` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `email` varchar(255) NOT NULL,
  `video_path` varchar(500) NOT NULL,
  `file_size` bigint(20) NOT NULL,
  `upload_date` datetime NOT NULL,
  `status` enum('uploaded','processed','failed') DEFAULT 'uploaded',
  `processing_result` text DEFAULT NULL,
  `private_key` varchar(255) NOT NULL,
  `is_appended` tinyint(1) DEFAULT 0,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`user_id`) REFERENCES `user` (`userId`) ON DELETE CASCADE
);
```

### File Naming Convention
- **Format**: `face_data_{private_key}.{extension}`
- **Example**: `face_data_abc123def456.mp4`
- **Benefits**: 
  - Consistent filename per user
  - Easy to identify user's face data
  - Automatic file appending when same user uploads again

### File Appending Logic
- **New User**: Creates new file with private key as filename
- **Existing User**: Appends new video data to existing file using FFmpeg
- **Database Tracking**: `is_appended` field tracks whether file was appended
- **Size Tracking**: Records original and final file sizes
- **FFmpeg Required**: Uses FFmpeg for proper video concatenation
- **Fallback Method**: If FFmpeg unavailable, creates timestamped files

### API Endpoints
- **POST** `/upload_face_data.php` - Upload face video data
- **GET** `/test_face_data_upload.php` - Test upload functionality
- **GET** `/test_file_upload.php` - Test file upload with detailed response

### File Structure
```
src/
├── screens/Elderly/Settings/
│   └── FaceDataCollectionScreen.tsx    # Main face recording screen
├── services/
│   └── api.ts                          # Contains uploadFaceData function
└── navigation/
    └── ElderlyNavigator.tsx            # Navigation configuration

backend/
├── upload_face_data.php                # Video upload handler
├── test_face_data_upload.php           # Upload functionality test
├── update_face_data_table.php          # Database update script
├── sql/
│   └── create_face_data_table.sql      # Database schema
└── create_face_data_table.php          # Database setup script
```

## User Flow

1. **Access**: User navigates to Settings → "Dữ liệu khuôn mặt"
2. **Permission**: App requests camera permission if not granted
3. **Recording**: User starts recording their face (minimum 5 seconds recommended)
4. **Preview**: User can review recording and retake if needed
5. **Upload**: Video is uploaded to server with user authentication
6. **Confirmation**: Success message shows whether file was appended or newly uploaded
7. **Return**: User returns to settings

## Security Considerations

### File Validation
- **Format**: Only MP4, AVI, MOV, WMV formats allowed
- **Size**: Maximum 50MB file size limit
- **Content**: MIME type validation
- **User**: Email-based user authentication
- **Private Key**: Validates user has valid private key

### Data Protection
- **Secure Storage**: Videos stored in protected upload directory
- **Database**: User ID and private key linked to prevent unauthorized access
- **Logging**: All uploads logged for audit trail
- **Cleanup**: Old files can be automatically cleaned up

## Technical Requirements

### Frontend Dependencies
```json
{
  "react-native-vision-camera": "^4.7.1"
}
```

### Backend Requirements
- PHP 7.4+
- MySQL 5.7+
- File upload support
- Sufficient disk space for video storage

### Permissions
- Camera access permission
- File system write permission (backend)
- Network access for uploads

## Setup Instructions

### 1. Install Dependencies
```bash
yarn add react-native-vision-camera
```

### 2. Create Database Table
```bash
# Run the database setup script
php backend/create_face_data_table.php
```

### 3. Update Existing Table (if needed)
```bash
# Update existing table with new fields
php backend/update_face_data_table.php
```

### 4. Create Upload Directory
```bash
mkdir -p backend/uploads/face_data
chmod 755 backend/uploads/face_data
```

### 5. Configure Server
- Ensure PHP has file upload enabled
- Set appropriate `upload_max_filesize` and `post_max_size` in php.ini
- Configure web server to handle large file uploads
- **Install FFmpeg** for video concatenation (recommended):
  ```bash
  # Ubuntu/Debian
  sudo apt update && sudo apt install ffmpeg
  
  # CentOS/RHEL
  sudo yum install epel-release && sudo yum install ffmpeg
  
  # Check installation
  php backend/check_ffmpeg.php
  ```

## Usage Examples

### Recording Video
```typescript
// Start recording
await camera.current.startRecording({
  onRecordingFinished: (video) => {
    setRecordedVideoPath(video.path);
  },
  onRecordingError: (error) => {
    console.error('Recording error:', error);
  },
});
```

### Uploading Video
```typescript
const result = await uploadFaceData(user.email, videoPath);
if (result.success) {
  const isAppended = result.data?.is_appended;
  const message = isAppended 
    ? 'Dữ liệu khuôn mặt đã được cập nhật thành công'
    : 'Dữ liệu khuôn mặt đã được tải lên thành công';
  Alert.alert('Thành công', message);
} else {
  Alert.alert('Lỗi', result.message);
}
```

## Debugging Tools

### Test Buttons
- **Server Status**: Tests basic server connectivity
- **Test Upload**: Tests FormData without files
- **Test Alternative**: Tests different file URI formats
- **Test File Upload**: Tests actual file upload with detailed response

### Console Logging
- **Detailed Error Information**: Shows exact URLs, headers, and error codes
- **File Path Debugging**: Logs video path and file information
- **Network Error Handling**: Specific handling for network errors

### FFmpeg Verification
- **`/check_ffmpeg.php`**: Comprehensive FFmpeg availability and functionality test
- **Installation Instructions**: Automatic detection and setup guidance
- **Concatenation Testing**: Validates video concatenation capability

## Future Enhancements

### Potential Features
- **Face Recognition**: Use uploaded videos for user identification
- **Emotion Detection**: Analyze facial expressions for health monitoring
- **Video Processing**: Automatic video compression and optimization
- **Batch Upload**: Support for multiple video uploads
- **Progress Tracking**: Real-time upload progress with resume capability
- **Video Preview**: Thumbnail generation for uploaded videos

### AI Integration
- **Face Detection**: Validate that video contains a face
- **Quality Assessment**: Automatically assess video quality
- **Duplicate Detection**: Prevent duplicate face data uploads
- **Health Indicators**: Analyze facial features for health insights

## Troubleshooting

### Common Issues
1. **Camera Permission Denied**: Guide user to app settings
2. **Upload Timeout**: Increase timeout settings for large files
3. **Storage Full**: Monitor disk space and implement cleanup
4. **Network Errors**: Implement retry mechanism for failed uploads
5. **Private Key Missing**: Ensure user has valid private key

### Debug Information
- All API calls are logged with detailed error information
- File uploads include size, format, and user information
- Database operations are tracked with timestamps
- File appending status is tracked in database 