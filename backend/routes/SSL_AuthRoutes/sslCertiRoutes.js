const express = require("express");
const router = express.Router();
const sslCertiController = require("../../controller/sslCertiController");
const sslCrudController = require("../../controller/sslCrudController");
const authController = require("../../controller/Authentication/authController");
const auth = require("../../middleware/authMiddleware");
const validateRequest = require("../../middleware/schemaValidation/validationMiddleare");
const authSchema = require("../../schemas/authenticationSchema");

//SSL analysis and its CRUD
router.post("/security", sslCertiController.securityAnalysis);
router.get("/getbulkreport", sslCrudController.getAllReports);
router.get("/getreportbyid/:id", sslCrudController.getReportByID);
router.delete("/deletereport/:id", sslCrudController.deleteReport);

//auth routes
router.post(
  "/registration",
  validateRequest(authSchema.registerSchema),
  authController.registration
);

router.post(
  "/login",
  validateRequest(authSchema.loginSchema),
  authController.login
);
router.post("/changepassword", auth, authController.changePassword);

router.get("/profile", auth, sslCrudController.getProfile);
router.put("/updateprofile", auth, sslCrudController.updateProfile);

//OTP
router.post("/forgotpassword", authController.forgotPasswordOTP);
router.post("/verifyotp", authController.verifyOtp);
router.post("/forgotresetpassword", authController.resetForgotPassword);

module.exports = router;