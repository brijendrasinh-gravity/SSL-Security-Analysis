const User = require("../model/userModel");
const Role = require("../model/rolesModel");
const moment = require("moment");

module.exports = async function checkApiLimit(req, res, next) {
  try {
    const userId = req.user.user_id;
    const user = await User.findByPk(userId);

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // 1. Fetch role and check if admin
    const role = await Role.findByPk(user.role_id);
    const isAdmin = role && role.is_Admin === true;

    if (isAdmin) {
      // Admin never has limits
      return next();
    }

    // 2. If limit is off → allow

    if (!user.api_limit_enabled) {
      return next();
    }

    // 3. Reset counter if new day

    const today = moment().format("YYYY-MM-DD");
    const lastUsed = user.api_last_used_date
      ? moment(user.api_last_used_date).format("YYYY-MM-DD")
      : null;

    if (lastUsed !== today) {
      user.api_used_today = 0;
      user.api_last_used_date = new Date();
      await user.save();
    }


    // 4. Check limit

    if (user.api_used_today >= user.daily_limit) {
      return res.status(429).json({
        success: false,
        message: "Daily API limit reached. Try again tomorrow.",
      });
    }


    // 5. Increment usage

    user.api_used_today += 1;
    user.api_last_used_date = new Date();
    await user.save();

    // 6. Allow controller to run

    next();
  } catch (error) {
    console.error("API Limit Middleware Error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error in API limit checking",
    });
  }
};
