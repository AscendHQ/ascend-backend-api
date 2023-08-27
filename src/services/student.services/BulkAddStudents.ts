import { IStudent } from "../../interface";
import StudentModel from "../../models/student";

export const BulkAddStudents = async (payload: Partial<IStudent[]>) => {
  const students = await StudentModel.insertMany(payload);

  return students;
};
