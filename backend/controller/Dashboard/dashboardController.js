const { Sequelize } = require('sequelize');
const Users = require('../../model/userModel');
const Virus = require('../../model/virusTotalModel');
const SSLReports = require('../../model/sslReportModel');

// Convert preset range → { from, to }
const parseRangeToDates = (range) => {
  const now = new Date();

  if (!range || range === "all") {
    return { from: null, to: null };
  }

  if (range === "today") {
    const from = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const to = new Date(from);
    to.setDate(to.getDate() + 1);
    return { from, to };
  }

  if (range === "7d") {
    const from = new Date(now);
    from.setDate(from.getDate() - 6);
    return { from, to: now };
  }

  if (range === "15d") {
    const from = new Date(now);
    from.setDate(from.getDate() - 14);
    return { from, to: now };
  }

  if (range === "30d") {
    const from = new Date(now);
    from.setDate(from.getDate() - 29);
    return { from, to: now };
  }

  if (range === "3m") {
    const from = new Date(now.getFullYear(), now.getMonth() - 2, 1);
    const to = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    return { from, to };
  }

  if (range === "6m") {
    const from = new Date(now.getFullYear(), now.getMonth() - 5, 1);
    const to = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    return { from, to };
  }

  if (range === "year") {
    const from = new Date(now.getFullYear(), 0, 1);
    const to = new Date(now.getFullYear() + 1, 0, 1);
    return { from, to };
  }

  return { from: null, to: null };
};

// Build months between (YYYY-MM)
const buildMonthsBetween = (from, to) => {
  if (!from || !to) return [];
  const result = [];

  let d = new Date(from.getFullYear(), from.getMonth(), 1);
  let end = new Date(to.getFullYear(), to.getMonth(), 1);

  while (d <= end) {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    result.push(`${y}-${m}`);
    d.setMonth(d.getMonth() + 1);
  }
  return result;
};

const buildBucket = (months, key) => {
  return months.map((m) => ({
    month: m,
    [key]: 0
  }));
};

/* ---------------------------------------
   🔹 FILTER PARSER (CUSTOM OR PRESET)
----------------------------------------- */

const getEffectiveRange = (query) => {
  if (query.range === "custom") {
    const from = query.from ? new Date(query.from) : null;
    const to = query.to ? new Date(query.to) : null;
    return { from, to };
  }

  return parseRangeToDates(query.range);
};

/* ---------------------------------------
   🔹 USERS STATS
----------------------------------------- */

exports.userStats = async (req, res) => {
  try {
    const { from, to } = getEffectiveRange(req.query);

    let whereClause = {};
    if (from && to) {
      whereClause.createdAt = { [Sequelize.Op.between]: [from, to] };
    }

    // Months - if no range, use last 12 months
    let months = [];
    if (from && to) {
      months = buildMonthsBetween(from, to);
    } else {
      // Default: last 12 months
      const now = new Date();
      for (let i = 11; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, "0");
        months.push(`${y}-${m}`);
      }
    }

    // Summary
    const totalUsers = await Users.count({ where: whereClause });

    // This month and last month for cards
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    const newUsersThisMonth = await Users.count({
      where: {
        createdAt: { [Sequelize.Op.gte]: startOfMonth, [Sequelize.Op.lt]: endOfMonth }
      }
    });

    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = startOfMonth;
    const newUsersLastMonth = await Users.count({
      where: {
        createdAt: { [Sequelize.Op.gte]: startOfLastMonth, [Sequelize.Op.lt]: endOfLastMonth }
      }
    });

    // Monthly grouping
    const raw = await Users.findAll({
      attributes: [
        [Sequelize.fn("DATE_FORMAT", Sequelize.col("createdAt"), "%Y-%m"), "month"],
        [Sequelize.fn("COUNT", "*"), "count"],
      ],
      where: whereClause,
      group: ["month"],
      order: [[Sequelize.literal("month"), "ASC"]],
      raw: true,
    });

    let monthly = buildBucket(months, "newUsers");
    raw.forEach((r) => {
      const f = monthly.find((m) => m.month === r.month);
      if (f) f.newUsers = Number(r.count);
    });

    res.json({
      success: true,
      data: {
        totalUsers,
        newUsersThisMonth,
        newUsersLastMonth,
        monthly,
      },
    });

  } catch (err) {
    console.error("User Stats Error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};


/* ---------------------------------------
   🔹 VIRUS STATS
----------------------------------------- */

exports.virusStats = async (req, res) => {
  try {
    const { from, to } = getEffectiveRange(req.query);

    let whereClause = {};
    if (from && to) {
      whereClause.createdAt = { [Sequelize.Op.between]: [from, to] };
    }

    // Months - if no range, use last 12 months
    let months = [];
    if (from && to) {
      months = buildMonthsBetween(from, to);
    } else {
      const now = new Date();
      for (let i = 11; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, "0");
        months.push(`${y}-${m}`);
      }
    }

    const totalScans = await Virus.count({ where: whereClause });

    // This month and last month
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    const scansThisMonth = await Virus.count({
      where: {
        createdAt: { [Sequelize.Op.gte]: startOfMonth, [Sequelize.Op.lt]: endOfMonth }
      }
    });

    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = startOfMonth;
    const scansLastMonth = await Virus.count({
      where: {
        createdAt: { [Sequelize.Op.gte]: startOfLastMonth, [Sequelize.Op.lt]: endOfLastMonth }
      }
    });

    const raw = await Virus.findAll({
      attributes: [
        [Sequelize.fn("DATE_FORMAT", Sequelize.col("createdAt"), "%Y-%m"), "month"],
        [Sequelize.fn("COUNT", "*"), "count"],
      ],
      where: whereClause,
      group: ["month"],
      order: [[Sequelize.literal("month"), "ASC"]],
      raw: true,
    });

    let monthly = buildBucket(months, "scans");
    raw.forEach((r) => {
      const f = monthly.find((m) => m.month === r.month);
      if (f) f.scans = Number(r.count);
    });

    res.json({
      success: true,
      data: {
        totalScans,
        scansThisMonth,
        scansLastMonth,
        monthly,
      },
    });

  } catch (err) {
    console.error("Virus Stats Error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};


/* ---------------------------------------
   🔹 DOMAIN / SSL REPORT STATS
----------------------------------------- */

exports.domainStats = async (req, res) => {
  try {
    const { from, to } = getEffectiveRange(req.query);

    let whereClause = {};
    if (from && to) {
      whereClause.createdAt = { [Sequelize.Op.between]: [from, to] };
    }

    // Months - if no range, use last 12 months
    let months = [];
    if (from && to) {
      months = buildMonthsBetween(from, to);
    } else {
      const now = new Date();
      for (let i = 11; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, "0");
        months.push(`${y}-${m}`);
      }
    }

    const totalDomains = await SSLReports.count({ where: whereClause });

    // This month and last month
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    const domainsThisMonth = await SSLReports.count({
      where: {
        createdAt: { [Sequelize.Op.gte]: startOfMonth, [Sequelize.Op.lt]: endOfMonth }
      }
    });

    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = startOfMonth;
    const domainsLastMonth = await SSLReports.count({
      where: {
        createdAt: { [Sequelize.Op.gte]: startOfLastMonth, [Sequelize.Op.lt]: endOfLastMonth }
      }
    });

    const raw = await SSLReports.findAll({
      attributes: [
        [Sequelize.fn("DATE_FORMAT", Sequelize.col("createdAt"), "%Y-%m"), "month"],
        [Sequelize.fn("COUNT", "*"), "count"],
      ],
      where: whereClause,
      group: ["month"],
      order: [[Sequelize.literal("month"), "ASC"]],
      raw: true,
    });

    let monthly = buildBucket(months, "domainsScanned");
    raw.forEach((r) => {
      const f = monthly.find((m) => m.month === r.month);
      if (f) f.domainsScanned = Number(r.count);
    });

    res.json({
      success: true,
      data: {
        totalDomains,
        domainsThisMonth,
        domainsLastMonth,
        monthly,
      },
    });

  } catch (err) {
    console.error("Domain Stats Error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
