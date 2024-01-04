import { EClassLevel, ICustomInterface } from "../../interface";
import SubjectModel from "../../models/subject";

export const GetAllSubject = async (
  query: ICustomInterface,
  options: ICustomInterface
) => {
  const { limit, page } = options;
  const subjects = await SubjectModel.find(query)
    .limit(limit)
    .skip((page - 1) * limit)
    .populate({ path: "classes", select: "name" })
    .exec();

  const total_documents = await SubjectModel.countDocuments(query);
  const total_junior_subject = await SubjectModel.countDocuments({
    organization: query.organization,
    level: EClassLevel.Junior,
  });
  const total_senior_subject = await SubjectModel.countDocuments({
    organization: query.organization,
    level: EClassLevel.Senior,
  });

  return {
    limit,
    page,
    subjects,
    total_documents,
    total_junior_subject,
    total_senior_subject,
  };
};
