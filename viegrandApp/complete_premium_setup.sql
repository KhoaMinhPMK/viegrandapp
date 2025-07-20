-- Complete database setup for viegrand premium
-- Run this in your MySQL/MariaDB

USE viegrand_app;

-- Create premium_plans table
CREATE TABLE IF NOT EXISTS premium_plans (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    duration INT NOT NULL COMMENT 'Duration in days',
    type ENUM('monthly', 'yearly', 'lifetime') NOT NULL,
    features JSON,
    isActive BOOLEAN DEFAULT TRUE,
    sortOrder INT DEFAULT 0,
    isRecommended BOOLEAN DEFAULT FALSE,
    discountPercent DECIMAL(5,2) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create user_subscriptions table  
CREATE TABLE IF NOT EXISTS user_subscriptions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    userId INT NOT NULL,
    planId INT NOT NULL,
    status ENUM('active', 'expired', 'cancelled', 'pending') DEFAULT 'pending',
    startDate DATETIME NOT NULL,
    endDate DATETIME NOT NULL,
    paidAmount DECIMAL(10,2) NOT NULL,
    paymentMethod VARCHAR(50),
    autoRenewal BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (planId) REFERENCES premium_plans(id)
);

-- Create payment_transactions table
CREATE TABLE IF NOT EXISTS payment_transactions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    userId INT NOT NULL,
    subscriptionId INT,
    planId INT,
    transactionCode VARCHAR(100) UNIQUE NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'VND',
    status ENUM('pending', 'completed', 'failed', 'cancelled', 'refunded') DEFAULT 'pending',
    paymentMethod VARCHAR(50),
    type ENUM('subscription', 'renewal', 'upgrade', 'refund') DEFAULT 'subscription',
    description TEXT,
    paymentDetails JSON,
    paidAt DATETIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (subscriptionId) REFERENCES user_subscriptions(id),
    FOREIGN KEY (planId) REFERENCES premium_plans(id)
);

-- Add premium columns to users table if not exists
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS isPremium BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS premiumStartDate DATETIME NULL,
ADD COLUMN IF NOT EXISTS premiumEndDate DATETIME NULL,
ADD COLUMN IF NOT EXISTS premiumPlanId INT NULL;

-- Insert sample premium plans
INSERT IGNORE INTO premium_plans (id, name, description, price, duration, type, features, isActive, sortOrder, isRecommended) VALUES
(1, 'Gói Cơ Bản', 'Gói dành cho người mới bắt đầu', 99000.00, 30, 'monthly', 
 JSON_ARRAY('Thông báo cơ bản', 'Hỗ trợ 24/7'), TRUE, 1, FALSE),
(2, 'Gói Premium', 'Gói cao cấp với nhiều tính năng', 199000.00, 30, 'monthly', 
 JSON_ARRAY('Thông báo nâng cao', 'Hỗ trợ 24/7', 'Báo cáo chi tiết', 'Liên hệ khẩn cấp'), TRUE, 2, TRUE),
(3, 'Gói Năm', 'Tiết kiệm với gói dài hạn', 1990000.00, 365, 'yearly', 
 JSON_ARRAY('Tất cả tính năng Premium', 'Giảm giá 30%', 'Ưu tiên hỗ trợ'), TRUE, 3, FALSE),
(4, 'Gói Trọn Đời', 'Sử dụng vĩnh viễn', 9990000.00, 36500, 'lifetime', 
 JSON_ARRAY('Tất cả tính năng', 'Cập nhật miễn phí', 'Hỗ trợ ưu tiên cao nhất'), TRUE, 4, FALSE);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_userId ON user_subscriptions(userId);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_status ON user_subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_userId ON payment_transactions(userId);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_status ON payment_transactions(status);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_code ON payment_transactions(transactionCode);

-- Create view for active subscriptions
CREATE OR REPLACE VIEW active_subscriptions AS
SELECT 
    us.*,
    pp.name as planName,
    pp.type as planType,
    pp.features as planFeatures
FROM user_subscriptions us
JOIN premium_plans pp ON us.planId = pp.id
WHERE us.status = 'active' AND us.endDate > NOW();

-- Create view for subscription history
CREATE OR REPLACE VIEW subscription_history AS
SELECT 
    us.*,
    pp.name as planName,
    pt.transactionCode,
    pt.status as paymentStatus,
    pt.paidAt
FROM user_subscriptions us
JOIN premium_plans pp ON us.planId = pp.id
LEFT JOIN payment_transactions pt ON us.id = pt.subscriptionId
ORDER BY us.created_at DESC;

COMMIT;
