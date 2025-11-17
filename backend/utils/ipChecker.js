const axios = require("axios");
const Blocked_IP = require("../model/blockedipModel");

// Fetch real public IP from external API
const fetchRealIP = async () => {
  try {
    const response = await axios.get("https://ipwhois.app/json/");
    const publicIP = response.data.ip;
    console.log("Real public IP from API:", publicIP);
    console.log("Full IP Info:", JSON.stringify(response.data, null, 2));
    return publicIP;
  } catch (error) {
    console.error("Error fetching real IP:", error.message);
    return null;
  }
};

const getClientIP = async (req) => {
  // First try to get real public IP from external API
  const publicIP = await fetchRealIP();
  if (publicIP) {
    return publicIP;
  }

  // Fallback to request IP if API fails
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

  console.log("Fallback IP from request:", ip);
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
  fetchRealIP,
};
