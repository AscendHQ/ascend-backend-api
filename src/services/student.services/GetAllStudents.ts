import StudentModel from "../../models/student";
import { ICustomInterface } from "../../interface";

export const GetAllStudents = async (
  query: ICustomInterface,
  options: ICustomInterface
) => {
  const { limit, page } = options;
  const students = await StudentModel.find(query)
    .limit(limit)
    .skip((page - 1) * limit)
    .populate({ path: "academic_details.class", select: "name" })
    .populate({
      path: "academic_details.progression_history.from_class",
      select: "name level section other_section",
    })
    .populate({
      path: "academic_details.progression_history.to_class",
      select: "name level section other_section",
    })
    .exec();

  const total_documents = await StudentModel.countDocuments(query);

  return {
    limit,
    page,
    total_documents,
    students,
  };
};
