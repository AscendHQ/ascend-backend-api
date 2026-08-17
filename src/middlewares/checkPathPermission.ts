import { NextFunction, Request, Response } from "express";
import { GetPermissionById } from "../services/permission.services";
import { errorResponse } from "../utils/responseHandler";

// Explicit mapping from a route's first path segment to the permission
// module that should actually gate it. This replaces a previous scheme
// that guessed the module by comparing the first 2 letters of the URL
// against the first 2 letters of each permission key - which silently
// broke whenever two modules shared a prefix (e.g. "staff" and
// "students" both start with "st", so every request to /students was
// actually being checked against the Staff permission instead).
const ROUTE_TO_MODULE: Record<string, string> = {
  staffs: "staff",
  dashboard: "dashboard",
  students: "students",
  subjects: "subjects",
  classes: "classes",
  hostels: "hostels",
  lessons: "lesson_plan",
  results: "results",
  payrolls: "payroll",
  roles: "roles",
  // Subject registration doesn't have its own dedicated permission
  // module yet, so it's gated by the Subjects permission for now.
  registrations: "subjects",
  attendance: "students",
  fees: "payroll",
};

export const checkPathPermission = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { account, originalUrl, method } = req;
  const permission: { [key: string]: any } | null = await GetPermissionById(
    account.permission
  );

  if (!permission) {
    return errorResponse(res, 401, "Unauthorized");
  }

  const map_method_to_action: { [key: string]: string } = {
    GET: "view",
    POST: "create",
    PUT: "edit",
    PATCH: "edit",
    DELETE: "delete",
  };

  const method_action = map_method_to_action[method];

  const pathOnly = originalUrl.split("?")[0];
  const resource = pathOnly.split("/").filter(Boolean)[0];
  const moduleKey = ROUTE_TO_MODULE[resource];

  if (!moduleKey || !permission[moduleKey]) {
    return errorResponse(res, 401, "Unauthorized");
  }

  if (permission[moduleKey][method_action]) {
    return next();
  }

  return errorResponse(res, 401, "Unauthorized");
};
