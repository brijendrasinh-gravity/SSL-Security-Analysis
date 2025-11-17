const Blocked_IP = require('../../model/blockedipModel');
const { Op } = require("sequelize");
const { fetchIPInfo } = require('../../utils/ipChecker');

exports.createBlocked_IP = async (req, res) => {
  try {
    const { ip_address, browser_info, blocked_type } = req.body;

    const existing = await Blocked_IP.findOne({
      where: { ip_address, cb_deleted: false }
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: "IP is already blocked.",
      });
    }

    // Optionally fetch IP info from external API
    let ipInfo = browser_info;
    if (!ipInfo && ip_address) {
      const fetchedInfo = await fetchIPInfo(ip_address);
      if (fetchedInfo) {
        ipInfo = JSON.stringify({
          country: fetchedInfo.country,
          city: fetchedInfo.city,
          isp: fetchedInfo.isp,
          org: fetchedInfo.org
        });
      }
    }

    const newEntry = await Blocked_IP.create({
      ip_address,
      browser_info: ipInfo,
      blocked_type,
      login_access: false, 
    });

    res.status(201).json({
      success: true,
      message: "IP blocked successfully.",
      data: newEntry,
    });

  } catch (error) {
    console.error("Error creating blocked IP:", error);
    res.status(500).json({
      success: false,
      message: "Error creating blocked IP.",
      error: error.message,
    });
  }
};


exports.getAllBlocked_IPs = async (req, res) => {
  try {
    const { page = 1, limit = 10, ip, type, status } = req.query;

    const offset = (page - 1) * limit;

    let where = { cb_deleted: false };

    if (ip) where.ip_address = { [Op.like]: `%${ip}%` };
    if (type) where.blocked_type = type;
    if (status !== undefined) where.login_access = status === "true";

    const records = await Blocked_IP.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset,
      order: [["createdAt", "DESC"]],
    });

    res.status(200).json({
      success: true,
      message: "Blocked IPs fetched successfully",
      data: records,
    });

  } catch (error) {
    console.error("Error fetching blocked IPs:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching blocked IP list.",
      error: error.message,
    });
  }
};



exports.getBlocked_IPById = async (req, res) => {
  try {
    const { id } = req.params;

    const record = await Blocked_IP.findByPk(id);

    if (!record || record.cb_deleted) {
      return res.status(404).json({
        success: false,
        message: "Blocked IP not found.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Record fetched successfully.",
      data: record,
    });

  } catch (error) {
    console.error("Error fetching single IP:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching record.",
      error: error.message,
    });
  }
};


exports.updateBlocked_IP = async (req, res) => {
  try {
    const { id } = req.params;
    const { ip_address, browser_info, blocked_type } = req.body;

    const record = await Blocked_IP.findByPk(id);

    if (!record || record.cb_deleted) {
      return res.status(404).json({
        success: false,
        message: "IP entry not found.",
      });
    }

    await record.update({
      ip_address,
      browser_info,
      blocked_type,
    });

    res.status(200).json({
      success: true,
      message: "Record updated successfully.",
      data: record,
    });

  } catch (error) {
    console.error("Error updating record:", error);
    res.status(500).json({
      success: false,
      message: "Error updating blocked IP.",
      error: error.message,
    });
  }
};



exports.deleteBlocked_IP = async (req, res) => {
  try {
    const { id } = req.params;

    const record = await Blocked_IP.findByPk(id);
    if (!record || record.cb_deleted) {
      return res.status(404).json({
        success: false,
        message: "Record not found.",
      });
    }

    await record.update({ cb_deleted: true });
    await record.destroy();

    res.status(200).json({
      success: true,
      message: "Record deleted successfully.",
    });

  } catch (error) {
    console.error("Error deleting record:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting record.",
      error: error.message,
    });
  }
};  