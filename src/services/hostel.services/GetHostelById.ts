import HostelModel from '../../models/hostel';
import { IHostels } from '../../interface';

export const FindByIdHostel = async (hostel_id: string) => {
    const hostel = await HostelModel.findById(hostel_id).exec();
    return hostel;
};