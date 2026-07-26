import { ObjectId } from "mongodb";
import HostelModel from "../../models/hostel";

export const GetHostelById = async (
  hostel_id: string,
  organization: ObjectId
) => {
  const hostel = await HostelModel.findOne({ _id: hostel_id, organization })
    .populate({
      path: "students",
      select:
        "personal_information.first_name personal_information.middle_name personal_information.last_name",
    })
    .exec();

  return hostel;
};
