import { Joi } from "celebrate";
import bodyValidator from "../utils/bodyValidator";
import {
  EDenomination,
  EEmploymentType,
  EGender,
  EStaffStatus,
} from "../interface";

const createStaffSchema = Joi.object().keys({
  staff_no: Joi.string().required(),
  surname: Joi.string().required(),
  other_names: Joi.string().required(),
  sex: Joi.string()
    .valid(...Object.values(EGender))
    .required(),
  status: Joi.string()
    .valid(...Object.values(EStaffStatus))
    .required(),
  type: Joi.string()
    .valid(...Object.values(EEmploymentType))
    .required(),
  denomination: Joi.string()
    .valid(...Object.values(EDenomination))
    .required(),
  department: Joi.string().required(),
  qualifications: Joi.array().items(Joi.string()).required(),
  post: Joi.string().required(),
  address: Joi.string().required(),
  phone_number: Joi.string().required(),
  loan_received: Joi.number().default(0),
  loan_refunded: Joi.number().default(0),
  loan_debt: Joi.number().default(0),
  employment_date: Joi.date(),
  exit_date: Joi.date().allow(null, "").optional(),
  date_deleted: Joi.date().allow(null, "").optional(),
  exit_reason: Joi.string().allow(null, "").optional(),
});

const updateStaffSchema = Joi.object().keys({
  surname: Joi.string(),
  other_names: Joi.string(),
  sex: Joi.string().valid(...Object.values(EGender)),
  status: Joi.string().valid(...Object.values(EStaffStatus)),
  type: Joi.string().valid(...Object.values(EEmploymentType)),
  denomination: Joi.string().valid(...Object.values(EDenomination)),
  department: Joi.string(),
  qualifications: Joi.array().items(Joi.string()),
  post: Joi.string(),
  address: Joi.string(),
  phone_number: Joi.string(),
  loan_received: Joi.number(),
  loan_refunded: Joi.number(),
  loan_debt: Joi.number(),
  employment_date: Joi.date(),
  exit_date: Joi.date().allow(null, "").optional(),
  date_deleted: Joi.date().allow(null, "").optional(),
  exit_reason: Joi.string().allow(null, "").optional(),
});

export const staffValidator = {
  createStaff: bodyValidator(createStaffSchema),
  updateStaff: bodyValidator(updateStaffSchema),
};
