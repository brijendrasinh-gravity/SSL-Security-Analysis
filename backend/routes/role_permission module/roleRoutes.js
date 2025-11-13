const express = require("express");
const router = express.Router();
const roleController = require("../../controller/role based/roleController");
const moduleController = require("../../controller/module/moduleController");
const auth = require("../../middleware/authMiddleware");
const { checkPermission } = require("../../middleware/checkPermissionMiddleware");

// Role Management Routes - Protected with RBAC
router.post(
  "/create-role",
  auth,
  checkPermission("role", "canCreate"),
  roleController.createRole
);

router.get(
  "/get-role",
  auth,
  checkPermission("role", "canList"),
  roleController.getAllRoles
);

router.get(
  "/get-role/:id",
  auth,
  checkPermission("role", "canList"),
  roleController.getRoleById
);

router.put(
  "/update-role/:id",
  auth,
  checkPermission("role", "canModify"),
  roleController.updateRole
);

router.delete(
  "/delete-role/:id",
  auth,
  checkPermission("role", "canDelete"),
  roleController.deleteRole
);

// Module List API - Protected (read-only, requires list permission)
router.get(
  "/get-module",
  auth,
  checkPermission("role", "canList"),
  moduleController.getAllModules
);

module.exports = router;