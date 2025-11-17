const express = require('express');
const router = express.Router();
const blockedIPController = require('../../controller/Blocked IP/blockedipController');

router.post('/create-blockIP', blockedIPController.createBlocked_IP);
router.get('/getAllblockIP', blockedIPController.getAllBlocked_IPs);
router.get('/getblockIP/:id', blockedIPController.getBlocked_IPById);
router.put('/updateblock/:id', blockedIPController.updateBlocked_IP);
router.delete('/deleteblock/:id', blockedIPController.deleteBlocked_IP);

module.exports = router;