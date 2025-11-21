const express = require("express");
const router = express.Router();
const generalSetting = require('../../controller/generalSetting/generalsettingController');
const auth = require("../../middleware/authMiddleware");

router.get("/get-settings", auth, generalSetting.getSettings);
router.put("/update-setting", auth, generalSetting.updateSetting);
router.put('/update-limitedipaccess-status', auth, generalSetting.updateLimitedAccessStatus);

module.exports = router;