import { UpdateQuery } from "mongoose";
import { IResult } from "../../interface";
import ResultModel from "../../models/result";

export const UpdateResultById = async (
  result_id: string,
  update: UpdateQuery<IResult>
) => {
  const result = await ResultModel.findByIdAndUpdate(result_id, update, {
    new: true,
  });

  return result;
};
