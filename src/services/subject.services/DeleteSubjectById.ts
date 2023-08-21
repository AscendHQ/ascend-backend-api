import SubjectModel from "../../models/subject";

export const DeleteSubjectById = async (subject_id: string) => {
  const subject = await SubjectModel.findByIdAndDelete(subject_id);

  return subject;
};
