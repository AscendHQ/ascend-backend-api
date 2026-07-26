import { UpdateQuery } from "mongoose";
import { ObjectId } from "mongodb";
import { IResult } from "../../interface";
import ResultModel from "../../models/result";

export const UpdateResultById = async (
  result_id: string,
  organization: ObjectId,
  update: UpdateQuery<IResult>
) => {
  const result = await ResultModel.findOneAndUpdate(
    { _id: result_id, organization },
    update,
    { new: true }
  );

  return result;
};
