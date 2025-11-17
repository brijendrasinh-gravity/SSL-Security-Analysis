const { fetchRealIP } = require('../../utils/ipChecker');
const axios = require('axios');

exports.getCurrentIP = async (req, res) => {
  try {
    const response = await axios.get('https://ipwhois.app/json/');
    const ipData = response.data;
    
    console.log("Current IP Info:", JSON.stringify(ipData, null, 2));
    
    res.status(200).json({
      success: true,
      message: "IP information fetched successfully",
      data: {
        ip: ipData.ip,
        country: ipData.country,
        city: ipData.city,
        region: ipData.region,
        isp: ipData.isp,
        org: ipData.org,
        timezone: ipData.timezone,
      }
    });
  } catch (error) {
    console.error("Error fetching IP info:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching IP information",
      error: error.message
    });
  }
};