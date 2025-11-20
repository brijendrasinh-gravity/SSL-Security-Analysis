const axios = require("axios");
const Virus = require("../../model/virusTotalModel");
const Role = require("../../model/rolesModel");
require("dotenv").config();
const { Sequelize, Op } = require('sequelize');



exports.scanURL = async (req, res) => {
  try {
    const { scanned_url } = req.body;

    if (!scanned_url) {
      return res.status(400).json({
        success: false,
        message: "URL is required",
      });
    }

    // scanned_url = normalizeURL(scanned_url);

    const API_KEY = process.env.VIRUS_TOTAL_API_KEY;

    const vtResponse = await axios.post(
      "https://www.virustotal.com/api/v3/urls",
      new URLSearchParams({ url: scanned_url }),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "x-apikey": API_KEY,
        },
      }
    );

    const vtResult = vtResponse.data;
    const analysis_id = vtResult?.data?.id;

    if (!analysis_id) {
      return res.status(500).json({
        success: false,
        message: "Failed to retrieve analysis ID from VirusTotal",
      });
    }

    // Save to DB with analysis_id
    const newScan = await Virus.create({
      user_id: req.user.user_id,
      scanned_url,
      analysis_id,
      last_analysis_date: null,
      scan_results: null,
      cb_deleted: false,
    });

    return res.status(200).json({
      success: true,
      message: "URL submitted for analysis",
      record_id: newScan.id,
      analysis_id: analysis_id,
    });
  } catch (error) {
    console.error("URL Scan Error:", error?.response?.data || error);

    return res.status(500).json({
      success: false,
      message: "Error scanning URL",
      error: error?.response?.data || error.message,
    });
  }
};


exports.getReport = async (req, res) => {
  try {
    const { id } = req.params;

    const API_KEY =
      process.env.VIRUSTOTAL_API_KEY || process.env.VIRUS_TOTAL_API_KEY;

    if (!API_KEY) {
      return res.status(500).json({
        success: false,
        message: "VirusTotal API key missing in .env",
      });
    }

    const scan = await Virus.findOne({
      where: { id, cb_deleted: false },
    });

    if (!scan) {
      return res.status(404).json({
        success: false,
        message: "Scan record not found",
      });
    }

    const analysis_id = scan.analysis_id;

    const analysisRes = await axios.get(
      `https://www.virustotal.com/api/v3/analyses/${analysis_id}`,
      { headers: { "x-apikey": API_KEY } }
    );

    const analysisData = analysisRes.data;
    const url_id = analysisData?.meta?.url_info?.id;

    if (!url_id) {
      return res.status(400).json({
        success: false,
        message: "URL ID not found in analysis response",
      });
    }

    const fullUrlRes = await axios.get(
      `https://www.virustotal.com/api/v3/urls/${url_id}`,
      { headers: { "x-apikey": API_KEY } }
    );

    const fullReport = fullUrlRes.data?.data; 

    try {
      await Virus.update(
        {
          scan_results: JSON.stringify(fullUrlRes.data),
          last_analysis_date: fullReport?.attributes?.last_analysis_date
            ? new Date(fullReport.attributes.last_analysis_date * 1000)
            : new Date(),
        },
        { where: { id } }
      );
    } catch (dbErr) {
      console.log("DB update failed:", dbErr);
    }

    return res.status(200).json({
      success: true,
      message: "Full URL report fetched successfully",
      data: fullReport, 
    });
  } catch (error) {
    console.error(
      "GetReport Error:",
      error?.response?.data || error.message || error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to fetch full URL report",
      error: error?.response?.data || error.message,
    });
  }
};

exports.getHistory = async (req, res) => {
  try {
    const { page = 1, limit = 10, url, status } = req.query;
    const offset = (page - 1) * limit;

    const role = await Role.findByPk(req.user.role_id);

    if (!role) {
      return res.status(404).json({
        success: false,
        message: "Role not found",
      });
    }

    const whereCondition = {
      cb_deleted: false,
    };

    if (!role.is_Admin) {
      whereCondition.user_id = req.user.user_id;
    }

    // Apply filters
    if (url) {
      whereCondition.scanned_url = { [Op.like]: `%${url}%` };
    }

    if (status === "completed") {
      whereCondition.last_analysis_date = { [Op.ne]: null };
    } else if (status === "pending") {
      whereCondition.last_analysis_date = null;
    }

    // STEP 1: Get latest IDs grouped by scanned_url
    const latestRecords = await Virus.findAll({
      attributes: [
        "scanned_url",
        [Sequelize.fn("MAX", Sequelize.col("id")), "latestId"],
      ],
      where: whereCondition,
      group: ["scanned_url"],
    });

    const latestIds = latestRecords.map((r) => r.dataValues.latestId);

    // STEP 2: Fetch only the latest full records with pagination
    const { count, rows } = await Virus.findAndCountAll({
      where: {
        id: latestIds,
      },
      limit: parseInt(limit),
      offset,
      order: [["createdAt", "DESC"]],
    });

    return res.status(200).json({
      success: true,
      message: "Scan history fetched successfully",
      data: {
        rows,
        count,
      },
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error fetching history",
      error: error.message,
    });
  }
};

exports.getSingleScan = async (req, res) => {
  try {
    const { id } = req.params;

    const scan = await Virus.findOne({
      where: { id, cb_deleted: false },
    });

    if (!scan) {
      return res.status(404).json({
        success: false,
        message: "Scan record not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: scan,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error fetching scan data",
      error: error.message,
    });
  }
};

exports.deleteScan = async (req, res) => {
  try {
    const { id } = req.params;

    const scan = await Virus.findByPk(id);

    if (!scan) {
      return res.status(404).json({
        success: false,
        message: "Scan not found",
      });
    }

    scan.cb_deleted = true;
    await scan.save();

    return res.status(200).json({
      success: true,
      message: "Scan deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error deleting scan",
      error: error.message,
    });
  }
};

exports.rescanURL = async (req, res) => {
  try {
    const { id } = req.params;

    const oldScan = await Virus.findOne({
      where: { id, cb_deleted: false }
    });

    if (!oldScan) {
      return res.status(404).json({
        success: false,
        message: "Original scan not found",
      });
    }

    const scanned_url = oldScan.scanned_url;
    const API_KEY = process.env.VIRUS_TOTAL_API_KEY;

    //Send URL again to VirusTotal
    const vtResponse = await axios.post(
      "https://www.virustotal.com/api/v3/urls",
      new URLSearchParams({ url: scanned_url }),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "x-apikey": API_KEY,
        },
      }
    );

    const analysis_id = vtResponse?.data?.data?.id;

    if (!analysis_id) {
      return res.status(500).json({
        success: false,
        message: "Failed to retrieve analysis ID",
      });
    }

    //CREATE a NEW ENTRY (very important)
    const newScan = await Virus.create({
      user_id: req.user.user_id,
      scanned_url,
      analysis_id,
      last_analysis_date: null,
      scan_results: null,
      cb_deleted: false,
    });

    return res.status(200).json({
      success: true,
      message: "URL resubmitted for analysis",
      record_id: newScan.id,
      analysis_id,
    });

  } catch (error) {
    console.error("Rescan Error:", error);
    return res.status(500).json({
      success: false,
      message: "Error rescanning URL",
      error: error.message,
    });
  }
};
