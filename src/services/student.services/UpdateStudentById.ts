import { UpdateQuery } from "mongoose";
import { ObjectId } from "mongodb";
import { IStudent } from "../../interface";
import StudentModel from "../../models/student";

export const UpdateStudentById = async (
  student_id: string,
  organization: ObjectId,
  update: UpdateQuery<IStudent>
) => {
  const student = await StudentModel.findOneAndUpdate(
    { _id: student_id, organization },
    update,
    { new: true }
  );

  return student;
};
