const express = require("express");
const router = express.Router();
const VirusTotalController = require("../../controller/Virus Total/virusTotalController");
const auth = require("../../middleware/authMiddleware");
const checkPermission = require("../../middleware/checkPermissionMiddleware");

router.post("/scan-url", auth, VirusTotalController.scanURL);

// Fetch report by analysis_id
router.get("/report/:analysis_id", auth, VirusTotalController.getReport);

// Get Scan History
router.get("/history", auth, VirusTotalController.getHistory);

// Get Single Scan (Record)
router.get("/scan/:id", auth, VirusTotalController.getSingleScan);

// Delete Scan (Soft Delete)
router.delete(
  "/delete/:id",
  auth,
  VirusTotalController.deleteScan
);

module.exports = router;