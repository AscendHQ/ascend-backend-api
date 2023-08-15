import ClassModel from "../../models/class";

export const DeleteClassById = async (class_id: string) => {
  const one_class = await ClassModel.findById(class_id);

  if (!one_class) return one_class;

  if (
    (one_class.students && one_class.students.length) ||
    one_class.size >= 1
  ) {
    throw new Error("Cant delete class with students");
  }

  return await ClassModel.findByIdAndDelete(class_id);
};
