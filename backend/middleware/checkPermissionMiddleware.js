const Role = require("../model/rolesModel");
const RolePermission = require('../model/rolePermissionModel');

exports.checkPermission = (moduleName, action) => {
  return async (req, res, next) => {
    try {
      const roleId = req.user.role_id; // now available from JWT

      if (!roleId) {
        return res.status(403).json({
          success: false,
          message: "User has no role assigned.",
        });
      }

      // Find Role
      const role = await Role.findByPk(roleId);
      if (!role) {
        return res.status(404).json({ success: false, message: "Role not found." });
      }

      //Bypass check if user is admin
      if (role.is_Admin) return next();

      //Check permissions for that module
      const rolePermission = await RolePermission.findOne({
        where: { role_id: roleId, module_name: moduleName },
      });

      if (!rolePermission) {
        return res.status(403).json({
          success: false,
          message: `No permission record for module '${moduleName}'.`,
        });
      }

      // Check specific action (e.g. "canCreate")
      if (!rolePermission[action]) {
        return res.status(403).json({
          success: false,
          message: `Access denied: missing '${action}' permission for '${moduleName}'.`,
        });
      }

      //Access granted
      next();
    } catch (error) {
      console.error("Permission check failed:", error);
      res.status(500).json({
        success: false,
        message: "Error validating permissions.",
        error: error.message,
      });
    }
  };
};
