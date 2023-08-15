import { UpdateQuery } from "mongoose";
import { IStudent } from "../../interface";
import StudentModel from "../../models/student";

export const UpdateStudentById = async (
  student_id: string,
  update: UpdateQuery<IStudent>
) => {
  const student = await StudentModel.findByIdAndUpdate(student_id, update, {
    new: true,
  });

  return student;
};
