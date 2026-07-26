import { ObjectId } from "mongodb";
import SubjectModel from "../../models/subject";

export const DeleteSubjectById = async (
  subject_id: string,
  organization: ObjectId
) => {
  const subject = await SubjectModel.findOneAndDelete({
    _id: subject_id,
    organization,
  });

  return subject;
};
