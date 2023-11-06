import ResultModel from "../../models/result";
import { ICustomInterface } from "../../interface";

export const GetAllResults = async (
  query: ICustomInterface,
  options: ICustomInterface
) => {
  const { limit, page } = options;
  const results = await ResultModel.find(query)
    .limit(limit)
    .skip((page - 1) * limit);

  const total_documents = await ResultModel.countDocuments(query);

  return {
    limit,
    page,
    results,
    total_documents,
  };
};
