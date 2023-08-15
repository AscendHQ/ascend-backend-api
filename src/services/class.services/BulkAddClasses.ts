import { IClass } from "../../interface";
import ClassModel from "../../models/class";

export const BulkAddClasses = async (payload: Partial<IClass[]>) => {
  const classes = await ClassModel.insertMany(payload);

  return classes;
};
