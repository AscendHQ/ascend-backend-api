import SubjectModel from "../../models/subject";

export const GetSubjectById = async (subject_id: string) => {
  const subject = await SubjectModel.findById(subject_id);

  return subject;
};
