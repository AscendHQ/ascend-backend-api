import ClassModel from "../../models/class";

export const DeleteClassById = async (class_id: string) => {
  const one_class = await ClassModel.findByIdAndDelete(class_id);

  return one_class;
};
