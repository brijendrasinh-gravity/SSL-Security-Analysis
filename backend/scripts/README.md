# Dashboard Module Setup

This directory contains scripts to add the Dashboard module and its permissions to your database.

## Option 1: Using Node.js Script (Recommended)

Run the following command from the backend directory:

```bash
node scripts/addDashboardModule.js
```

This will:
- Create the `dashboard_permission` module
- Add the `canView` permission
- Assign the permission to the admin role (role_id = 1)

## Option 2: Using SQL Script

If you prefer to run SQL directly, execute the `add_dashboard_module.sql` file in your MySQL database:

```bash
mysql -u your_username -p your_database_name < scripts/add_dashboard_module.sql
```

Or copy and paste the SQL content directly into your MySQL client.

## Verification

After running either script, verify the setup by checking:

1. **Modules table**: Should contain `dashboard_permission`
2. **Permissions table**: Should contain `canView` for the dashboard module
3. **Role_permissions table**: Should have the permission assigned to admin role

## Manual Setup (Alternative)

If you prefer to add manually through your application's role management interface:

1. Login as admin
2. Go to Role & Permission management
3. The `dashboard_permission` module should appear
4. Assign `canView` permission to desired roles

## Troubleshooting

If you encounter errors:
- Ensure your database connection is configured correctly in `backend/config/db.js`
- Check that the modules, permissions, and role_permissions tables exist
- Verify that role_id = 1 exists in your roles table (admin role)
