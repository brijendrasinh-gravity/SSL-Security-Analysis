const express = require("express");
const router = express.Router();
const userController = require("../../controller/UserModule/userModuleController");
const upload = require('../../middleware/multer/multerMiddleware');

//upload.single("profile_image")
router.post("/create-user", upload.single("profile_image"),userController.createUser);

router.get("/get-users", userController.getAllUsers);

router.get("/get-user/:id", userController.getUserById);

router.put("/update-user/:id",upload.single("profile_image"), userController.updateUser);

router.delete("/delete-user/:id", userController.deleteUser);

router.patch("/toggle-status/:id", userController.toggleUserStatus);



module.exports = router;