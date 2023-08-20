import HostelModel from '../../models/hostel';
import { IHostels } from '../../interface';

export const FindOneHostel = async (query: IHostels) => {
    const hostel = await HostelModel.findOne(query).exec();
    return hostel;
};