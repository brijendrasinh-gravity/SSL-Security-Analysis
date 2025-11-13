const express = require("express");
const router = express.Router();
const userController = require("../../controller/UserModule/userModuleController");
const upload = require("../../middleware/multer/multerMiddleware");
const validateRequest = require("../../middleware/schemaValidation/validationMiddleare");
const authSchema = require("../../schemas/userModuleSchema");
const auth = require("../../middleware/authMiddleware");
const { checkPermission } = require("../../middleware/checkPermissionMiddleware");

// User Management Routes - Protected with RBAC
router.post(
  "/create-user",
  auth,
  checkPermission("user", "canCreate"),
  upload.single("profile_image"),
  validateRequest(authSchema.createUserSchema),
  userController.createUser
);

router.get(
  "/get-users",
  auth,
  checkPermission("user", "canList"),
  userController.getAllUsers
);

router.get(
  "/get-user/:id",
  auth,
  checkPermission("user", "canList"),
  validateRequest(authSchema.getUserByIdSchema),
  userController.getUserById
);

router.put(
  "/update-user/:id",
  auth,
  checkPermission("user", "canModify"),
  upload.single("profile_image"),
  validateRequest(authSchema.updateUserSchema),
  userController.updateUser
);

router.delete(
  "/delete-user/:id",
  auth,
  checkPermission("user", "canDelete"),
  validateRequest(authSchema.deleeUserByIdSchema),
  userController.deleteUser
);

router.patch(
  "/toggle-status/:id",
  auth,
  checkPermission("user", "canModify"),
  validateRequest(authSchema.toggleStatusSchema),
  userController.toggleUserStatus
);

module.exports = router;