-- Add last_password_reminder column to users table if not exists
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS last_password_reminder TIMESTAMP NULL;

-- Insert PASSWORD_EXPIRY_DAYS setting if not exists
INSERT INTO general_settings (field_name, field_value, cb_deleted, createdAt, updatedAt)
SELECT 'PASSWORD_EXPIRY_DAYS', '90', false, NOW(), NOW()
WHERE NOT EXISTS (
    SELECT 1 FROM general_settings WHERE field_name = 'PASSWORD_EXPIRY_DAYS'
);

-- Update existing users to set password_changed_at to current date if NULL
UPDATE users 
SET password_changed_at = NOW() 
WHERE password_changed_at IS NULL;
