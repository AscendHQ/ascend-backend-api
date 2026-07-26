import { Joi } from "celebrate";
import bodyValidator from "../utils/bodyValidator";
import { EBreakdownType } from "../interface";

const breakdownItemSchema = Joi.object().keys({
  label: Joi.string().required(),
  amount: Joi.number().required(),
  type: Joi.string()
    .valid(...Object.values(EBreakdownType))
    .required(),
});

const generatePayrollSchema = Joi.object().keys({
  staff: Joi.string().required(),
  staff_no: Joi.string().required(),
  staff_name: Joi.string().required(),
  job_title: Joi.string().allow(null, "").optional(),
  bank_name: Joi.string().allow(null, "").optional(),
  account_number: Joi.string().allow(null, "").optional(),
  academic_year: Joi.string().required(),
  month: Joi.string().required(),
  basic_salary: Joi.number().required(),
  breakdown: Joi.array().items(breakdownItemSchema).default([]),
});

const updatePayrollSchema = Joi.object().keys({
  job_title: Joi.string().allow(null, "").optional(),
  bank_name: Joi.string().allow(null, "").optional(),
  account_number: Joi.string().allow(null, "").optional(),
  basic_salary: Joi.number(),
  breakdown: Joi.array().items(breakdownItemSchema),
  status: Joi.string(),
});

export const payrollValidator = {
  generatePayroll: bodyValidator(generatePayrollSchema),
  updatePayroll: bodyValidator(updatePayrollSchema),
};
