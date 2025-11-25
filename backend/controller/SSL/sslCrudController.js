const sequelize = require("../../config/db");
const Sslreports = require("../../model/sslReportModel");
const User = require("../../model/userModel");
const { Op } = require("sequelize");
const path = require("path");
const fs = require("fs");
const axios = require("axios");
const sleep = (ms) => new Promise((res) => setTimeout(res, ms));
const certi_api = "https://crt.sh/?q=%25.";
const ssl_api = "https://api.ssllabs.com/api/v3/analyze";

//after fixing
exports.getAllReports = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    console.log(
      `Pagination params - Page: ${page}, Limit: ${limit}, Offset: ${offset}`
    );

    // Step 1: Find latest createdAt per domain
    const latestReports = await Sslreports.findAll({
      attributes: [
        "domain",
        [sequelize.fn("MAX", sequelize.col("createdAt")), "latestCreatedAt"],
      ],
      where: { isDeleted: "No" },
      group: ["domain"],
      raw: true,
    });

    if (!latestReports.length) {
      return res.status(200).json({
        success: true,
        total: 0,
        data: [],
      });
    }

    // Step 2: Extract only latest domain records
    const latestRecords = await Sslreports.findAll({
      where: {
        isDeleted: "No",
        [Op.or]: latestReports.map((r) => ({
          domain: r.domain,
          createdAt: r.latestCreatedAt,
        })),
      },
      order: [["createdAt", "DESC"]],
      raw: true,
    });

    // Step 3: Manual pagination (after deduplication)
    const total = latestRecords.length;
    const paginatedData = latestRecords.slice(offset, offset + limit);

    return res.status(200).json({
      success: true,
      total,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      data: paginatedData,
    });
  } catch (err) {
    console.error("Error fetching SSL reports:", err);
    res.status(500).json({
      success: false,
      message: "Internal server error while fetching reports",
      error: err.message,
    });
  }
};

exports.getReportByID = async (req, res) => {
  try {
    const { id } = req.params;
    const report = await Sslreports.findByPk(id);

    if (!report) {
      return res
        .status(404)
        .json({ success: false, message: "report not found" });
    }
    return res.json({ success: true, data: report });
  } catch (err) {
    console.error("error fetching report detail", err);
    res.status(500).json({
      success: false,
      message: "internal server error while fetching report detail",
      error: err.message,
    });
  }
};

exports.deleteReport = async (req, res) => {
  try {
    const { id } = req.params;
    const report = await Sslreports.findByPk(id);
    if (!report) {
      return res
        .status(404)
        .json({ success: false, message: "Domain not found" });
    }
    await report.update({ isDeleted: "Yes" });
    res.status(200).json({ success: true, message: "report is now deleted" });
  } catch (error) {
    console.error("error in delete report", error);
    res.status(500).json({
      success: false,
      message: "servor error in deleting report",
    });
  }
};

exports.getProfile = async (req, res) => {
  try {
    const userId = req.user.user_id;

    const user = await User.findByPk(userId, {
      attributes: [
        "id",
        "user_name",
        "email",
        "phone_number",
        "description",
        "status",
        "createdAt",
        "updatedAt",
      ],
    });

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    res.status(200).json({
      success: true,
      message: "Profile fetched successfully",
      data: user,
    });
  } catch (error) {
    console.error("Profile fetch error:", error);
    res.status(500).json({
      success: false,
      message: "Server error fetching profile",
      error: error.message,
    });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user.user_id;
    const { user_name, phone_number, description } = req.body;

    if (!userId) {
      return res
        .status(401)
        .json({ success: false, message: "Unauthorized access" });
    }

    const user = await User.findByPk(userId);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    //Handle new image upload if present
    let imagePath = user.profile_image;

    if (req.file) {
      // Delete old image if exists
      if (user.profile_image) {
        const oldImagePath = path.join(__dirname, "../../", user.profile_image);
        fs.unlink(oldImagePath, (err) => {
          if (err)
            console.warn(
              "Old image not found or already deleted:",
              err.message
            );
        });
      }

      // Save new uploaded image path
      imagePath = `/uploads/profile_images/${req.file.filename}`;
    }

    //Update fields (only provided ones)
    user.user_name = user_name ?? user.user_name;
    user.phone_number = phone_number ?? user.phone_number;
    user.description = description ?? user.description;
    user.profile_image = imagePath;

    await user.save();

    //Updated response
    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      updatedData: {
        id: user.id,
        user_name: user.user_name,
        email: user.email,
        phone_number: user.phone_number,
        description: user.description,
        profile_image: user.profile_image,
      },
    });
  } catch (err) {
    console.error("Profile update error:", err);
    res.status(500).json({
      success: false,
      message: "Internal server error while updating profile",
      error: err.message,
    });
  }
};

exports.rescanReport = async (req, res) => {
  try {
    const { id } = req.params;

    const oldReport = await Sslreports.findByPk(id);
    if (!oldReport) {
      return res
        .status(404)
        .json({ success: false, message: "report not found" });
    }

    const domain = oldReport.domain.trim();

    const sslApiUrl = `${ssl_api}?host=${encodeURIComponent(
      domain
    )}&all=done&ignoreMismatch=on&clearCache=on`;

    let sslResponse;
    try {
      const e = await axios.get(sslApiUrl, { timeout: 30000 });
      sslResponse = e.data;
    } catch (err) {
      return res.status(502).json({
        success: false,
        message: "failed to call ssl labs api",
        error: err.message,
      });
    }

    let attempt = 0;
    const maxAttempts = 10;
    const pollDelay = 3000;

    while (
      sslResponse &&
      sslResponse.status &&
      sslResponse.status !== "READY" &&
      attempt < maxAttempts
    ) {
      attempt++;
      await sleep(pollDelay);

      try {
        const e = await axios.get(sslApiUrl, { timeout: 30000 });
        sslResponse = e.data;
      } catch (err) {
        break;
      }
    }

    let certiData = [];
    try {
      const certiAPI = `${certi_api}${encodeURIComponent(domain)}&output=json`;
      const c = await axios.get(certiAPI, { timeout: 20000 });
      certiData = Array.isArray(c.data) ? c.data : [c.data];
    } catch (err) {
      certiData = [];
    }

    const now = new Date();
    const totalCertificates = certiData.length;

    const issuers = [
      ...new Set(certiData.map((c) => c.issuer_name).filter(Boolean)),
    ];

    const subdomains = [
      ...new Set(
        certiData
          .map((c) => c.name_value?.split("\n"))
          .flat()
          .filter((d) => d && !d.startsWith("*"))
      ),
    ];

    let active = 0,
      expired = 0,
      recent = 0;

    const timelineMap = {};

    for (const cert of certiData) {
      const notAfter = cert.not_after ? new Date(cert.not_after) : null;
      const loggedAt = cert.entry_timestamp
        ? new Date(cert.entry_timestamp)
        : null;

      if (notAfter) {
        if (notAfter > now) active++;
        else expired++;
      }

      if (loggedAt && (now - loggedAt) / (1000 * 60 * 60 * 24) <= 30) {
        recent++;
      }

      if (loggedAt) {
        const month = loggedAt.toISOString().slice(0, 7);
        timelineMap[month] = (timelineMap[month] || 0) + 1;
      }
    }

    const timeline = Object.entries(timelineMap)
      .sort(([a], [b]) => new Date(a) - new Date(b))
      .map(([month, count]) => ({ month, count }));

    const newReportData = {
      domain,
      ssllabs: sslResponse,
      certificateTransparency: {
        domain,
        scanTimestamp: new Date().toISOString(),
        summary: {
          totalCertificates,
          activeCertificates: active,
          expiredCertificates: expired,
          recentCertificates: recent,
          uniqueIssuers: issuers.length,
          discoveredSubdomains: subdomains.length,
        },
        statistics: {
          issuers,
          subdomains,
          timeline,
        },
      },
    };

    // 6. Save new fresh report
    const newReport = await Sslreports.create(newReportData);

    return res.status(200).json({
      success: true,
      message: "Rescan completed & new report saved",
      newReportId: newReport.id,
    });

  } catch (error) {
    console.error("rescan error:", error);
    res.status(500).json({
      success:false,
      message:"internal server error while rescanning",
      error: error.message,
    })
  }
};
