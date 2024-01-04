import HostelModel from "../../models/hostel";
import { EGender, ICustomInterface } from "../../interface";

export const GetAllHostel = async (
  query: ICustomInterface,
  options: ICustomInterface
) => {
  const { limit, page } = options;

  const hostels = await HostelModel.find(query)
    .limit(limit)
    .skip((page - 1) * limit)
    .exec();

  const total_documents = await HostelModel.countDocuments(query);
  const total_male_hostel = await HostelModel.countDocuments({
    organization: query.organization,
    gender_type: EGender.MALE,
  });
  const total_female_hostel = await HostelModel.countDocuments({
    organization: query.organization,
    gender_type: EGender.FEMALE,
  });

  return {
    limit,
    page,
    hostels,
    total_documents,
    total_male_hostel,
    total_female_hostel,
  };
};
