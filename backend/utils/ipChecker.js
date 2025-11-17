const axios = require("axios");
const Blocked_IP = require("../model/blockedipModel");

const getClientIP = (req) => {
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

  console.log("Extracted IP:", ip);
  return ip;
};

const fetchIPInfo = async (ip) => {
  try {
    const response = await axios.get(`https://ipwhois.app/json/${ip}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching IP info:", error.message);
    return null;
  }
};

const isIPBlocked = async (ip) => {
  try {
    const blockedRecord = await Blocked_IP.findOne({
      where: {
        ip_address: ip,
        cb_deleted: false,
        login_access: false,
      },
    });
    return !!blockedRecord;
  } catch (error) {
    console.error("Error checking blocked IP:", error);
    throw error;
  }
};

module.exports = {
  getClientIP,
  fetchIPInfo,
  isIPBlocked,
};
