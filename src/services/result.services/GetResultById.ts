import { ObjectId } from "mongodb";
import ResultModel from "../../models/result";

export const GetResultById = async (
  result_id: string,
  organization: ObjectId
) => {
  const result = await ResultModel.findOne({ _id: result_id, organization })
    .populate({ path: "student", populate: { path: "academic_details.class" } })
    .populate("blocks.subject");

  return result;
};
