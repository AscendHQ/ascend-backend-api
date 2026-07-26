import { ObjectId } from "mongodb";
import { IResultBlocks } from "../../interface";
import ResultModel from "../../models/result";

export const AddToResultBlock = async (
  result_id: string,
  organization: ObjectId,
  result_block: IResultBlocks
) => {
  const result = await ResultModel.findOne({ _id: result_id, organization });

  if (!result) return result;

  result.blocks.push(result_block);
  const update_result = await result.save();

  return update_result;
};
