const express = require("express");
const router = express.Router();
const userController = require("../../controller/UserModule/userModuleController");
const upload = require("../../middleware/multer/multerMiddleware");
const validateRequest = require("../../middleware/schemaValidation/validationMiddleare");
const authSchema = require("../../schemas/userModuleSchema");

//upload.single("profile_image")
router.post(
  "/create-user",
  upload.single("profile_image"),
  validateRequest(authSchema.createUserSchema),
  userController.createUser
);

router.get("/get-users", userController.getAllUsers);

router.get(
  "/get-user/:id",
  validateRequest(authSchema.getUserByIdSchema),
  userController.getUserById
);

router.put(
  "/update-user/:id",
  upload.single("profile_image"),
  validateRequest(authSchema.updateUserSchema),
  userController.updateUser
);

router.delete(
  "/delete-user/:id",
  validateRequest(authSchema.deleeUserByIdSchema),
  userController.deleteUser
);

router.patch(
  "/toggle-status/:id",
  validateRequest(authSchema.toggleStatusSchema),
  userController.toggleUserStatus
);

module.exports = router;
