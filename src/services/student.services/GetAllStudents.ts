import StudentModel from "../../models/student";
import { ICustomInterface } from "../../interface";

export const GetAllStudents = async (
  query: ICustomInterface,
  options: ICustomInterface
) => {
  const { limit, page } = options;
  const students = await StudentModel.find(query)
    .limit(limit)
    .skip((page - 1) * limit);

  const total_documents = await StudentModel.countDocuments(query);

  return {
    limit,
    page,
    total_documents,
    students,
  };
};
