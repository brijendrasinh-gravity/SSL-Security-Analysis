const express = require('express');
const router = express.Router();
const dashboardController = require('../../controller/Dashboard/dashboardController');
const auth = require('../../middleware/authMiddleware');
const dashboardLayout = require('../../controller/Dashboard/dashboardLayoutController');
const checkBlockedIP = require('../../middleware/checkBlockedIPMiddleware');
const { checkPermission } = require('../../middleware/checkPermissionMiddleware');

router.get('/user-stats', auth, checkBlockedIP, dashboardController.userStats);
router.get('/virustotal-stats', auth,checkBlockedIP, dashboardController.virusStats);
router.get('/domain-stats', auth, checkBlockedIP, dashboardController.domainStats);

//dashboard layout routes
router.get('/get-layout/:user_id', auth, checkBlockedIP, dashboardLayout.getLayout);
router.post('/save-layout', auth, checkBlockedIP, dashboardLayout.saveLayout);

module.exports = router;