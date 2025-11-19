const axios = require("axios");
const Virus = require("../../model/virusTotalModel");
require("dotenv").config();

exports.scanURL = async (req, res) => {
  try {
    const { scanned_url } = req.body;

    if (!scanned_url) {
      return res.status(400).json({
        success: false,
        message: "URL is required",
      });
    }

    const API_KEY = process.env.VIRUS_TOTAL_API_KEY;

    // Step 1 → Submit URL for scanning
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

    // Extract analysis ID from VirusTotal
    const analysis_id = vtResult?.data?.id;

    if (!analysis_id) {
      return res.status(500).json({
        success: false,
        message: "Failed to retrieve analysis ID from VirusTotal"
      });
    }

    // Save to DB
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
      analysis_id: analysis_id
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
    const { analysis_id } = req.params;
    const API_KEY = process.env.VIRUS_TOTAL_API_KEY;

    // Fetch full VirusTotal analysis data
    const vtResponse = await axios.get(
      `https://www.virustotal.com/api/v3/analyses/${analysis_id}`,
      {
        headers: { "x-apikey": API_KEY }
      }
    );

    const report = vtResponse.data;

    // Extract last analysis date
    const lastDate =
      report?.data?.attributes?.date
        ? new Date(report.data.attributes.date * 1000)
        : null;

    // Update DB record
    await Virus.update(
      {
        last_analysis_date: lastDate,
        scan_results: JSON.stringify(report)
      },
      { where: { analysis_id } }
    );

    return res.status(200).json({
      success: true,
      message: "Report fetched successfully",
      data: report
    });

  } catch (error) {
    console.error("Get Report Error:", error?.response?.data || error);

    return res.status(500).json({
      success: false,
      message: "Error fetching report",
      error: error?.response?.data || error.message,
    });
  }
};


exports.getHistory = async (req, res) => {
  try {
    const scans = await Virus.findAll({
      where: { cb_deleted: false },
      order: [["createdAt", "DESC"]],
    });

    return res.status(200).json({
      success: true,
      data: scans,
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