import { IStudent } from "../../interface";
import StudentModel from "../../models/student";

export const AddStudent = async (payload: IStudent) => {
  const student = await StudentModel.create(payload);

  return student;
};
