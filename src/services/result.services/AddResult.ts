import { IResult } from "../../interface";
import ResultModel from "../../models/result";

export const AddResult = async (payload: IResult) => {
  const result = await ResultModel.create(payload);

  return result;
};
