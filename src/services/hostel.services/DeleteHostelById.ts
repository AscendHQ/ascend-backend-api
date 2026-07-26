import { ObjectId } from "mongodb";
import HostelModel from "../../models/hostel";

export const DeleteHostelById = async (
  hostel_id: string,
  organization: ObjectId
) => {
  const hostel = await HostelModel.findOneAndDelete({
    _id: hostel_id,
    organization,
  });

  return hostel;
};
