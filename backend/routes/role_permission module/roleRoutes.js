const express = require("express");
const router = express.Router();
const roleController = require("../../controller/role based/roleController");
const moduleController = require("../../controller/module/moduleController");
const auth = require("../../middleware/authMiddleware");
const { checkPermission } = require("../../middleware/checkPermissionMiddleware");
const checkBlockedIP = require('../../middleware/checkBlockedIPMiddleware');

// Role Management Routes - Protected with RBAC
router.post(
  "/create-role",
  auth,
  checkPermission("role_permission", "canCreate"),
  checkBlockedIP,
  roleController.createRole
);

router.get(
  "/get-role",
  auth,
  checkPermission("role_permission", "canList"),
  checkBlockedIP,
  roleController.getAllRoles
);

router.get(
  "/get-role/:id",
  auth,
  checkPermission("role_permission", "canList"),
  checkBlockedIP,
  roleController.getRoleById
);

router.put(
  "/update-role/:id",
  auth,
  checkPermission("role_permission", "canModify"),
  checkBlockedIP,
  roleController.updateRole
);

router.delete(
  "/delete-role/:id",
  auth,
  checkPermission("role_permission", "canDelete"),
  checkBlockedIP,
  roleController.deleteRole
);

// Module List API - Protected (read-only, requires list permission)
router.get(
  "/get-module",
  auth,
  checkPermission("role_permission", "canList"),
  checkBlockedIP,
  moduleController.getAllModules
);

module.exports = router;