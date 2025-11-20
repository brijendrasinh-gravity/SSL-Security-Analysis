const express = require("express");
const router = express.Router();
const sslCertiController = require("../../controller/SSL/sslCertiController");
const sslCrudController = require("../../controller/SSL/sslCrudController");
const authController = require("../../controller/Authentication/authController");
const auth = require("../../middleware/authMiddleware");
const validateRequest = require("../../middleware/schemaValidation/validationMiddleare");
const authSchema = require("../../schemas/sslCertiSchema");
const upload = require("../../middleware/multer/multerMiddleware");
const {
  checkPermission,
} = require("../../middleware/checkPermissionMiddleware");
const checkBlockedIP = require("../../middleware/checkBlockedIPMiddleware");

// SSL Analysis and CRUD - Protected with RBAC
router.post(
  "/security",
  auth,
  checkBlockedIP,
  checkPermission("ssl_security", "canCreate"),
  sslCertiController.securityAnalysis
);

router.get(
  "/getbulkreport",
  auth,
  checkBlockedIP,
  checkPermission("ssl_security", "canList"),
  sslCrudController.getAllReports
);

router.get(
  "/getreportbyid/:id",
  auth,
  checkBlockedIP,
  checkPermission("ssl_security", "canList"),
  validateRequest(authSchema.getReportByidSchema),
  sslCrudController.getReportByID
);

router.delete(
  "/deletereport/:id",
  auth,
  checkBlockedIP,
  checkPermission("ssl_security", "canDelete"),
  validateRequest(authSchema.deleteReportByid),
  sslCrudController.deleteReport
);

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
router.post(
  "/changepassword",
  auth,
  checkBlockedIP,
  validateRequest(authSchema.changePasswordSchema),
  authController.changePassword
);

router.get("/profile", auth, checkBlockedIP, sslCrudController.getProfile);
router.put(
  "/updateprofile",
  auth,
  checkBlockedIP,
  validateRequest(authSchema.updateProfileSchema),
  upload.single("profile_image"),
  sslCrudController.updateProfile
);

//First Time Users API
router.post(
  "/first-login-check",
  validateRequest(authSchema.firstTimeLoginCheckSchema),
  authController.firstTimeLoginCheck
);

router.post(
  "/set-new-password/:id",
  validateRequest(authSchema.setNewPasswordSchema),
  authController.setNewPassword
);

//OTP
router.post(
  "/forgotpassword",
  validateRequest(authSchema.forgotPasswordSchema),
  authController.forgotPasswordOTP
);
router.post("/verifyotp", authController.verifyOtp);
router.post(
  "/forgotresetpassword",
  validateRequest(authSchema.forgotResetPasswordSchema),
  authController.resetForgotPassword
);

module.exports = router;
