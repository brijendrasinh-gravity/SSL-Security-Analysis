const express = require("express");
const router = express.Router();
const roleController = require("../../controller/role based/roleController");
const moduleController = require("../../controller/module/moduleController");


router.post("/create-role", roleController.createRole);

router.get("/get-role", roleController.getAllRoles);

router.get("/get-role/:id", roleController.getRoleById);

router.put("/update-role/:id", roleController.updateRole);

router.delete("/delete-role/:id", roleController.deleteRole);


//modules list API
router.get("/get-module", moduleController.getAllModules);

module.exports = router;