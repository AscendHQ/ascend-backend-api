import { Router } from "express";
import { auth } from "../auth/auth";
import {
  getAllPermissions,
  createPermission,
  getPermissionById,
  updatePermissionById,
  deletePermissionById,
} from "../controllers/permission.controller";
import { checkPathPermission } from "../middlewares/checkPathPermission";
import { permissionValidator } from "../validators/permission.validator";

const router = Router();

router.get("/", auth, checkPathPermission, getAllPermissions);

router.post(
  "/",
  auth,
  checkPathPermission,
  permissionValidator.createPermission,
  createPermission
);

router.get("/:id", auth, checkPathPermission, getPermissionById);

router.put(
  "/:id",
  auth,
  checkPathPermission,
  permissionValidator.updatePermission,
  updatePermissionById
);

router.delete("/:id", auth, checkPathPermission, deletePermissionById);

export default router;
