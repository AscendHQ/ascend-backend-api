import { ObjectId } from "mongodb";
import StudentModel from "../../models/student";

export const DeleteStudentById = async (
  student_id: string,
  organization: ObjectId
) => {
  const student = await StudentModel.findOneAndUpdate(
    { _id: student_id, organization },
    {
      is_active: false,
      is_deleted: true,
    },
    { new: true }
  );

  return student;
};
