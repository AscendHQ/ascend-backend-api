import StudentModel from "../../models/student";

export const GetStudentById = async (student_id: string) => {
  const student = await StudentModel.findById(student_id);

  return student;
};
