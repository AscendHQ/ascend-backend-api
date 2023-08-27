import ResultModel from "../../models/result";

export const DeleteResultBlock = async (
  result_id: string,
  block_id: string
) => {
  const result = await ResultModel.findById(result_id);

  if (!result) return result;
  result.blocks = result.blocks.filter((block) => block._id != block_id);

  const updated_result = await result.save();
  return updated_result;
};
