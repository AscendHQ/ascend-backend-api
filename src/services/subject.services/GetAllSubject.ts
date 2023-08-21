import { ICustomInterface } from "../../interface";
import SubjectModel from "../../models/subject";

export const GetAllSubject = async (
  query: ICustomInterface,
  options: ICustomInterface
) => {
  const { limit, page } = options;
  const subjects = await SubjectModel.find(query)
    .limit(limit)
    .skip((page - 1) * limit);

  const total_documents = await SubjectModel.countDocuments(query);

  return {
    limit,
    page,
    subjects,
    total_documents,
  };
};
