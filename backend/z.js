exports.toggleLoginAccess = async (req, res) => {
  try {
    const { id } = req.params;

    const record = await BlockedIP.findByPk(id);
    if (!record || record.cb_deleted) {
      return res.status(404).json({
        success: false,
        message: "IP not found.",
      });
    }

    const newStatus = !record.login_access;
    await record.update({ login_access: newStatus });

    res.status(200).json({
      success: true,
      message: `Login access changed to ${newStatus}`,
      data: record,
    });

  } catch (error) {
    console.error("Error toggling login access:", error);
    res.status(500).json({
      success: false,
      message: "Error toggling login access",
      error: error.message,
    });
  }
};