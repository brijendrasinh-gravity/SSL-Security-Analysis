-- ============================================
-- TEST PASSWORD EXPIRY FEATURE
-- ============================================

-- STEP 1: Check current settings
SELECT * FROM general_settings WHERE field_name = 'PASSWORD_EXPIRY_DAYS';

-- STEP 2: Check your user's password age
SELECT 
    id,
    email,
    user_name,
    password_changed_at,
    DATEDIFF(NOW(), password_changed_at) as days_old,
    last_password_reminder
FROM users 
WHERE email = 'YOUR_EMAIL_HERE';

-- ============================================
-- TEST SCENARIO 1: EXPIRED PASSWORD (91 days old)
-- ============================================
-- This will force password change on next login
UPDATE users 
SET password_changed_at = DATE_SUB(NOW(), INTERVAL 91 DAY),
    last_password_reminder = NULL
WHERE email = 'YOUR_EMAIL_HERE';

-- Expected Result: Login fails, redirects to change password page
-- Error message: "Your password has expired. Please change your password."

-- ============================================
-- TEST SCENARIO 2: REMINDER (84 days old = 6 days remaining)
-- ============================================
-- This will show reminder popup on login
UPDATE users 
SET password_changed_at = DATE_SUB(NOW(), INTERVAL 84 DAY),
    last_password_reminder = NULL
WHERE email = 'YOUR_EMAIL_HERE';

-- Expected Result: Login succeeds, shows popup "Your password will expire in 6 days"

-- ============================================
-- TEST SCENARIO 3: REMINDER (86 days old = 4 days remaining)
-- ============================================
UPDATE users 
SET password_changed_at = DATE_SUB(NOW(), INTERVAL 86 DAY),
    last_password_reminder = NULL
WHERE email = 'YOUR_EMAIL_HERE';

-- Expected Result: Login succeeds, shows popup "Your password will expire in 4 days"

-- ============================================
-- TEST SCENARIO 4: NO REMINDER (50 days old = 40 days remaining)
-- ============================================
UPDATE users 
SET password_changed_at = DATE_SUB(NOW(), INTERVAL 50 DAY),
    last_password_reminder = NULL
WHERE email = 'YOUR_EMAIL_HERE';

-- Expected Result: Login succeeds normally, no popup

-- ============================================
-- TEST SCENARIO 5: TEST "ONCE PER DAY" REMINDER
-- ============================================
-- Set password to 85 days old and last reminder to today
UPDATE users 
SET password_changed_at = DATE_SUB(NOW(), INTERVAL 85 DAY),
    last_password_reminder = NOW()
WHERE email = 'YOUR_EMAIL_HERE';

-- Expected Result: Login succeeds, NO popup (already reminded today)

-- ============================================
-- RESET TO NORMAL (Fresh password)
-- ============================================
UPDATE users 
SET password_changed_at = NOW(),
    last_password_reminder = NULL
WHERE email = 'YOUR_EMAIL_HERE';

-- ============================================
-- QUICK TEST: Set expiry to 1 day for immediate testing
-- ============================================
UPDATE general_settings 
SET field_value = '1' 
WHERE field_name = 'PASSWORD_EXPIRY_DAYS';

-- Then set password to 2 days old to test expiration
UPDATE users 
SET password_changed_at = DATE_SUB(NOW(), INTERVAL 2 DAY)
WHERE email = 'YOUR_EMAIL_HERE';

-- Don't forget to reset back to 90 days after testing!
UPDATE general_settings 
SET field_value = '90' 
WHERE field_name = 'PASSWORD_EXPIRY_DAYS';
