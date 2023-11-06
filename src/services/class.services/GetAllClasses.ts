import ClassModel from "../../models/class";
import { ICustomInterface } from "../../interface";

export const GetAllClasses = async (
  query: ICustomInterface,
  options: ICustomInterface
) => {
  const { limit, page } = options;

  const classes = await ClassModel.find(query)
    .limit(limit)
    .skip((page - 1) * limit)
    .populate({
      path: "class_teacher",
      select:
        "bio_data.last_name bio_data.first_name bio_data.email bio_data.phone_number",
    })
    .exec();

  const total_documents = await ClassModel.countDocuments(query);

  return {
    limit,
    page,
    classes,
    total_documents,
  };
};
