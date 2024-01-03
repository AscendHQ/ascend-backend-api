import HostelModel from "../../models/hostel";

export const GetHostelById = async (hostel_id: string) => {
  const hostel = await HostelModel.findById(hostel_id)
    .populate({
      path: "students",
      select:
        "personal_information.first_name personal_information.middle_name personal_information.last_name",
    })
    .exec();

  return hostel;
};
