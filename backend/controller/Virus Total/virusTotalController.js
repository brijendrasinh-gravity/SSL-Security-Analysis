const axios = require("axios");
const Virus = require("../../model/virusTotalModel");
const Role = require("../../model/rolesModel");
require("dotenv").config();


//function to shorted the url
// const normalizeURL = (url) => {
//   if (!url) return url;

//   // Trim spaces
//   url = url.trim();

//   // If user enters domain like "example.com"
//   if (!url.startsWith("http://") && !url.startsWith("https://")) {
//     return "https://" + url;
//   }

//   return url;
// };



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


// exports.getHistory = async (req, res) => {
//   try {
//     const userRole = req.user.role_id;

//     // Fetch the role to check is_Admin
//     const role = await Role.findByPk(userRole);

//     if (!role) {
//       return res.status(404).json({
//         success: false,
//         message: "Role not found",
//       });
//     }

//     let scans;

//     if (role.is_Admin) {
//       // ✅ Admin: See ALL records
//       scans = await Virus.findAll({
//         where: { cb_deleted: false },
//         order: [["createdAt", "DESC"]],
//       });
//     } else {
//       // ❌ Not Admin: See only OWN records
//       scans = await Virus.findAll({
//         where: { 
//           user_id: req.user.user_id,
//           cb_deleted: false
//         },
//         order: [["createdAt", "DESC"]],
//       });
//     }

//     return res.status(200).json({
//       success: true,
//       data: scans,
//     });

//   } catch (error) {
//     return res.status(500).json({
//       success: false,
//       message: "Error fetching history",
//       error: error.message,
//     });
//   }
// };

exports.getHistory = async (req, res) => {
  try {
    // Fetch all scans in DESC order (newest first)
    const scans = await Virus.findAll({
      where: { cb_deleted: false },
      order: [["createdAt", "DESC"]],
    });

    // Keep latest record for each scanned_url
    const uniqueMap = new Map();

    for (const scan of scans) {
      if (!uniqueMap.has(scan.scanned_url)) {
        uniqueMap.set(scan.scanned_url, scan);
      }
    }

    const uniqueLatestRecords = Array.from(uniqueMap.values());

    return res.status(200).json({
      success: true,
      data: uniqueLatestRecords,
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

exports.reScan = async (req, res) => {
  try {
    const { id } = req.params;

    const API_KEY =
      process.env.VIRUS_TOTAL_API_KEY;

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

    // Step 1 → Fetch analysis again
    const analysisRes = await axios.get(
      `https://www.virustotal.com/api/v3/analyses/${analysis_id}`,
      { headers: { "x-apikey": API_KEY } }
    );

    const url_id = analysisRes?.data?.meta?.url_info?.id;

    if (!url_id) {
      return res.status(400).json({
        success: false,
        message: "URL ID missing in analysis result",
      });
    }

    // Step 2 → Fetch latest full URL report
    const fullUrlRes = await axios.get(
      `https://www.virustotal.com/api/v3/urls/${url_id}`,
      { headers: { "x-apikey": API_KEY } }
    );

    const fullReport = fullUrlRes.data?.data;

    // Step 3 → Update DB
    await Virus.update(
      {
        scan_results: JSON.stringify(fullUrlRes.data),
        last_analysis_date: fullReport?.attributes?.last_analysis_date
          ? new Date(fullReport.attributes.last_analysis_date * 1000)
          : new Date(),
      },
      { where: { id } }
    );

    return res.status(200).json({
      success: true,
      message: "Rescan completed successfully",
      data: fullReport,
    });
  } catch (error) {
    console.error("Rescan Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to rescan URL",
      error: error?.response?.data || error.message,
    });
  }
};