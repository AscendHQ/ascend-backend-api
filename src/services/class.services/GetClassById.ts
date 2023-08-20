import ClassModel from "../../models/class";

export const GetClassById = async (class_id: string) => {
  const one_class = await ClassModel.findById(class_id).populate({
    path: "class_teacher",
    select:
      "bio_data.last_name bio_data.first_name bio_data.email bio_data.phone_number",
  });

  return one_class;
};
