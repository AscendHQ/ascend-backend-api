import { UpdateQuery } from "mongoose";
import { ISubjectRegistration } from "../../interface";
import SubjectRegistrationModel from "../../models/subject_registration";

export const UpdateExtraSubject = async (
  registration_id: string,
  update: UpdateQuery<ISubjectRegistration>
) => {
  const registration = await SubjectRegistrationModel.findByIdAndUpdate(
    registration_id,
    update,
    { new: true }
  );

  return registration;
};
