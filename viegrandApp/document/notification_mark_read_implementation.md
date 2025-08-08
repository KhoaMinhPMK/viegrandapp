# Notification Mark as Read Implementation

## Overview
This document describes the implementation of the "Mark as Read" functionality for notifications in both elderly and relative flows.

## Architecture

### Backend API (`backend/mark_notification_read.php`)
- **Method**: POST
- **Parameters**: 
  - `user_phone`: User's phone number
  - `notification_ids`: Array of notification IDs to mark as read
- **Functionality**: Updates notifications table to set `is_read = TRUE` and `read_at = NOW()`

### Frontend API Service (`src/services/api.ts`)
- **Function**: `markNotificationsRead(userPhone: string, notificationIds: number[])`
- **Returns**: Success status and count of marked notifications

### Socket Context (`src/contexts/SocketContext.tsx`)
- **Function**: `markAsRead(ids: number[])`
- **Features**:
  - Optimistic UI updates (immediate visual feedback)
  - API call to backend
  - Error handling with UI rollback

## Implementation Details

### Elderly Flow
1. **Notifications Screen** (`src/screens/Elderly/Notifications/index.tsx`)
   - Dedicated notifications screen with full functionality
   - Individual mark as read on tap
   - Mark all as read button
   - Delete notifications

2. **Home Screen** (`src/screens/Elderly/Home/index.tsx`)
   - Uses Header component with NotificationDropdown
   - `handleNotificationsUpdate` callback calls `markAsRead`

### Relative Flow
1. **Home Screen** (`src/screens/Relative/Home/index.tsx`)
   - Uses same Header component as elderly
   - `handleNotificationsUpdate` callback calls `markAsRead`
   - Fixed implementation to properly call API

2. **Notifications Screen** (`src/screens/Relative/Notifications/index.tsx`)
   - New dedicated notifications screen for relatives
   - Same functionality as elderly notifications screen
   - Added to RelativeNavigator

## User Experience

### Mark as Read Actions
1. **Individual Notification Tap**
   - User taps on notification in dropdown
   - Notification immediately appears as read
   - API call updates database

2. **Mark All as Read**
   - User clicks "Đánh dấu đã đọc" button
   - All unread notifications marked as read
   - Optimistic UI update

3. **Notifications Screen**
   - Tap individual notification to mark as read
   - "Mark all as read" button for bulk action
   - Delete notifications with confirmation

### Visual Feedback
- **Unread**: Bold styling, unread indicator dot
- **Read**: Faded styling, no indicator
- **Loading**: Optimistic updates with error rollback

## Database Schema

```sql
CREATE TABLE notifications (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_phone VARCHAR(20) NOT NULL,
  title VARCHAR(255) NOT NULL,
  body TEXT,
  type VARCHAR(50),
  data JSON,
  is_read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## API Endpoints

### Mark Notifications as Read
```
POST /backend/mark_notification_read.php
Content-Type: application/json

{
  "user_phone": "user_phone_number",
  "notification_ids": [1, 2, 3]
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "markedAsReadCount": 3
  },
  "message": "Notifications marked as read"
}
```

## Testing

### Test File
- `backend/test_mark_notification_read.php`
- Tests database connectivity
- Shows sample notifications
- Tests mark as read functionality
- Provides API testing instructions

### Manual Testing
1. Create test notifications in database
2. Use app to mark notifications as read
3. Verify database updates
4. Check UI updates

## Error Handling

### Backend Errors
- Invalid JSON format
- Missing required fields
- Database connection errors
- SQL execution errors

### Frontend Errors
- Network connection issues
- API response errors
- UI rollback on failure

## Security Considerations

1. **User Validation**: Only users can mark their own notifications as read
2. **SQL Injection Protection**: Prepared statements used
3. **Input Validation**: Phone number and notification IDs validated
4. **Error Logging**: Errors logged for debugging

## Performance Optimizations

1. **Optimistic Updates**: UI updates immediately for better UX
2. **Batch Operations**: Multiple notifications marked in single API call
3. **Error Rollback**: UI reverts on API failure
4. **Memoized Callbacks**: Prevents unnecessary re-renders

## Future Enhancements

1. **Real-time Updates**: Socket notifications for read status
2. **Bulk Operations**: Select multiple notifications for batch actions
3. **Read Receipts**: Show when notifications were read
4. **Notification Categories**: Filter by notification type 