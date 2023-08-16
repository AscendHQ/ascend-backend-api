import ClassModel from "../../models/class";

export const GetClassById = async (class_id: string) => {
  const one_class = await ClassModel.findById(class_id).populate({
    path: "class_teacher",
    select: "bio_data",
  });

  return one_class;
};
