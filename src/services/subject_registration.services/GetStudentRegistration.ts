import SubjectModel from "../../models/subject";
import { ICustomInterface } from "../../interface";
import SubjectRegistrationModel from "../../models/subject_registration";

export const GetStudentRegistration = async (query: ICustomInterface) => {
  const registration = await SubjectRegistrationModel.findOne(query)
    .populate({
      path: "additional_subjects",
      select: "name type",
    })
    .select("additional_subjects")
    .exec();

  const subjects = await SubjectModel.find({ classes: query.class }).select(
    "class name type"
  );

  return { registration, subjects };
};
