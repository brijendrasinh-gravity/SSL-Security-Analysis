const express = require('express');
const router = express.Router();
const dashboardController = require('../../controller/Dashboard/dashboardController');
const auth = require('../../middleware/authMiddleware');

router.get('/user-stats', auth, dashboardController.userStats);
router.get('/virustotal-stats', auth, dashboardController.virusStats);
router.get('/domain-stats', auth, dashboardController.domainStats);

module.exports = router;