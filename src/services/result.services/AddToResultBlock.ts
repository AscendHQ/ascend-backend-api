import { IResultBlocks } from "../../interface";
import ResultModel from "../../models/result";

export const AddToResultBlock = async (
  result_id: string,
  result_block: IResultBlocks
) => {
  const result = await ResultModel.findById(result_id);

  if (!result) return result;

  result.blocks.push(result_block);
  const update_result = await result.save();

  return update_result;
};
