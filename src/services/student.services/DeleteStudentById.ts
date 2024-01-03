import StudentModel from "../../models/student";

export const DeleteStudentById = async (student_id: string) => {
  const student = await StudentModel.findByIdAndUpdate(
    student_id,
    {
      is_active: false,
      is_deleted: true,
    },
    { new: true }
  );

  return student;
};
