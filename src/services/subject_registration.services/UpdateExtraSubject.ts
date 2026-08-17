import { ISubjectRegistration } from "../../interface";
import SubjectRegistrationModel from "../../models/subject_registration";
import StudentModel from "../../models/student";

export const UpdateExtraSubject = async (
  registration_id: string,
  update: Pick<ISubjectRegistration, "organization" | "selected_subjects">
) => {
  const registrationQuery = {
    _id: registration_id,
    organization: update.organization,
  };
  const existingRegistration = await SubjectRegistrationModel.findOne(
    registrationQuery
  ).select("student");

  if (!existingRegistration) {
    throw new Error("Subject registration not found");
  }

  const activeStudent = await StudentModel.exists({
    _id: existingRegistration.student,
    organization: update.organization,
    is_active: true,
    is_deleted: false,
  });

  if (!activeStudent) {
    throw new Error("Only active students can be registered for subjects");
  }

  const registration = await SubjectRegistrationModel.findOneAndUpdate(
    registrationQuery,
    {
      $set: { selected_subjects: update.selected_subjects },
      $unset: { additional_subjects: "" },
    },
    { new: true }
  );

  return registration;
};
