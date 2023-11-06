import HostelModel from "../../models/hostel";
import { ICustomInterface, IHostels } from "../../interface";

export const AddHostel = async (payload: IHostels) => {
    const new_hostel = await HostelModel.create(payload);

    return new_hostel;
};