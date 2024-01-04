import ClassModel from "../../models/class";
import { EClassLevel, ICustomInterface } from "../../interface";

export const GetAllClasses = async (
  query: ICustomInterface,
  options: ICustomInterface
) => {
  const { limit, page } = options;

  const classes = await ClassModel.find(query)
    .limit(limit)
    .skip((page - 1) * limit);

  const total_documents = await ClassModel.countDocuments(query);
  const total_junior_class = await ClassModel.countDocuments({
    organization: query.organization,
    level: EClassLevel.Junior,
  });
  const total_senior_class = await ClassModel.countDocuments({
    organization: query.organization,
    level: EClassLevel.Senior,
  });

  return {
    limit,
    page,
    classes,
    total_documents,
    total_junior_class,
    total_senior_class,
  };
};
