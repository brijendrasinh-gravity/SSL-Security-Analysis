const GeneralSetting = require("../model/generalSettingModel");
const { getClientIP } = require('../utils/ipChecker');

let cache = { whitelist: null, isEnabled: null, lastFetched: 0 };
const CACHE_TTL_MS = 10 * 1000; // 10s cache

async function loadSettings() {
  const now = Date.now();

  // If cache not expired, return cached settings
  if (cache.lastFetched && now - cache.lastFetched < CACHE_TTL_MS) {
    return {
      whitelist: cache.whitelist,
      isEnabled: cache.isEnabled
    };
  }

  let whitelist = [];
  let isEnabled = false;

  try {
    // Load ENABLE FLAG
    const enabledSetting = await GeneralSetting.findOne({
      where: { field_name: "IS_LIMITED_POWERPANEL_ENABLED", cb_deleted: false },
    });

    if (enabledSetting) {
      isEnabled = enabledSetting.field_value === "true";
    }

    // Load WHITELIST
    const listSetting = await GeneralSetting.findOne({
      where: { field_name: "LIMITED_POWERPANEL_ACCESS", cb_deleted: false },
    });

    if (listSetting?.field_value) {
      try {
        whitelist = JSON.parse(listSetting.field_value);
        if (!Array.isArray(whitelist)) whitelist = [];
      } catch {
        whitelist = String(listSetting.field_value)
          .split(",")
          .map(s => s.trim())
          .filter(Boolean);
      }
    }

    cache = { whitelist, isEnabled, lastFetched: now };
    return { whitelist, isEnabled };
  } catch (error) {
    console.error("Error loading general settings:", error);
    return { whitelist: [], isEnabled: false };
  }
}

module.exports = async function limitedAccessMiddleware(req, res, next) {
  try {
    const { whitelist, isEnabled } = await loadSettings();

    // CASE 1 — FEATURE DISABLED → allow all
    if (!isEnabled) {
      return next();
    }

    // CASE 2 — FEATURE ENABLED but whitelist empty → allow all
    if (!whitelist || whitelist.length === 0) {
      return next();
    }

    // Determine client IP
    let clientIP;
    try {
      clientIP = await getClientIP(req);
    } catch {
      clientIP =
        req.headers["x-forwarded-for"]?.split(",")[0] ||
        req.connection?.remoteAddress ||
        req.socket?.remoteAddress ||
        req.ip ||
        null;
    }

    if (!clientIP) {
      return res.status(403).json({
        success: false,
        message: "Access denied. Unable to determine client IP.",
      });
    }

    if (clientIP.startsWith("::ffff:")) clientIP = clientIP.substring(7);

    // Normalize whitelist
    const normalized = whitelist.map(i => String(i).trim());

    if (normalized.includes(clientIP)) {
      return next();
    }

    return res.status(403).json({
      success: false,
      message: "Access denied. Your IP is not allowed to access this system.",
    });

  } catch (err) {
    console.error("limitedAccessMiddleware error:", err);
    return next(); // fail-safe
  }
};