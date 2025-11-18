const GeneralSetting = require("../model/generalSettingModel");
const { getClientIP } = require('../utils/ipChecker');



let cache = { whitelist: null, lastFetched: 0 };
const CACHE_TTL_MS = 10 * 1000; // 10s, adjust if needed

async function loadWhitelist() {
  const now = Date.now();
  if (cache.lastFetched && now - cache.lastFetched < CACHE_TTL_MS) {
    return cache.whitelist;
  }

  try {
    const listSetting = await GeneralSetting.findOne({
      where: { field_name: "LIMITED_POWERPANEL_ACCESS", cb_deleted: false },
    });

    let whitelist = [];
    if (listSetting && listSetting.field_value) {
      try {
        // Expecting JSON array string
        whitelist = JSON.parse(listSetting.field_value);
        if (!Array.isArray(whitelist)) whitelist = [];
      } catch (err) {
        // Fallback: comma separated
        whitelist = String(listSetting.field_value)
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean);
      }
    }

    cache = { whitelist, lastFetched: now };
    return whitelist;
  } catch (err) {
    console.error("Error loading LIMITED_POWERPANEL_ACCESS:", err);
    // On error return empty (no restriction), but you can change to throw to be stricter
    return [];
  }
}

module.exports = async function limitedAccessMiddleware(req, res, next) {
  try {
    const whitelist = await loadWhitelist();

    // If whitelist is empty => feature is effectively OFF
    if (!whitelist || !Array.isArray(whitelist) || whitelist.length === 0) {
      return next();
    }

    // Determine client IP (reuse your util which prefers external IP but falls back)
    let clientIP;
    try {
      clientIP = await getClientIP(req);
    } catch (err) {
      clientIP =
        req.headers["x-forwarded-for"]?.split(",")[0] ||
        req.connection?.remoteAddress ||
        req.socket?.remoteAddress ||
        req.ip ||
        null;
    }

    if (!clientIP) {
      // If we cannot determine IP, block safe default
      return res.status(403).json({
        success: false,
        message: "Access denied. Unable to determine client IP.",
      });
    }

    if (clientIP.startsWith("::ffff:")) clientIP = clientIP.substring(7);

    // Normalize whitelist strings
    const normalized = whitelist.map((i) => String(i).trim());

    if (normalized.includes(clientIP)) {
      return next();
    }

    // Not whitelisted -> block
    return res.status(403).json({
      success: false,
      message: "Access denied. Your IP is not allowed to access this system.",
    });
  } catch (error) {
    console.error("limitedAccessMiddleware error:", error);
    // Fail-safe: allow or block? We choose to allow here to avoid service outage on middleware failure.
    // If you prefer safety-first, respond with 500/403 instead.
    return next();
  }
};