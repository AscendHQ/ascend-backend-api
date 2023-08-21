import { UpdateQuery } from "mongoose";
import ClassModel from "../../models/class";
import { IClass } from "../../interface";

export const UpdateClassById = async (
  class_id: string,
  update: UpdateQuery<IClass>
) => {
  const one_class = await ClassModel.findByIdAndUpdate(class_id, update, {
    new: true,
  }).populate({
    path: "class_teacher",
    select:
      "bio_data.last_name bio_data.first_name bio_data.email bio_data.phone_number",
  });

  return one_class;
};
