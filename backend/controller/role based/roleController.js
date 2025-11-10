const Role = require('../../model/rolesModel');
const RolePermission = require('../../model/rolePermissionModel');
const Module = require('../../model/moduleModel');


// exports.createRole = async (req, res) => {
//   try {
//     const { name, is_Admin, permissions } = req.body;
//     // permissions = array like:
//     // [
//     //   { module_name: "User", canList: true, canCreate: true, canModify: true, canDelete: true },
//     //   { module_name: "Scanned Domain", canList: true, canCreate: true, canModify: false, canDelete: false }
//     // ]

//     // Create Role
//     const newRole = await Role.create({ name, is_Admin });

//     //  Validate module names
//     const modules = await Module.findAll({ attributes: ["module_name"] });
//     const validModuleNames = modules.map((m) => m.module_name);

//     // Create Role Permissions dynamically
//     const rolePermissions = permissions
//       .filter((p) => validModuleNames.includes(p.module_name))
//       .map((p) => ({
//         role_id: newRole.id,
//         module_name: p.module_name,
//         canList: !!p.canList,
//         canCreate: !!p.canCreate,
//         canModify: !!p.canModify,
//         canDelete: !!p.canDelete,
//       }));

//     await RolePermission.bulkCreate(rolePermissions);

//     res.status(201).json({
//       success: true,
//       message: "Role created successfully with permissions.",
//       data: { role: newRole, permissions: rolePermissions },
//     });
//   } catch (error) {
//     console.error("Error creating role:", error);
//     res.status(500).json({ success: false, message: "Error creating role", error: error.message });
//   }
// };

exports.createRole = async (req, res) => {
  try {
    const { name, is_Admin, permissions } = req.body;
    // permissions = array like:
    // [
    //   { module_name: "User", canList: true, canCreate: true, canModify: true, canDelete: true },
    //   { module_name: "Scanned Domain", canList: true, canCreate: true, canModify: false, canDelete: false }
    // ]

    // Check if role name already exists (and not soft-deleted)
    const existingRole = await Role.findOne({
      where: {
        name,
        cb_deleted: false, // only check among active roles
      },
    });

    if (existingRole) {
      return res.status(400).json({
        success: false,
        message: "Role name already exists. Please choose a different name.",
      });
    }

    // Create Role
    const newRole = await Role.create({ name, is_Admin });

    //  Validate module names
    const modules = await Module.findAll({ attributes: ["module_name"] });
    const validModuleNames = modules.map((m) => m.module_name);

    //  Create Role Permissions dynamically
    const rolePermissions = permissions
      .filter((p) => validModuleNames.includes(p.module_name))
      .map((p) => ({
        role_id: newRole.id,
        module_name: p.module_name,
        canList: !!p.canList,
        canCreate: !!p.canCreate,
        canModify: !!p.canModify,
        canDelete: !!p.canDelete,
      }));

    await RolePermission.bulkCreate(rolePermissions);

    res.status(201).json({
      success: true,
      message: "Role created successfully with permissions.",
      data: { role: newRole, permissions: rolePermissions },
    });
  } catch (error) {
    console.error("Error creating role:", error);
    res
      .status(500)
      .json({ success: false, message: "Error creating role", error: error.message });
  }
};

exports.getAllRoles = async (req, res) => {
  try {
    const roles = await Role.findAll({
      where:{cb_deleted:false},
      include: [
        {
          model: RolePermission,
          attributes: [
            "id",
            "module_name",
            "canList",
            "canCreate",
            "canModify",
            "canDelete",
          ],
        },
      ],
      order: [["id", "ASC"]],
    });

    res.status(200).json({
      success: true,
      message: "Roles fetched successfully.",
      data: roles,
    });
  } catch (error) {
    console.error(" Error fetching roles:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching roles.",
      error: error.message,
    });
  }
};

// GET SINGLE ROLE by ID with module-wise permissions
exports.getRoleById = async (req, res) => {
  try {
    const { id } = req.params;

    // Fetch the role
    const role = await Role.findByPk(id, {
      attributes: ["id", "name", "is_Admin"],
    });

    if (!role) {
      return res
        .status(404)
        .json({ success: false, message: "Role not found." });
    }

    // Fetch all modules
    const modules = await Module.findAll({
      attributes: ["id", "title", "module_name", "permissions"],
      order: [["id", "ASC"]],
    });

    // Fetch role's existing permissions
    const rolePermissions = await RolePermission.findAll({
      where: { role_id: id },
      attributes: [
        "module_name",
        "canList",
        "canCreate",
        "canModify",
        "canDelete",
      ],
    }); 

    // Merge modules with existing permission states
    const modulePermissions = modules.map((mod) => {
      const found = rolePermissions.find(
        (p) => p.module_name === mod.module_name
      );

      return {
        module_name: mod.module_name,
        title: mod.title,
        permissions: mod.permissions ? mod.permissions.split(",") : [],
        canList: found ? found.canList : false,
        canCreate: found ? found.canCreate : false,
        canModify: found ? found.canModify : false,
        canDelete: found ? found.canDelete : false,
      };
    });

    res.status(200).json({
      success: true,
      message: "Role fetched successfully.",
      data: {
        role,
        modulePermissions,
      },
    });
  } catch (error) {
    console.error(" Error fetching role by ID:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching role.",
      error: error.message,
    });
  }
};


//  UPDATE ROLE by ID with dynamic permissions
exports.updateRole = async (req, res) => {
  const t = await Role.sequelize.transaction(); // use transaction for safety
  try {
    const { id } = req.params;
    const { name, is_Admin, permissions } = req.body;
    //avi rite lakhvanu postman req ma
    // permissions = [
    //   { module_name: "User", canList: true, canCreate: false, canModify: true, canDelete: false },
    //   { module_name: "Scanned Domain", canList: true, canCreate: true, canModify: true, canDelete: false }
    // ];

    // Check if role exists
    const role = await Role.findByPk(id);
    if (!role) {
      return res.status(404).json({ success: false, message: "Role not found." });
    }

    //Update role basic info
    await role.update({ name, is_Admin }, { transaction: t });

    //Get valid modules
    const modules = await Module.findAll({ attributes: ["module_name"] });
    const validModuleNames = modules.map((m) => m.module_name);

    //Remove invalid module entries
    const validPermissions = permissions.filter((p) => validModuleNames.includes(p.module_name));

    //Update or create permissions per module
    for (const p of validPermissions) {
      const existing = await RolePermission.findOne({
        where: { role_id: id, module_name: p.module_name },
      });

      if (existing) {
        // Update existing record
        await existing.update(
          {
            canList: !!p.canList,
            canCreate: !!p.canCreate,
            canModify: !!p.canModify,
            canDelete: !!p.canDelete,
          },
          { transaction: t }
        );
      } else {
        // Create new permission record
        await RolePermission.create(
          {
            role_id: id,
            module_name: p.module_name,
            canList: !!p.canList,
            canCreate: !!p.canCreate,
            canModify: !!p.canModify,
            canDelete: !!p.canDelete,
          },
          { transaction: t }
        );
      }
    }

    // Remove role_permissions not present in new permissions
    const incomingModuleNames = validPermissions.map((p) => p.module_name);
    await RolePermission.destroy({
      where: {
        role_id: id,
        module_name: { [require("sequelize").Op.notIn]: incomingModuleNames },
      },
      transaction: t,
    });

    await t.commit();

    res.status(200).json({
      success: true,
      message: "Role updated successfully.",
    });
  } catch (error) {
    await t.rollback();
    console.error(" Error updating role:", error);
    res.status(500).json({
      success: false,
      message: "Error updating role.",
      error: error.message,
    });
  }
};


// exports.deleteRole = async (req, res) => {
//   const t = await Role.sequelize.transaction();
//   try {
//     const { id } = req.params;

//     // Check if role exists
//     const role = await Role.findByPk(id);
//     if (!role) {
//       return res.status(404).json({ success: false, message: "Role not found." });
//     }

//     //Optional safety check: prevent deletion of system Admin
//     if (role.is_Admin) {
//       return res.status(400).json({
//         success: false,
//         message: "Admin role cannot be deleted.",
//       });
//     }

//     //  Delete all related role_permissions
//     await RolePermission.destroy({
//       where: { role_id: id },
//       transaction: t,
//     });

//     // Delete the role itself
//     await role.destroy({ transaction: t });

//     await t.commit();

//     res.status(200).json({
//       success: true,
//       message: "Role and related permissions deleted successfully.",
//     });
//   } catch (error) {
//     await t.rollback();
//     console.error("Error deleting role:", error);
//     res.status(500).json({
//       success: false,
//       message: "Error deleting role.",
//       error: error.message,
//     });
//   }
// };


exports.deleteRole = async (req, res) => {
  try {
    const { id } = req.params;
    const role = await Role.findByPk(id);

    if (!role) {
      return res.status(404).json({
        success: false,
        message: "Role not found",
      });
    }

    // Update cb_deleted to true (1)
    await role.update({ cb_deleted: true });

    res.status(200).json({
      success: true,
      message: "Role is deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting role:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

