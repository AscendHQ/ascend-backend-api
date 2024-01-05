import SubjectRegistrationModel from "../../models/subject_registration";
import { ISubjectRegistration } from "../../interface";

export const AddExtraSubject = async (payload: ISubjectRegistration) => {
  const registration = await SubjectRegistrationModel.create(payload);

  return registration;
};
