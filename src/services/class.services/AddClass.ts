import ClassModel from "../../models/class";
import { IClass } from "../../interface";

export const AddClass = async (payload: IClass) => {
  const new_class = await ClassModel.create(payload);

  return new_class;
};
