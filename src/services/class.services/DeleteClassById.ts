import { ObjectId } from "mongodb";
import ClassModel from "../../models/class";

export const DeleteClassById = async (query: {
  _id: ObjectId;
  organization: ObjectId;
}) => {
  const one_class = await ClassModel.findOneAndDelete(query);

  return one_class;
};
