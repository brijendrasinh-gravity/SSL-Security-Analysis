const GeneralSetting = require("../../model/generalSettingModel");

exports.getSettings = async (req, res) => {
  try {
    const settings = await GeneralSetting.findAll({
      where: { cb_deleted: false },
    });

    const settingsObj = {};
    settings.forEach((setting) => {
      settingsObj[setting.field_name] = setting.field_value;
    });

    res.status(200).json({
      success: true,
      message: "Settings fetched successfully",
      data: settingsObj,
    });
  } catch (error) {
    console.error("Error fetching settings:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching settings",
      error: error.message,
    });
  }
};

exports.updateSetting = async (req, res) => {
  try {
    const { field_name, field_value } = req.body;

    const setting = await GeneralSetting.findOne({
      where: { field_name, cb_deleted: false },
    });

    if (!setting) {
      return res.status(404).json({
        success: false,
        message: "Setting not found",
      });
    }

    await setting.update({ field_value });

    res.status(200).json({
      success: true,
      message: "Setting updated successfully",
      data: setting,
    });
  } catch (error) {
    console.error("Error updating setting:", error);
    res.status(500).json({
      success: false,
      message: "Error updating setting",
      error: error.message,
    });
  }
};


//limited IP access toggle
exports.updateLimitedAccessStatus = async (req, res) => {
  try {
    const { enabled } = req.body; // expect true / false

    if (typeof enabled !== "boolean") {
      return res.status(400).json({
        success: false,
        message: "enabled must be boolean (true/false)"
      });
    }

    // Find existing setting
    const setting = await GeneralSetting.findOne({
      where: { 
        field_name: "IS_LIMITED_POWERPANEL_ENABLED",
        cb_deleted: false 
      }
    });

    if (setting) {
      // Update existing record
      await setting.update({ field_value: String(enabled) });
    } else {
      // Create new record if doesn't exist
      await GeneralSetting.create({
        field_name: "IS_LIMITED_POWERPANEL_ENABLED",
        field_value: String(enabled),
        cb_deleted: false,
      });
    }

    return res.json({
      success: true,
      message: "Limited access status updated",
    });
  } catch (error) {
    console.error("updateLimitedAccessStatus error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};
