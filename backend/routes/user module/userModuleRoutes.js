const express = require("express");
const router = express.Router();
const userController = require("../../controller/UserModule/userModuleController");
const upload = require("../../middleware/multer/multerMiddleware");
const validateRequest = require("../../middleware/schemaValidation/validationMiddleare");
const authSchema = require("../../schemas/userModuleSchema");
const auth = require("../../middleware/authMiddleware");
const { checkPermission } = require("../../middleware/checkPermissionMiddleware");
const checkBlockedIP = require('../../middleware/checkBlockedIPMiddleware');

// User Management Routes - Protected with RBAC
router.post(
  "/create-user",
  auth,
  checkBlockedIP,
  checkPermission("user", "canCreate"),
  upload.single("profile_image"),
  validateRequest(authSchema.createUserSchema),
  userController.createUser
);

router.get(
  "/get-users",
  auth,
  checkBlockedIP,
  checkPermission("user", "canList"),
  userController.getAllUsers
);

router.get(
  "/get-user/:id",
  auth,
  checkBlockedIP,
  checkPermission("user", "canList"),
  validateRequest(authSchema.getUserByIdSchema),
  userController.getUserById
);

router.put(
  "/update-user/:id",
  auth,
  checkBlockedIP,
  checkPermission("user", "canModify"),
  upload.single("profile_image"),
  validateRequest(authSchema.updateUserSchema),
  userController.updateUser
);

router.delete(
  "/delete-user/:id",
  auth,
  checkBlockedIP,
  checkPermission("user", "canDelete"),
  validateRequest(authSchema.deleeUserByIdSchema),
  userController.deleteUser
);

router.patch(
  "/toggle-status/:id",
  auth,
  checkBlockedIP,
  checkPermission("user", "canModify"),
  validateRequest(authSchema.toggleStatusSchema),
  userController.toggleUserStatus
);

router.get('/account-setting/:id',
  auth,
  checkBlockedIP,
  checkPermission("user","canList"),
  userController.getAccountSetting
);

router.put("/account-setting/:id", 
  auth, 
  checkBlockedIP, 
  checkPermission("user","canModify"),
  userController.updateAccountSetting
);

router.patch("/reset-api-usage/:id",
  auth,
  checkBlockedIP,
  checkPermission("user","canModify"),
  userController.resetApiUsage
);

module.exports = router;