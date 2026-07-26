import { ObjectId } from "mongodb";
import ResultModel from "../../models/result";

export const DeleteResultById = async (
  result_id: string,
  organization: ObjectId
) => {
  const result = await ResultModel.findOneAndDelete({
    _id: result_id,
    organization,
  });

  return result;
};
