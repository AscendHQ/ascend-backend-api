import HostelModel from "../../models/hostel";
import { UpdateQuery } from "mongoose";
import { ObjectId } from "mongodb";
import { IHostels } from "../../interface";

export const UpdateHostelById = async (
  hostel_id: string,
  organization: ObjectId,
  payload: UpdateQuery<IHostels>
) => {
  const updatedHostel = await HostelModel.findOneAndUpdate(
    { _id: hostel_id, organization },
    payload,
    { new: true }
  );

  return updatedHostel;
};
