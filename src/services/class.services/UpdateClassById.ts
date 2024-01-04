import { UpdateQuery } from "mongoose";
import ClassModel from "../../models/class";
import { IClass } from "../../interface";

export const UpdateClassById = async (
  class_id: string,
  update: UpdateQuery<IClass>
) => {
  const one_class = await ClassModel.findByIdAndUpdate(class_id, update, {
    new: true,
  });

  return one_class;
};
