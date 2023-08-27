import ResultModel from "../../models/result";

export const DeleteResultById = async (result_id: string) => {
  const result = await ResultModel.findByIdAndDelete(result_id);

  return result;
};
