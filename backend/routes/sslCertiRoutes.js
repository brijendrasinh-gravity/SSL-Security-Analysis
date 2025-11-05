const express = require('express');
const sslCertiController = require('../controller/sslCertiController');
const sslCrudController = require('../controller/sslCrudController');
const authController = require('../controller/authController');
const auth = require('../middleware/authMiddleware');
const router = express.Router();

//SSL analysis and its CRUD
router.post('/security', sslCertiController.securityAnalysis);
router.get('/getbulkreport', sslCrudController.getAllReports);
router.get('/getreportbyid/:id', sslCrudController.getReportByID);
router.delete("/deletereport/:id", sslCrudController.deleteReport);

//auth routes
router.post('/registration' ,authController.registration);
router.post('/login' ,authController.login);
router.post('/changepassword',auth, authController.changePassword);
// router.post('/forgotpassword', authController.forgotPassword);
// router.post('/forgotresetpassword', authController.resetForgotPassword);
router.get('/profile', auth, sslCrudController.getProfile);



//OTP
router.post('/forgotpassword', authController.forgotPasswordOTP);
router.post('/verifyotp', authController.verifyOtp);
router.post('/forgotresetpassword', authController.resetForgotPassword);



module.exports = router;

