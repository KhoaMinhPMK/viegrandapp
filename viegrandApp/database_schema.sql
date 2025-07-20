 -- =====================================================
-- VIEGRAND APP DATABASE SCHEMA
-- =====================================================

-- Tạo database
CREATE DATABASE IF NOT EXISTS viegrand_app CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE viegrand_app;

-- =====================================================
-- BẢNG USERS (Người dùng)
-- =====================================================
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    fullName VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    age INT,
    address TEXT,
    gender ENUM('male', 'female', 'other') DEFAULT NULL,
    role ENUM('elderly', 'relative', 'admin') NOT NULL DEFAULT 'elderly',
    active BOOLEAN DEFAULT TRUE,
    email_verified_at TIMESTAMP NULL,
    
    -- Premium fields
    isPremium BOOLEAN DEFAULT FALSE,
    premiumStartDate TIMESTAMP NULL,
    premiumEndDate TIMESTAMP NULL,
    premiumPlanId INT NULL,
    premiumTrialUsed BOOLEAN DEFAULT FALSE,
    premiumTrialEndDate TIMESTAMP NULL,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_email (email),
    INDEX idx_role (role),
    INDEX idx_active (active),
    INDEX idx_isPremium (isPremium),
    INDEX idx_premiumEndDate (premiumEndDate)
);

-- =====================================================
-- BẢNG PREMIUM_PLANS (Gói Premium)
-- =====================================================
CREATE TABLE premium_plans (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    duration INT NOT NULL COMMENT 'Số ngày',
    type ENUM('monthly', 'yearly', 'lifetime') NOT NULL,
    features JSON,
    isActive BOOLEAN DEFAULT TRUE,
    sortOrder INT DEFAULT 0,
    isRecommended BOOLEAN DEFAULT FALSE,
    discountPercent DECIMAL(5,2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_isActive (isActive),
    INDEX idx_sortOrder (sortOrder),
    INDEX idx_type (type)
);

-- =====================================================
-- BẢNG USER_SUBSCRIPTIONS (Đăng ký Premium)
-- =====================================================
CREATE TABLE user_subscriptions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    userId INT NOT NULL,
    planId INT NOT NULL,
    status ENUM('active', 'expired', 'cancelled', 'pending') DEFAULT 'pending',
    startDate TIMESTAMP NULL,
    endDate TIMESTAMP NULL,
    autoRenewal BOOLEAN DEFAULT TRUE,
    nextPaymentDate TIMESTAMP NULL,
    paidAmount DECIMAL(10,2) NOT NULL,
    paymentMethod ENUM('momo', 'zalopay', 'vnpay', 'credit_card') NOT NULL,
    transactionId VARCHAR(255),
    notes TEXT,
    failedPaymentAttempts INT DEFAULT 0,
    cancelledAt TIMESTAMP NULL,
    cancelReason TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (planId) REFERENCES premium_plans(id) ON DELETE CASCADE,
    INDEX idx_userId (userId),
    INDEX idx_status (status),
    INDEX idx_endDate (endDate)
);

-- =====================================================
-- BẢNG PAYMENT_TRANSACTIONS (Giao dịch thanh toán)
-- =====================================================
CREATE TABLE payment_transactions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    userId INT NOT NULL,
    subscriptionId INT NOT NULL,
    planId INT NOT NULL,
    transactionCode VARCHAR(255) UNIQUE NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'VND',
    status ENUM('pending', 'processing', 'completed', 'failed', 'cancelled', 'refunded') DEFAULT 'pending',
    paymentMethod ENUM('momo', 'zalopay', 'vnpay', 'credit_card') NOT NULL,
    gatewayTransactionId VARCHAR(255),
    gatewayResponse JSON,
    type ENUM('subscription', 'renewal', 'refund', 'upgrade') NOT NULL,
    description TEXT,
    customerInfo JSON,
    ipAddress VARCHAR(45),
    userAgent TEXT,
    paidAt TIMESTAMP NULL,
    expiresAt TIMESTAMP NULL,
    failureReason TEXT,
    retryCount INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (subscriptionId) REFERENCES user_subscriptions(id) ON DELETE CASCADE,
    FOREIGN KEY (planId) REFERENCES premium_plans(id) ON DELETE CASCADE,
    INDEX idx_transactionCode (transactionCode),
    INDEX idx_status (status),
    INDEX idx_userId (userId),
    INDEX idx_createdAt (created_at)
);

-- =====================================================
-- BẢNG USER_SETTINGS (Cài đặt người dùng)
-- =====================================================
CREATE TABLE user_settings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    userId INT NOT NULL UNIQUE,
    language VARCHAR(10) DEFAULT 'vi',
    isDarkMode BOOLEAN DEFAULT FALSE,
    
    -- Cài đặt cho người cao tuổi
    elderly_notificationsEnabled BOOLEAN DEFAULT TRUE,
    elderly_soundEnabled BOOLEAN DEFAULT TRUE,
    elderly_vibrationEnabled BOOLEAN DEFAULT TRUE,
    
    -- Cài đặt cho người thân
    relative_appNotificationsEnabled BOOLEAN DEFAULT TRUE,
    relative_emailAlertsEnabled BOOLEAN DEFAULT TRUE,
    relative_smsAlertsEnabled BOOLEAN DEFAULT TRUE,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_userId (userId)
);

-- =====================================================
-- BẢNG ELDERLY_RELATIVES (Quan hệ người cao tuổi - người thân)
-- =====================================================
CREATE TABLE elderly_relatives (
    id INT AUTO_INCREMENT PRIMARY KEY,
    elderlyId INT NOT NULL,
    relativeId INT NOT NULL,
    relationship VARCHAR(100) NOT NULL COMMENT 'Mối quan hệ: con, cháu, vợ, chồng, etc.',
    isPrimary BOOLEAN DEFAULT FALSE COMMENT 'Người thân chính',
    canViewLocation BOOLEAN DEFAULT TRUE,
    canReceiveAlerts BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (elderlyId) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (relativeId) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_elderly_relative (elderlyId, relativeId),
    INDEX idx_elderlyId (elderlyId),
    INDEX idx_relativeId (relativeId)
);

-- =====================================================
-- BẢNG EMERGENCY_CONTACTS (Liên hệ khẩn cấp)
-- =====================================================
CREATE TABLE emergency_contacts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    userId INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    relationship VARCHAR(100),
    isPrimary BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_userId (userId)
);

-- =====================================================
-- BẢNG NOTIFICATIONS (Thông báo)
-- =====================================================
CREATE TABLE notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    userId INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type ENUM('info', 'warning', 'error', 'success') DEFAULT 'info',
    category ENUM('health', 'safety', 'reminder', 'system', 'premium') DEFAULT 'system',
    isRead BOOLEAN DEFAULT FALSE,
    data JSON,
    scheduledAt TIMESTAMP NULL,
    sentAt TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_userId (userId),
    INDEX idx_isRead (isRead),
    INDEX idx_category (category),
    INDEX idx_createdAt (created_at)
);

-- =====================================================
-- BẢNG HEALTH_RECORDS (Hồ sơ sức khỏe)
-- =====================================================
CREATE TABLE health_records (
    id INT AUTO_INCREMENT PRIMARY KEY,
    userId INT NOT NULL,
    bloodType ENUM('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'),
    allergies TEXT,
    medicalConditions TEXT,
    medications TEXT,
    emergencyNotes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_health (userId)
);

-- =====================================================
-- INSERT DỮ LIỆU MẪU
-- =====================================================

-- Thêm gói Premium mẫu
INSERT INTO premium_plans (name, description, price, duration, type, features, isActive, sortOrder, isRecommended) VALUES
('Gói Cơ Bản', 'Gói dành cho người mới bắt đầu', 99000, 30, 'monthly', '["Thông báo cơ bản", "Hỗ trợ 24/7"]', TRUE, 1, FALSE),
('Gói Premium', 'Gói cao cấp với nhiều tính năng', 199000, 30, 'monthly', '["Thông báo nâng cao", "Hỗ trợ 24/7", "Báo cáo chi tiết", "Liên hệ khẩn cấp"]', TRUE, 2, TRUE),
('Gói Năm', 'Tiết kiệm với gói dài hạn', 1990000, 365, 'yearly', '["Tất cả tính năng Premium", "Giảm giá 30%", "Ưu tiên hỗ trợ"]', TRUE, 3, FALSE),
('Gói Trọn Đời', 'Sử dụng vĩnh viễn', 9990000, 36500, 'lifetime', '["Tất cả tính năng", "Cập nhật miễn phí", "Hỗ trợ ưu tiên cao nhất"]', TRUE, 4, FALSE);

-- Thêm admin mẫu
INSERT INTO users (fullName, email, password, phone, role, active) VALUES
('Admin', 'admin@viegrand.site', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '0123456789', 'admin', TRUE);

-- Thêm người dùng mẫu
INSERT INTO users (fullName, email, password, phone, age, address, gender, role, active) VALUES
('Nguyễn Văn A', 'elderly@example.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '0987654321', 75, 'Hà Nội', 'male', 'elderly', TRUE),
('Nguyễn Thị B', 'relative@example.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '0123456789', 45, 'Hà Nội', 'female', 'relative', TRUE);

-- Thêm cài đặt mẫu
INSERT INTO user_settings (userId, language, isDarkMode, elderly_notificationsEnabled, elderly_soundEnabled, elderly_vibrationEnabled, relative_appNotificationsEnabled, relative_emailAlertsEnabled, relative_smsAlertsEnabled) VALUES
(2, 'vi', FALSE, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE),
(3, 'vi', FALSE, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE);

-- Thêm quan hệ mẫu
INSERT INTO elderly_relatives (elderlyId, relativeId, relationship, isPrimary) VALUES
(2, 3, 'con gái', TRUE);

-- Thêm liên hệ khẩn cấp mẫu
INSERT INTO emergency_contacts (userId, name, phone, relationship, isPrimary) VALUES
(2, 'Nguyễn Thị B', '0123456789', 'con gái', TRUE),
(2, 'Bệnh viện Bạch Mai', '02438689898', 'bệnh viện', FALSE);

-- Thêm hồ sơ sức khỏe mẫu
INSERT INTO health_records (userId, bloodType, allergies, medicalConditions, medications) VALUES
(2, 'A+', 'Không có', 'Huyết áp cao', 'Thuốc huyết áp');

-- =====================================================
-- TẠO VIEWS HỮU ÍCH
-- =====================================================

-- View hiển thị thông tin người dùng với subscription
CREATE VIEW user_subscription_info AS
SELECT 
    u.id,
    u.fullName,
    u.email,
    u.phone,
    u.age,
    u.address,
    u.gender,
    u.role,
    u.active,
    us.id as subscriptionId,
    us.status as subscriptionStatus,
    us.endDate as subscriptionEndDate,
    pp.name as planName,
    pp.price as planPrice,
    CASE 
        WHEN us.status = 'active' AND us.endDate > NOW() THEN TRUE
        ELSE FALSE
    END as isPremium
FROM users u
LEFT JOIN user_subscriptions us ON u.id = us.userId AND us.status = 'active'
LEFT JOIN premium_plans pp ON us.planId = pp.id;

-- View hiển thị thông báo chưa đọc
CREATE VIEW unread_notifications AS
SELECT 
    n.*,
    u.fullName as userName,
    u.email as userEmail
FROM notifications n
JOIN users u ON n.userId = u.id
WHERE n.isRead = FALSE
ORDER BY n.created_at DESC;

-- =====================================================
-- TẠO STORED PROCEDURES
-- =====================================================

-- Procedure tạo subscription mới và cập nhật user premium
DELIMITER //
CREATE PROCEDURE CreateSubscription(
    IN p_userId INT,
    IN p_planId INT,
    IN p_paymentMethod VARCHAR(20),
    IN p_paidAmount DECIMAL(10,2)
)
BEGIN
    DECLARE v_startDate TIMESTAMP;
    DECLARE v_endDate TIMESTAMP;
    DECLARE v_duration INT;
    DECLARE v_subscriptionId INT;
    
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;
    
    START TRANSACTION;
    
    -- Lấy thông tin plan
    SELECT duration INTO v_duration FROM premium_plans WHERE id = p_planId AND isActive = TRUE;
    
    IF v_duration IS NULL THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Invalid or inactive plan';
    END IF;
    
    -- Tính ngày bắt đầu và kết thúc
    SET v_startDate = NOW();
    SET v_endDate = DATE_ADD(v_startDate, INTERVAL v_duration DAY);
    
    -- Hủy subscription cũ nếu có
    UPDATE user_subscriptions 
    SET status = 'cancelled', cancelledAt = NOW(), cancelReason = 'Upgraded to new plan'
    WHERE userId = p_userId AND status = 'active';
    
    -- Tạo subscription mới
    INSERT INTO user_subscriptions (userId, planId, status, startDate, endDate, paidAmount, paymentMethod, autoRenewal)
    VALUES (p_userId, p_planId, 'active', v_startDate, v_endDate, p_paidAmount, p_paymentMethod, TRUE);
    
    SET v_subscriptionId = LAST_INSERT_ID();
    
    -- Cập nhật trạng thái premium cho user
    UPDATE users 
    SET 
        isPremium = TRUE,
        premiumStartDate = v_startDate,
        premiumEndDate = v_endDate,
        premiumPlanId = p_planId,
        updated_at = NOW()
    WHERE id = p_userId;
    
    COMMIT;
    
    SELECT v_subscriptionId as subscriptionId, v_startDate as startDate, v_endDate as endDate;
END //
DELIMITER ;

-- Procedure cập nhật trạng thái premium user
DELIMITER //
CREATE PROCEDURE UpdateUserPremiumStatus(
    IN p_userId INT
)
BEGIN
    DECLARE v_hasActiveSubscription BOOLEAN DEFAULT FALSE;
    DECLARE v_endDate TIMESTAMP;
    DECLARE v_planId INT;
    
    -- Kiểm tra subscription active
    SELECT 
        COUNT(*) > 0,
        MAX(endDate),
        MAX(planId)
    INTO v_hasActiveSubscription, v_endDate, v_planId
    FROM user_subscriptions 
    WHERE userId = p_userId 
      AND status = 'active' 
      AND endDate > NOW();
    
    -- Cập nhật trạng thái user
    IF v_hasActiveSubscription THEN
        UPDATE users 
        SET 
            isPremium = TRUE,
            premiumEndDate = v_endDate,
            premiumPlanId = v_planId,
            updated_at = NOW()
        WHERE id = p_userId;
    ELSE
        UPDATE users 
        SET 
            isPremium = FALSE,
            premiumEndDate = NULL,
            premiumPlanId = NULL,
            updated_at = NOW()
        WHERE id = p_userId;
    END IF;
    
    SELECT isPremium, premiumEndDate, premiumPlanId FROM users WHERE id = p_userId;
END //
DELIMITER ;

-- Procedure kiểm tra subscription hết hạn
DELIMITER //
CREATE PROCEDURE CheckExpiredSubscriptions()
BEGIN
    -- Cập nhật subscription hết hạn
    UPDATE user_subscriptions 
    SET status = 'expired' 
    WHERE status = 'active' AND endDate < NOW();
    
    -- Cập nhật trạng thái premium cho user có subscription hết hạn
    UPDATE users u
    LEFT JOIN user_subscriptions us ON u.id = us.userId AND us.status = 'active' AND us.endDate > NOW()
    SET 
        u.isPremium = CASE WHEN us.id IS NOT NULL THEN TRUE ELSE FALSE END,
        u.premiumEndDate = CASE WHEN us.id IS NOT NULL THEN us.endDate ELSE NULL END,
        u.premiumPlanId = CASE WHEN us.id IS NOT NULL THEN us.planId ELSE NULL END,
        u.updated_at = NOW()
    WHERE u.isPremium = TRUE OR us.id IS NOT NULL;
    
    -- Trả về số lượng subscription đã hết hạn
    SELECT ROW_COUNT() as expiredCount;
END //
DELIMITER ;

-- Procedure kích hoạt trial premium
DELIMITER //
CREATE PROCEDURE ActivatePremiumTrial(
    IN p_userId INT,
    IN p_trialDays INT
)
BEGIN
    DECLARE v_trialEndDate TIMESTAMP;
    DECLARE v_alreadyUsed BOOLEAN DEFAULT FALSE;
    
    -- Set default value if not provided
    IF p_trialDays IS NULL OR p_trialDays <= 0 THEN
        SET p_trialDays = 7;
    END IF;
    
    -- Kiểm tra user đã dùng trial chưa
    SELECT premiumTrialUsed INTO v_alreadyUsed 
    FROM users 
    WHERE id = p_userId;
    
    IF v_alreadyUsed THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Premium trial already used';
    END IF;
    
    -- Tính ngày kết thúc trial
    SET v_trialEndDate = DATE_ADD(NOW(), INTERVAL p_trialDays DAY);
    
    -- Cập nhật user trial
    UPDATE users 
    SET 
        isPremium = TRUE,
        premiumStartDate = NOW(),
        premiumEndDate = v_trialEndDate,
        premiumTrialUsed = TRUE,
        premiumTrialEndDate = v_trialEndDate,
        updated_at = NOW()
    WHERE id = p_userId;
    
    SELECT isPremium, premiumEndDate, premiumTrialEndDate FROM users WHERE id = p_userId;
END //
DELIMITER ;

-- =====================================================
-- TẠO TRIGGERS
-- =====================================================

-- Trigger tự động tạo settings khi tạo user mới
DELIMITER //
CREATE TRIGGER after_user_insert
AFTER INSERT ON users
FOR EACH ROW
BEGIN
    INSERT INTO user_settings (userId) VALUES (NEW.id);
END //
DELIMITER ;

-- Trigger tự động tạo health record khi tạo user elderly
DELIMITER //
CREATE TRIGGER after_elderly_insert
AFTER INSERT ON users
FOR EACH ROW
BEGIN
    IF NEW.role = 'elderly' THEN
        INSERT INTO health_records (userId) VALUES (NEW.id);
    END IF;
END //
DELIMITER ;

-- =====================================================
-- TẠO INDEXES BỔ SUNG
-- =====================================================

-- Index cho tìm kiếm nhanh
CREATE INDEX idx_users_search ON users(fullName, email, phone);
CREATE INDEX idx_notifications_user_type ON notifications(userId, type, isRead);
CREATE INDEX idx_transactions_user_status ON payment_transactions(userId, status, created_at);

-- =====================================================
-- COMMENTS VÀ DOCUMENTATION
-- =====================================================

/*
VIEGRAND APP DATABASE SCHEMA

Cấu trúc database cho ứng dụng chăm sóc người cao tuổi VieGrand

Các bảng chính:
1. users - Thông tin người dùng
2. premium_plans - Gói premium
3. user_subscriptions - Đăng ký premium
4. payment_transactions - Giao dịch thanh toán
5. user_settings - Cài đặt người dùng
6. elderly_relatives - Quan hệ người cao tuổi - người thân
7. emergency_contacts - Liên hệ khẩn cấp
8. notifications - Thông báo
9. health_records - Hồ sơ sức khỏe

Tác giả: VieGrand Team
Ngày tạo: 2024
Phiên bản: 1.0
*/