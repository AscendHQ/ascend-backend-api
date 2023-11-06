import ResultModel from "../../models/result";

export const GetResultById = async (result_id: string) => {
  const result = await ResultModel.findById(result_id);

  return result;
};
