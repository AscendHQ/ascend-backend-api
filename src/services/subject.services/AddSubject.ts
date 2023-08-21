import { ISubject } from "../../interface";
import SubjectModel from "../../models/subject";

export const AddSubject = async (payload: ISubject) => {
  const subject = await SubjectModel.create(payload);

  return subject;
};
