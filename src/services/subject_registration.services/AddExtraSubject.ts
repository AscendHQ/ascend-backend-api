import SubjectRegistrationModel from "../../models/subject_registration";
import { ISubjectRegistration } from "../../interface";
import SubjectModel from "../../models/subject";

export const AddExtraSubject = async (payload: ISubjectRegistration) => {
  const additionalSubjects = [
    ...new Set(payload.additional_subjects.map(subject => String(subject))),
  ];
  const validSubjectCount = await SubjectModel.countDocuments({
    _id: { $in: additionalSubjects },
    organization: payload.organization,
    classes: payload.class,
    type: "elective",
  });

  if (validSubjectCount !== additionalSubjects.length) {
    throw new Error("One or more selected subjects are invalid for this class");
  }

  const registration = await SubjectRegistrationModel.findOneAndUpdate(
    {
      organization: payload.organization,
      student: payload.student,
      class: payload.class,
      session: payload.session,
      term: payload.term,
    },
    { ...payload, additional_subjects: additionalSubjects },
    {
      new: true,
      upsert: true,
      setDefaultsOnInsert: true,
      runValidators: true,
    }
  );

  return registration;
};
