import ClassModel from "../../models/class";
import { ICustomInterface } from "../../interface";
import SubjectRegistrationModel from "../../models/subject_registration";

export const GetClassesWithStudents = async (
  query: ICustomInterface,
  session: string,
  term: string
) => {
  const classes = await ClassModel.aggregate([
    {
      $match: query,
    },
    {
      $lookup: {
        from: "students",
        let: {
          classId: "$_id",
          organizationId: "$organization",
        },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ["$academic_details.class", "$$classId"] },
                  { $eq: ["$organization", "$$organizationId"] },
                  { $eq: ["$is_active", true] },
                  { $eq: ["$is_deleted", false] },
                ],
              },
            },
          },
        ],
        as: "students",
      },
    },
    {
      $lookup: {
        from: SubjectRegistrationModel.collection.name,
        let: {
          classId: "$_id",
          organizationId: "$organization",
        },
        pipeline: [
          {
            $match: {
              session,
              term,
              $expr: {
                $and: [
                  { $eq: ["$class", "$$classId"] },
                  { $eq: ["$organization", "$$organizationId"] },
                ],
              },
            },
          },
          { $project: { student: 1 } },
        ],
        as: "registrations",
      },
    },
    {
      $project: {
        name: 1,
        students: {
          $map: {
            input: "$students",
            as: "student",
            in: {
              _id: "$$student._id",
              first_name: "$$student.personal_information.first_name",
              middle_name: "$$student.personal_information.middle_name",
              last_name: "$$student.personal_information.last_name",
              registration_number: "$$student.registration_number",
              is_registered: {
                $in: ["$$student._id", "$registrations.student"],
              },
            },
          },
        },
      },
    },
  ]);

  return classes;
};
