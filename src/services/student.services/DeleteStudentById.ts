import StudentModel from "../../models/student";

export const DeleteStudentById = async (student_id: string) => {
  const student = await StudentModel.findByIdAndDelete(student_id);

  return student;
};
