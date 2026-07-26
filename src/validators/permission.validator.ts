import { Joi } from "celebrate";
import bodyValidator from "../utils/bodyValidator";

const permissionListSchema = Joi.object().keys({
  create: Joi.boolean(),
  view: Joi.boolean(),
  edit: Joi.boolean(),
  delete: Joi.boolean(),
});

const permissionModulesSchema = {
  staff: permissionListSchema,
  dashboard: permissionListSchema,
  students: permissionListSchema,
  subjects: permissionListSchema,
  classes: permissionListSchema,
  teachers: permissionListSchema,
  hostels: permissionListSchema,
  lesson_plan: permissionListSchema,
  time_table: permissionListSchema,
  results: permissionListSchema,
  administration: permissionListSchema,
  payroll: permissionListSchema,
  roles: permissionListSchema,
};

const createPermissionSchema = Joi.object().keys({
  name: Joi.string().required(),
  description: Joi.string().allow(null, "").optional(),
  ...permissionModulesSchema,
});

const updatePermissionSchema = Joi.object().keys({
  name: Joi.string(),
  description: Joi.string().allow(null, "").optional(),
  ...permissionModulesSchema,
});

export const permissionValidator = {
  createPermission: bodyValidator(createPermissionSchema),
  updatePermission: bodyValidator(updatePermissionSchema),
};
