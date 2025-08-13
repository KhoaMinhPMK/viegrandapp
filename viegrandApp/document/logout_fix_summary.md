# Logout Fix for Relative Flow

## Issue
The "Log out" feature was not working properly in the relative flow. Users could click the logout button but it would not properly clear user data and navigate back to the login screen.

## Root Cause
The relative settings and profile screens had logout buttons but the `handleLogout` functions were not properly implemented:
1. **Relative Settings Screen**: Had a basic logout call but no navigation reset
2. **Relative Profile Screen**: Had a logout button but no functionality at all

## Fixes Applied

### 1. Fixed Relative Settings Screen (`src/screens/Relative/Settings/index.tsx`)

**Before:**
```typescript
const handleLogout = () => {
  Alert.alert(
    'Đăng xuất',
    'Bạn có chắc chắn muốn đăng xuất không?',
    [
      { text: 'Hủy', style: 'cancel' },
      { text: 'Đăng xuất', style: 'destructive', onPress: () => logout() },
    ],
    { cancelable: true }
  );
};
```

**After:**
```typescript
const handleLogout = async () => {
  Alert.alert(
    'Đăng xuất',
    'Bạn có chắc chắn muốn đăng xuất không? Tất cả dữ liệu sẽ bị xóa.',
    [
      { text: 'Hủy', style: 'cancel' },
      { 
        text: 'Đăng xuất', 
        style: 'destructive', 
        onPress: async () => {
          try {
            console.log('🔄 User confirmed logout');
            
            // Thực hiện logout
            await logout();
            
            // Navigate về root level và chọn Auth route với Login screen
            navigation.reset({
              index: 0,
              routes: [{ 
                name: 'Auth',
                params: {
                  screen: 'Login'
                }
              }],
            });
            
            console.log('✅ Logout completed and navigated to Login');
          } catch (error) {
            console.error('Error during logout:', error);
            Alert.alert('Lỗi', 'Có lỗi xảy ra khi đăng xuất');
          }
        }
      },
    ],
    { cancelable: true }
  );
};
```

### 2. Fixed Relative Profile Screen (`src/screens/Relative/Profile/index.tsx`)

**Added imports:**
```typescript
import { Alert } from 'react-native';
import { useAuth } from '../../../contexts/AuthContext';
```

**Added logout functionality:**
```typescript
const { logout } = useAuth();

const handleLogout = async () => {
  Alert.alert(
    'Đăng xuất',
    'Bạn có chắc chắn muốn đăng xuất không? Tất cả dữ liệu sẽ bị xóa.',
    [
      { text: 'Hủy', style: 'cancel' },
      { 
        text: 'Đăng xuất', 
        style: 'destructive', 
        onPress: async () => {
          try {
            console.log('🔄 User confirmed logout from profile');
            
            // Thực hiện logout
            await logout();
            
            // Navigate về root level và chọn Auth route với Login screen
            navigation.reset({
              index: 0,
              routes: [{ 
                name: 'Auth',
                params: {
                  screen: 'Login'
                }
              }],
            });
            
            console.log('✅ Logout completed and navigated to Login');
          } catch (error) {
            console.error('Error during logout:', error);
            Alert.alert('Lỗi', 'Có lỗi xảy ra khi đăng xuất');
          }
        }
      },
    ],
    { cancelable: true }
  );
};
```

**Connected logout button:**
```typescript
<TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
  <Feather name="log-out" size={24} color="#FF6B6B" />
  <Text style={styles.logoutText}>Đăng xuất</Text>
</TouchableOpacity>
```

## How It Works Now

### 1. User Clicks Logout
- User clicks logout button in either Settings or Profile screen
- Confirmation dialog appears with warning about data deletion

### 2. User Confirms Logout
- `logout()` function from AuthContext is called
- This clears all user data from AsyncStorage:
  - `access_token`
  - `user`
  - `user_email`
  - `user_phone`
  - `premium_status`
  - `premium_end_date`
  - `premium_days_remaining`

### 3. Navigation Reset
- Navigation stack is reset to prevent back navigation
- User is redirected to Login screen
- All previous screens are cleared from navigation history

### 4. State Reset
- User state is set to null
- All contexts (Auth, Settings, Socket) are reset
- App returns to initial state

## Testing

### Manual Testing Steps:
1. **Login as relative user**
2. **Navigate to Settings screen**
3. **Click "Đăng xuất" button**
4. **Confirm logout in dialog**
5. **Verify user is redirected to Login screen**
6. **Verify user data is cleared (try to access protected screens)**
7. **Repeat test from Profile screen**

### Expected Behavior:
- ✅ Confirmation dialog appears
- ✅ User data is cleared from AsyncStorage
- ✅ Navigation resets to Login screen
- ✅ No back navigation possible
- ✅ User state is reset to null
- ✅ All contexts are properly reset

## Security Considerations

1. **Complete Data Clearance**: All user-related data is removed from AsyncStorage
2. **Navigation Reset**: Prevents access to protected screens after logout
3. **State Reset**: Ensures no user data remains in memory
4. **Error Handling**: Proper error handling with user feedback

## Consistency

The relative flow logout now works exactly the same as the elderly flow logout, ensuring consistent user experience across both flows. 