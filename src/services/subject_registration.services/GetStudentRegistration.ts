import SubjectModel from "../../models/subject";
import { ICustomInterface } from "../../interface";
import SubjectRegistrationModel from "../../models/subject_registration";

export const GetStudentRegistration = async (query: ICustomInterface) => {
  const registration = await SubjectRegistrationModel.findOne(query)
    .populate({
      path: "additional_subjects",
      select: "name type",
    })
    .populate({
      path: "selected_subjects",
      select: "name type",
    })
    .select("additional_subjects selected_subjects")
    .exec();

  const subjects = await SubjectModel.find({
    organization: query.organization,
    classes: query.class,
  }).select("class name type");

  if (!registration) {
    return { registration: null, subjects };
  }

  const registrationData = registration.toObject();
  const hasSelectedSubjects = Object.prototype.hasOwnProperty.call(
    registrationData,
    "selected_subjects"
  );

  if (hasSelectedSubjects) {
    return { registration: registrationData, subjects };
  }

  const legacySubjects = [
    ...subjects.filter(subject => subject.type === "core"),
    ...((registrationData.additional_subjects as any[]) ?? []),
  ];
  const uniqueLegacySubjects = Array.from(
    new Map(legacySubjects.map(subject => [String(subject._id), subject])).values()
  );

  return {
    registration: {
      ...registrationData,
      selected_subjects: uniqueLegacySubjects,
    },
    subjects,
  };
};
