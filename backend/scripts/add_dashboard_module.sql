-- Add Dashboard Module and Permissions
-- Run this SQL script in your MySQL database to add the dashboard module

-- Insert the dashboard module
INSERT INTO modules (module_name, createdAt, updatedAt) 
VALUES ('dashboard_permission', NOW(), NOW())
ON DUPLICATE KEY UPDATE updatedAt = NOW();

-- Get the module_id for dashboard_permission
SET @dashboard_module_id = (SELECT module_id FROM modules WHERE module_name = 'dashboard_permission' LIMIT 1);

-- Insert permissions for dashboard module
INSERT INTO permissions (module_id, permission_name, createdAt, updatedAt)
VALUES 
  (@dashboard_module_id, 'canView', NOW(), NOW())
ON DUPLICATE KEY UPDATE updatedAt = NOW();

-- Grant dashboard permissions to admin role (assuming role_id = 1 is admin)
-- Get the permission_id
SET @view_permission_id = (SELECT permission_id FROM permissions WHERE module_id = @dashboard_module_id AND permission_name = 'canView' LIMIT 1);

-- Insert role permissions for admin (role_id = 1)
INSERT INTO role_permissions (role_id, permission_id, createdAt, updatedAt)
VALUES 
  (1, @view_permission_id, NOW(), NOW())
ON DUPLICATE KEY UPDATE updatedAt = NOW();

-- Verify the insertions
SELECT 'Dashboard module and permissions added successfully!' AS status;
SELECT * FROM modules WHERE module_name = 'dashboard_permission';
SELECT p.* FROM permissions p 
JOIN modules m ON p.module_id = m.module_id 
WHERE m.module_name = 'dashboard_permission';
