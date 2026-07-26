import { ObjectId } from "mongodb";
import StudentModel from "../../models/student";

export const GetStudentById = async (
  student_id: string,
  organization: ObjectId
) => {
  const student = await StudentModel.findOne({ _id: student_id, organization });

  return student;
};
