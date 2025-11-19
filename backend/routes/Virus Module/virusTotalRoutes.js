const express = require("express");
const router = express.Router();
const VirusTotalController = require("../../controller/Virus Total/virusTotalController");
const auth = require("../../middleware/authMiddleware");
const { checkPermission } = require("../../middleware/checkPermissionMiddleware");
const checkBlockedIP = require("../../middleware/checkBlockedIPMiddleware");

router.post(
  "/scan-url",
  auth,
  checkPermission("virus_total", "canCreate"),
  checkBlockedIP,
  VirusTotalController.scanURL
);

// Fetch report by analysis_id
router.get(
  "/report/:analysis_id",
  auth,
  checkPermission("virus_total", "canList"),
  VirusTotalController.getReport
);

// Get Scan History
router.get(
  "/history",
  auth,
  checkPermission("virus_total", "canList"),
  checkBlockedIP,
  VirusTotalController.getHistory
);

// Get Single Scan (Record)
router.get(
  "/scan/:id",
  auth,
  checkPermission("virus_total", "canList"),
  checkBlockedIP,
  VirusTotalController.getSingleScan
);

// Delete Scan (Soft Delete)
router.delete(
  "/delete/:id",
  auth,
  checkPermission("virus_total", "canDelete"),
  checkBlockedIP,
  VirusTotalController.deleteScan
);

module.exports = router;