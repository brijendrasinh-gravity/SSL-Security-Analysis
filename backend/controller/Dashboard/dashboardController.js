const { Sequelize } = require('sequelize');
const Users = require('../../model/userModel');
const Virus = require('../../model/virusTotalModel');
const SSLReports = require('../../model/sslReportModel');

const getLast12Months = () => {
  const months = [];
  const d = new Date();
  d.setDate(1); // start of month
  for (let i = 11; i >= 0; i--) {
    const tmp = new Date(d.getFullYear(), d.getMonth() - i, 1);
    const yyyy = tmp.getFullYear();
    const mm = String(tmp.getMonth() + 1).padStart(2, '0');
    months.push(`${yyyy}-${mm}`);
  }
  return months;
};

// Helper builds empty month objects
const buildMonthBuckets = (months, keyName) =>
  months.map((m) => ({ month: m, [keyName]: 0 }));

exports.userStats = async (req, res) => {
  try {
    const months = getLast12Months();

    // Summary counts
    const totalUsers = await Users.count({ where: {} });

    // This month
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    const newUsersThisMonth = await Users.count({
      where: {
        createdAt: {
          [Sequelize.Op.gte]: startOfMonth,
          [Sequelize.Op.lt]: endOfMonth,
        },
      },
    });

    // Last month
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const newUsersLastMonth = await Users.count({
      where: {
        createdAt: {
          [Sequelize.Op.gte]: startOfLastMonth,
          [Sequelize.Op.lt]: endOfLastMonth,
        },
      },
    });

    // Monthly new users (group by YYYY-MM)
    const monthlyRaw = await Users.findAll({
      attributes: [
        [Sequelize.fn('DATE_FORMAT', Sequelize.col('createdAt'), '%Y-%m'), 'month'],
        [Sequelize.fn('COUNT', Sequelize.col('*')), 'count'],
      ],
      where: {},
      group: ['month'],
      order: [[Sequelize.literal('month'), 'ASC']],
      raw: true,
    });

    // Map results into last 12 months array
    const monthly = buildMonthBuckets(months, 'newUsers');
    monthlyRaw.forEach((r) => {
      const found = monthly.find((m) => m.month === r.month);
      if (found) found.newUsers = Number(r.count);
    });

    return res.status(200).json({
      success: true,
      data: {
        totalUsers,
        newUsersThisMonth,
        newUsersLastMonth,
        monthly,
      },
    });
  } catch (error) {
    console.error("Dashboard.userStats error:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

exports.virusStats = async (req, res) => {
  try {
    const months = getLast12Months();

    const totalScans = await Virus.count({});
    
    // This month
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    const scansThisMonth = await Virus.count({
      where: {
        createdAt: {
          [Sequelize.Op.gte]: startOfMonth,
          [Sequelize.Op.lt]: endOfMonth,
        },
      },
    });

    // Last month
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const scansLastMonth = await Virus.count({
      where: {
        createdAt: {
          [Sequelize.Op.gte]: startOfLastMonth,
          [Sequelize.Op.lt]: endOfLastMonth,
        },
      },
    });

    // Monthly scans grouped
    const monthlyRaw = await Virus.findAll({
      attributes: [
        [Sequelize.fn('DATE_FORMAT', Sequelize.col('createdAt'), '%Y-%m'), 'month'],
        [Sequelize.fn('COUNT', Sequelize.col('*')), 'count'],
      ],
      group: ['month'],
      order: [[Sequelize.literal('month'), 'ASC']],
      raw: true,
    });

    const monthly = buildMonthBuckets(months, 'scans');
    monthlyRaw.forEach((r) => {
      const found = monthly.find((m) => m.month === r.month);
      if (found) found.scans = Number(r.count);
    });

    return res.status(200).json({
      success: true,
      data: {
        totalScans,
        scansThisMonth,
        scansLastMonth,
        monthly,
      },
    });
  } catch (error) {
    console.error("Dashboard.virusStats error:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

exports.domainStats = async (req, res) => {
  try {
    const months = getLast12Months();

    const totalDomains = await SSLReports.count({});
    
    // This month
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    const domainsThisMonth = await SSLReports.count({
      where: {
        createdAt: {
          [Sequelize.Op.gte]: startOfMonth,
          [Sequelize.Op.lt]: endOfMonth,
        },
      },
    });

    // Last month
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const domainsLastMonth = await SSLReports.count({
      where: {
        createdAt: {
          [Sequelize.Op.gte]: startOfLastMonth,
          [Sequelize.Op.lt]: endOfLastMonth,
        },
      },
    });

    // Monthly scanned domains (grouped by report createdAt; counts rows)
    const monthlyRaw = await SSLReports.findAll({
      attributes: [
        [Sequelize.fn('DATE_FORMAT', Sequelize.col('createdAt'), '%Y-%m'), 'month'],
        [Sequelize.fn('COUNT', Sequelize.col('*')), 'count'],
      ],
      group: ['month'],
      order: [[Sequelize.literal('month'), 'ASC']],
      raw: true,
    });

    const monthly = buildMonthBuckets(months, 'domainsScanned');
    monthlyRaw.forEach((r) => {
      const found = monthly.find((m) => m.month === r.month);
      if (found) found.domainsScanned = Number(r.count);
    });

    return res.status(200).json({
      success: true,
      data: {
        totalDomains,
        domainsThisMonth,
        domainsLastMonth,
        monthly,
      },
    });
  } catch (error) {
    console.error("Dashboard.domainStats error:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};