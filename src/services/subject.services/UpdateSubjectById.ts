import { UpdateQuery } from "mongoose";
import { ISubject } from "../../interface";
import SubjectModel from "../../models/subject";

export const UpdateSubjectById = async (
  subject_id: string,
  update: UpdateQuery<ISubject>
) => {
  const subject = await SubjectModel.findByIdAndUpdate(subject_id, update, {
    new: true,
  });

  return subject;
};
