import HostelModel from "../../models/hostel";

export const DeleteHostelById = async (hostel_id: string) => {
  const hostel = await HostelModel.findByIdAndDelete(hostel_id);

  return hostel;
};
