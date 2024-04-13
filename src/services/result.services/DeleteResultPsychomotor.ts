import ResultModel from "../../models/result";

export const DeleteResultpsychomotor = async (
  result_id: string,
  psychomotor_id: string
) => {
  const result = await ResultModel.findById(result_id);

  if (!result) return result;
  result.psychomotors = result.psychomotors.filter((psychomotor) => psychomotor._id != psychomotor_id);

  const updated_result = await result.save();
  return updated_result;
};