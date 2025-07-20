# VieGrand Database Setup - Hướng dẫn khắc phục lỗi MariaDB

## ❌ Lỗi gặp phải:
```
#1064 - You have an error in your SQL syntax; check the manual that corresponds to your MariaDB server version for the right syntax to use near 'DEFAULT 7'
```

## ✅ Nguyên nhân:
1. **MariaDB/MySQL không hỗ trợ DEFAULT parameter** trong stored procedures như PostgreSQL
2. **Syntax lỗi** ở stored procedure `ActivatePremiumTrial`
3. **Duplicate procedures** trong file schema gốc

## 🔧 Cách khắc phục:

### BƯỚC 1: Sử dụng file database đã sửa
Thay vì dùng `database_schema.sql`, hãy sử dụng `database_schema_fixed.sql`

```bash
# Import database đã sửa lỗi
mysql -u username -p < database_schema_fixed.sql
```

### BƯỚC 2: Các thay đổi chính đã thực hiện

#### ❌ Syntax cũ (LỖI):
```sql
CREATE PROCEDURE ActivatePremiumTrial(
    IN p_userId INT,
    IN p_trialDays INT DEFAULT 7  -- ❌ MariaDB không hỗ trợ
)
```

#### ✅ Syntax mới (ĐÚNG):
```sql
CREATE PROCEDURE ActivatePremiumTrial(
    IN p_userId INT,
    IN p_trialDays INT  -- ✅ Không có DEFAULT
)
BEGIN
    -- Set default value inside procedure
    IF p_trialDays IS NULL OR p_trialDays <= 0 THEN
        SET p_trialDays = 7;
    END IF;
    
    -- Rest of procedure...
END
```

### BƯỚC 3: Thay đổi khác đã sửa

1. **DELIMITER thay đổi:**
   ```sql
   -- Từ: DELIMITER //
   DELIMITER $$  -- Tốt hơn cho MariaDB
   ```

2. **Foreign Keys tách riêng:**
   ```sql
   -- Tạo bảng trước, add foreign key sau
   ALTER TABLE user_subscriptions 
   ADD CONSTRAINT fk_user_sub_userId FOREIGN KEY (userId) REFERENCES users(id);
   ```

3. **Loại bỏ duplicate code** ở cuối file

### BƯỚC 4: Test stored procedures

```sql
-- Test ActivatePremiumTrial
CALL ActivatePremiumTrial(2, 7);

-- Test CreateSubscription  
CALL CreateSubscription(2, 1, 'momo', 99000);

-- Test UpdateUserPremiumStatus
CALL UpdateUserPremiumStatus(2);

-- Test CheckExpiredSubscriptions
CALL CheckExpiredSubscriptions();
```

### BƯỚC 5: Import sample data

```sql
-- Sau khi tạo database thành công
source sample_data_safe.sql;
```

## 🚀 Script Setup hoàn chỉnh:

```bash
# 1. Tạo database
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS viegrand_app CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# 2. Import schema đã sửa
mysql -u root -p viegrand_app < database_schema_fixed.sql

# 3. Import sample data
mysql -u root -p viegrand_app < sample_data_safe.sql

# 4. Test connection
mysql -u root -p viegrand_app -e "SELECT COUNT(*) FROM users; SELECT COUNT(*) FROM premium_plans;"
```

## 🔍 Kiểm tra kết quả:

```sql
-- Kiểm tra bảng đã tạo
SHOW TABLES;

-- Kiểm tra stored procedures
SHOW PROCEDURE STATUS WHERE Db = 'viegrand_app';

-- Kiểm tra dữ liệu mẫu
SELECT * FROM premium_plans;
SELECT * FROM users WHERE role = 'elderly';

-- Test premium functionality
SELECT 
    u.fullName, 
    u.isPremium, 
    u.premiumEndDate,
    pp.name as planName
FROM users u 
LEFT JOIN premium_plans pp ON u.premiumPlanId = pp.id;
```

## 📝 Lưu ý quan trọng:

1. **Sử dụng `database_schema_fixed.sql`** thay vì file gốc
2. **MariaDB version**: Đã test với MariaDB 10.x 
3. **MySQL version**: Tương thích với MySQL 8.0+
4. **Character Set**: Sử dụng utf8mb4 cho hỗ trợ tiếng Việt đầy đủ

## 🎯 Kết quả mong đợi:

✅ Database tạo thành công  
✅ Tất cả bảng được tạo với foreign keys  
✅ Stored procedures hoạt động bình thường  
✅ Sample data được import  
✅ Premium APIs hoạt động  

## 📞 Hỗ trợ:

Nếu vẫn gặp lỗi:
1. Kiểm tra phiên bản MariaDB/MySQL: `SELECT VERSION();`
2. Kiểm tra quyền user: `SHOW GRANTS;`
3. Kiểm tra log lỗi database
4. Sử dụng phpMyAdmin để import từng phần
