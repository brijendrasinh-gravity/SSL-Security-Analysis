const Module = require("../../model/moduleModel");
const Permission = require("../../model/permissionModel");


exports.getAllModules = async (req, res) => {
  try {
    const modules = await Module.findAll({
      include: [
        {
          model: Permission,
          as: "permissions_list",
          attributes: ["id", "name", "module_code"],
        },
      ],
      order: [["id", "ASC"]],
    });

    // 🔥 FIX: Remove \r\n and spaces from permission names
    const cleanedModules = modules.map((module) => {
      const cleanedPermissions = module.permissions_list.map((perm) => ({
        ...perm.dataValues,
        name: perm.name.trim(),         // <-- remove \r\n, spaces
        module_code: perm.module_code,  // keep module_code as is
      }));

      return {
        ...module.dataValues,
        permissions_list: cleanedPermissions,
      };
    });

    res.status(200).json({
      success: true,
      message: "Modules fetched successfully",
      data: cleanedModules,
    });
  } catch (error) {
    console.error("Error fetching modules:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch modules",
      error: error.message,
    });
  }
};

