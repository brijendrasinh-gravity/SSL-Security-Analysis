const express = require("express");
const router = express.Router();
const sslCertiController = require("../../controller/sslCertiController");
const sslCrudController = require("../../controller/sslCrudController");
const authController = require("../../controller/Authentication/authController");
const auth = require("../../middleware/authMiddleware");
const validateRequest = require("../../middleware/schemaValidation/validationMiddleare");
const authSchema = require("../../schemas/sslCertiSchema");
const upload = require("../../middleware/multer/multerMiddleware");


//SSL analysis and its CRUD
router.post("/security", sslCertiController.securityAnalysis);
router.get("/getbulkreport", sslCrudController.getAllReports);
router.get("/getreportbyid/:id", validateRequest(authSchema.getReportByidSchema) ,sslCrudController.getReportByID);
router.delete("/deletereport/:id", validateRequest(authSchema.deleteReportByid), sslCrudController.deleteReport);

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
router.post("/changepassword", auth, validateRequest(authSchema.changePasswordSchema) ,authController.changePassword);

router.get("/profile", auth, sslCrudController.getProfile);
router.put("/updateprofile", auth, validateRequest(authSchema.updateProfileSchema),upload.single("profile_image") ,sslCrudController.updateProfile);

//OTP
router.post("/forgotpassword", validateRequest(authSchema.forgotPasswordSchema) ,authController.forgotPasswordOTP);
router.post("/verifyotp", authController.verifyOtp);
router.post("/forgotresetpassword", validateRequest(authSchema.forgotResetPasswordSchema) ,authController.resetForgotPassword);

module.exports = router;