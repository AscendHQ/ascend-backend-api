import { ObjectId } from "mongodb";
import ClassModel from "../../models/class";

export const DeleteClassById = async (
  class_id: string,
  organization: ObjectId
) => {
  const one_class = await ClassModel.findOneAndDelete({
    _id: class_id,
    organization,
  });

  return one_class;
};
