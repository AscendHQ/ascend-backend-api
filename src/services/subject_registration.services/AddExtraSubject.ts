import SubjectRegistrationModel from "../../models/subject_registration";
import { ISubjectRegistration } from "../../interface";

export const AddExtraSubject = async (payload: ISubjectRegistration) => {
  const registration = await SubjectRegistrationModel.findOneAndUpdate(
    {
      organization: payload.organization,
      student: payload.student,
      class: payload.class,
    },
    payload,
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );

  return registration;
};
