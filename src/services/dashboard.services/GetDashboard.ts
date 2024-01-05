import { ICustomInterface } from "../../interface";
import StudentModel from "../../models/student";
import StaffModel from "../../models/staff";

export const GetDashboard = async (query: ICustomInterface) => {
  const total_student = await StudentModel.countDocuments(query);
  const total_staff = await StaffModel.countDocuments(query);

  const genderDemographic = await StudentModel.aggregate([
    {
      $match: query,
    },
    {
      $group: {
        _id: "$personal_information.gender",
        count: { $sum: 1 },
      },
    },
  ]);

  const gender_demographic: ICustomInterface = {};

  genderDemographic.forEach((item: any) => {
    gender_demographic[item._id] = ((item.count / total_student) * 100).toFixed(
      2
    );
  });

  return {
    total_student,
    total_staff,
    gender_demographic,
  };
};
