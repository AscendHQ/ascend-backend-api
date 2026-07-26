import { UpdateQuery } from "mongoose";
import { ObjectId } from "mongodb";
import ClassModel from "../../models/class";
import { IClass } from "../../interface";

export const UpdateClassById = async (
  class_id: string,
  organization: ObjectId,
  update: UpdateQuery<IClass>
) => {
  const one_class = await ClassModel.findOneAndUpdate(
    { _id: class_id, organization },
    update,
    { new: true }
  );

  return one_class;
};
