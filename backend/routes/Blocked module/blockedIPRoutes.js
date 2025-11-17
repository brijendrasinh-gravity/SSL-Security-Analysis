const express = require('express');
const router = express.Router();
const blockedIPController = require('../../controller/Blocked IP/blockedipController');
const ipInfoController = require('../../controller/Blocked IP/ipInfoController');
const auth = require("../../middleware/authMiddleware");
const checkPermission = require('../../middleware/checkPermissionMiddleware');
const checkBlockedIP = require('../../middleware/checkBlockedIPMiddleware');

router.get('/current-ip',auth, checkBlockedIP, ipInfoController.getCurrentIP);
router.post('/create-blockIP', auth, checkBlockedIP, blockedIPController.createBlocked_IP);
router.get('/getAllblockIP', auth, checkBlockedIP, blockedIPController.getAllBlocked_IPs);
router.get('/getblockIP/:id', auth, checkBlockedIP, blockedIPController.getBlocked_IPById);
router.put('/updateblock/:id', auth, checkBlockedIP, blockedIPController.updateBlocked_IP);
router.delete('/deleteblock/:id', auth, checkBlockedIP, blockedIPController.deleteBlocked_IP);

module.exports = router;