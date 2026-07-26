import { UpdateQuery } from "mongoose";
import { ObjectId } from "mongodb";
import SubjectModel from "../../models/subject";
import { ISubject } from "../../interface";

export const UpdateSubjectById = async (
  subject_id: string,
  organization: ObjectId,
  update: UpdateQuery<ISubject>
) => {
  const subject = await SubjectModel.findOneAndUpdate(
    { _id: subject_id, organization },
    update,
    { new: true }
  );

  return subject;
};
