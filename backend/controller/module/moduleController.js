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

    res.status(200).json({
      success: true,
      message: "Modules fetched successfully",
      data: modules,
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
