import HostelModel from "../../models/hostel";
import { UpdateQuery } from "mongoose";
import { IHostels } from "../../interface";

export const UpdateHostelById = async (
  hostel_id: string,
  payload: UpdateQuery<IHostels>
) => {
  const updatedHostel = await HostelModel.findByIdAndUpdate(
    hostel_id,
    payload,
    { new: true }
  );

  return updatedHostel;
};
