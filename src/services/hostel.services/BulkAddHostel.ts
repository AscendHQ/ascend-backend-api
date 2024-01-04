import HostelModel from "../../models/hostel";
import { IHostels } from "../../interface";

export const BulkAddHostel = async (payload: Partial<IHostels[]>) => {
  const hostels = await HostelModel.insertMany(payload);

  return hostels;
};
