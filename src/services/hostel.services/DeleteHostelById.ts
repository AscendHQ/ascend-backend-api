import HostelModel from '../../models/hostel';
import { IHostels } from '../../interface';

export const DeleteHostelById = async (hostel_id: string) => {
    const hostel = await HostelModel.findByIdAndDelete(hostel_id).exec();
    return hostel;
};