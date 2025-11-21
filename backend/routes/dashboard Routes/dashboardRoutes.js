const express = require('express');
const router = express.Router();
const dashboardController = require('../../controller/Dashboard/dashboardController');
const auth = require('../../middleware/authMiddleware');
const dashboardLayout = require('../../controller/Dashboard/dashboardLayoutController');

router.get('/user-stats', auth, dashboardController.userStats);
router.get('/virustotal-stats', auth, dashboardController.virusStats);
router.get('/domain-stats', auth, dashboardController.domainStats);

//dashboard layout routes
router.get('/get-layout/:user_id', auth, dashboardLayout.getLayout);
router.post('/save-layout', auth, dashboardLayout.saveLayout);

module.exports = router;