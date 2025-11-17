const Blocked_IP = require('../model/blockedipModel');
const axios = require('axios');

// Fetch real public IP from external API
const fetchRealIP = async () => {
  try {
    const response = await axios.get("https://ipwhois.app/json/", { timeout: 3000 });
    const publicIP = response.data.ip;
    console.log("Real public IP from API:", publicIP);
    return publicIP;
  } catch (error) {
    console.error("Error fetching real IP:", error.message);
    return null;
  }
};

// Extract IP from request
const extractRequestIP = (req) => {
  let ip =
    req.headers["x-forwarded-for"] ||
    req.connection.remoteAddress ||
    req.socket.remoteAddress ||
    req.ip;

  // Handle IPv6 localhost
  if (ip === "::1" || ip === "::ffff:127.0.0.1") {
    ip = "127.0.0.1";
  }

  // If x-forwarded-for contains multiple IPs, take the first one
  if (ip && ip.includes(",")) {
    ip = ip.split(",")[0].trim();
  }

  // Remove IPv6 prefix if present
  if (ip && ip.startsWith("::ffff:")) {
    ip = ip.substring(7);
  }

  return ip;
};

module.exports = async function checkBlockedIP(req, res, next) {
  try {
    // Try to get real public IP first, fallback to request IP
    let clientIP = await fetchRealIP();
    
    if (!clientIP) {
      clientIP = extractRequestIP(req);
    }

    console.log("Checking IP:", clientIP);

    const blockRecord = await Blocked_IP.findOne({
      where: {
        ip_address: clientIP,
        login_access: false,
        cb_deleted: false
      }
    });

    if (blockRecord) {
      console.log("IP is blocked:", clientIP);
      return res.status(403).json({
        success: false,
        message: "Your IP address has been blocked. Access denied.",
        blocked: true
      });
    }

    next();
  } catch (error) {
    console.error("IP block middleware error:", error);
    // Don't block on error, just log and continue
    next();
  }
};