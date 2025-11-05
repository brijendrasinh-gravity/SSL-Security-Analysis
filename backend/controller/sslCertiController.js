const axios = require("axios");
const sequelize = require("../config/db");
const Sslreports = require("../model/sslReportModel");

const ssl_api = "https://api.ssllabs.com/api/v3/analyze";
const certi_api = "https://crt.sh/?q=%25.";

const sleep = (ms) => new Promise((res) => setTimeout(res, ms));

exports.securityAnalysis = async (req, res) => {
  try {
    const { domain } = req.body;
    if (!domain || typeof domain !== "string") {
      return res.status(400).json({
        error: "domain is required to go ahead",
      });
    }
    const trimmedDomain = domain.trim();

    const sslApiUrl = `${ssl_api}?host=${encodeURIComponent(
      trimmedDomain
    )}&all=done&ignoreMismatch=on`;

    let sslResponse;
    try {
      const e = await axios.get(sslApiUrl, { timeout: 30000 });
      sslResponse = e.data;
    } catch (err) {
      return res.status(502).json({
        error: "failed to call api",
        message: err.message,
      });
    }

    let attempt = 0;
    const allowedattempt = 10;
    const pollintervalms = 3000;

    while (
      sslResponse &&
      sslResponse.status &&
      sslResponse.status !== "READY" &&
      attempt < allowedattempt
    ) {
      attempt++;
      await sleep(pollintervalms);
      try {
        const e = await axios.get(sslApiUrl, {
          timeout: 30000,
        });
        sslResponse = e.data;
      } catch (err) {
        // res.status(500).json({message:err.message})
        break;
      }
    }

    // let certiData = [];
    // try {
    //   const certiAPI = `${certi_api}${encodeURIComponent(trimmedDomain)}&output=json`;
    //   const c = await axios.get(certiAPI, { timeout: 20000 });

    //   certiData = Array.isArray(c.data) ? c.data : { raw: c.data };
    // } catch (err) {
    //   certiData = {
    //     error: "Faild to fetch API",
    //     message: err.message,
    //   };
    // }

    let certiData = [];
    try {
      const certiAPI = `${certi_api}${encodeURIComponent(
        trimmedDomain
      )}&output=json`;
      const c = await axios.get(certiAPI, { timeout: 20000 });

      // Always ensure certiData is an array
      certiData = Array.isArray(c.data) ? c.data : [c.data];
    } catch (err) {
      console.error("crt.sh fetch failed:", err.message);
      certiData = [];
    }

    //stats logic code
    const totalCertificates = certiData.length;
    const now = new Date();

    // const issuers = [
    //   ...new Set(certiData.map((c) => c.issuer_name).filter(Boolean)),
    // ];
    const issuers = [
      ...new Set(
        (Array.isArray(certiData) ? certiData : [])
          .map((c) => c.issuer_name)
          .filter(Boolean)
      ),
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

      // timeline: group by YYYY-MM
      if (loggedAt) {
        const month = loggedAt.toISOString().slice(0, 7);
        timelineMap[month] = (timelineMap[month] || 0) + 1;
      }
    }

    const timeline = Object.entries(timelineMap)
      .sort(([a], [b]) => new Date(a) - new Date(b))
      .map(([month, count]) => ({ month, count }));

    //  Final Response
    const final_result = {
      domain: trimmedDomain,
      ssllabs: sslResponse,
      certificateTransparency: {
        domain: trimmedDomain,
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
      polledAttempts: attempt,
    };
    //statsend

    await Sslreports.create({
      domain: trimmedDomain,
      ssllabs: sslResponse,
      certificateTransparency: final_result.certificateTransparency,
    });

    return res.json({
      message: "SSL Security Analysis Successful and your report is saved.",
      domain: trimmedDomain,
    });
  } catch (err) {
    console.error("security analysis error", err);
    res
      .status(500)
      .json({ error: "internal server error", message: err.message });
  }
};
