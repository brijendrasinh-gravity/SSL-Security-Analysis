const sequelize = require('../config/db');
const Module = require('../model/moduleModel');
const Permission = require('../model/permissionModel');
const RolePermission = require('../model/rolePermissionModel');

async function addDashboardModule() {
  try {
    console.log('Starting dashboard module setup...');

    // Create or find the dashboard module
    const [module, created] = await Module.findOrCreate({
      where: { module_name: 'dashboard_permission' },
      defaults: {
        module_name: 'dashboard_permission',
      }
    });

    console.log(created ? '✓ Dashboard module created' : '✓ Dashboard module already exists');

    // Create permission for dashboard
    const [permission, permCreated] = await Permission.findOrCreate({
      where: { 
        module_id: module.module_id,
        permission_name: 'canView'
      },
      defaults: {
        module_id: module.module_id,
        permission_name: 'canView',
      }
    });

    console.log(permCreated ? '✓ Dashboard permission created' : '✓ Dashboard permission already exists');

    // Assign permission to admin role (role_id = 1)
    const [rolePermission, rpCreated] = await RolePermission.findOrCreate({
      where: {
        role_id: 1, // Admin role
        permission_id: permission.permission_id
      },
      defaults: {
        role_id: 1,
        permission_id: permission.permission_id
      }
    });

    console.log(rpCreated ? '✓ Permission assigned to admin role' : '✓ Permission already assigned to admin');

    console.log('\n✅ Dashboard module setup completed successfully!');
    console.log(`Module ID: ${module.module_id}`);
    console.log(`Permission ID: ${permission.permission_id}`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error setting up dashboard module:', error);
    process.exit(1);
  }
}

// Run the script
addDashboardModule();
