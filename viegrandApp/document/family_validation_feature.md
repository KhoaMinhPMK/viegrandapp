# Family Validation Feature

## Overview
This feature prevents elderly users from being added to multiple families in the premium subscription system. Each elderly user can only belong to one family at a time.

## Implementation Details

### Backend Validation (`backend/add_elderly_to_premium.php`)

**New Check Added:**
```php
// Check if this elderly user is already in another premium subscription
$checkOtherPremiumStmt = $pdo->prepare("
    SELECT ps.premium_key, ps.young_person_key, u.userName as relative_name 
    FROM premium_subscriptions_json ps 
    JOIN user u ON u.private_key = ps.young_person_key 
    WHERE JSON_CONTAINS(ps.elderly_keys, ?) 
    AND ps.young_person_key != ?
");
$checkOtherPremiumStmt->execute([json_encode($elderlyPrivateKey), $relative['private_key']]);
$existingPremium = $checkOtherPremiumStmt->fetch();

if ($existingPremium) {
    echo json_encode([
        'success' => false, 
        'message' => "Người thân này đã thuộc về gia đình khác (quản lý bởi: {$existingPremium['relative_name']}). Không thể thêm vào gia đình này."
    ]);
    exit;
}
```

### Frontend Error Handling (`src/screens/Premium/PremiumManagementScreen.tsx`)

**Enhanced Error Display:**
```typescript
} else {
  // Check if it's the specific error about elderly already in another family
  if (result.message && result.message.includes('đã thuộc về gia đình khác')) {
    Alert.alert(
      'Không thể thêm người thân', 
      result.message,
      [{ text: 'OK', style: 'default' }]
    );
  } else {
    Alert.alert('Lỗi', result.message || 'Không thể thêm người thân vào gói Premium');
  }
}
```

## Scenarios

### ✅ Scenario 1: Elderly Not in Any Family
- **Result**: User can be added to any family
- **Message**: Success message with elderly count

### ✅ Scenario 2: Elderly Already in Current Family
- **Result**: User can be re-added (handled by existing duplicate check)
- **Message**: "This elderly user is already in the premium subscription"

### ❌ Scenario 3: Elderly in Another Family
- **Result**: Addition is blocked
- **Message**: "Người thân này đã thuộc về gia đình khác (quản lý bởi: [Relative Name]). Không thể thêm vào gia đình này."

## Database Query Logic

The validation uses a sophisticated SQL query that:
1. **Searches All Subscriptions**: Checks every premium subscription in the database
2. **Uses JSON_CONTAINS**: Properly searches JSON arrays for the elderly key
3. **Excludes Current Family**: Prevents false positives from the current relative's subscription
4. **Gets Relative Info**: Joins with user table to get the relative's name for the error message

```sql
SELECT ps.premium_key, ps.young_person_key, u.userName as relative_name 
FROM premium_subscriptions_json ps 
JOIN user u ON u.private_key = ps.young_person_key 
WHERE JSON_CONTAINS(ps.elderly_keys, ?) 
AND ps.young_person_key != ?
```

## Testing

Use the test file `backend/test_elderly_family_check.php` to verify the validation logic:

```bash
# Test with specific elderly key
curl "https://viegrand.site/backend/test_elderly_family_check.php?elderly_private_key=test_key&exclude_relative_key=relative_key_1"
```

## Benefits

1. **Data Integrity**: Ensures each elderly user belongs to only one family
2. **Clear Error Messages**: Users understand why addition failed
3. **Family Context**: Shows which relative manages the other family
4. **Prevents Conflicts**: Avoids data inconsistencies and user confusion 