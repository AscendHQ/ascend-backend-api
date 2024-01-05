import ClassModel from "../../models/class";
import { ICustomInterface } from "../../interface";

export const GetClassesWithStudents = async (query: ICustomInterface) => {
  const classes = await ClassModel.aggregate([
    {
      $match: query,
    },
    {
      $lookup: {
        from: "students",
        localField: "_id",
        foreignField: "academic_details.class",
        as: "students",
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
            },
          },
        },
      },
    },
  ]);

  return classes;
};
