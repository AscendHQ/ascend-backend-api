import { ICustomInterface } from "../../interface";
import ResultModel from "../../models/result";

export const UpdateResultBlock = async (
  query: ICustomInterface,
  result_block: any
) => {
  const keys = Object.keys(result_block);
  const updateObject: any = {};

  for (let i = 0; i < keys.length; i++) {
    updateObject[`blocks.$.${keys[i]}`] = result_block[keys[i]];
  }

  const result = await ResultModel.findOneAndUpdate(query, updateObject, {
    new: true,
  });

  return result;
};
