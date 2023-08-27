import HostelModel from '../../models/hostel';
import { ICustomInterface } from '../../interface';

export const FindOneHostel = async (query: ICustomInterface) => {
    const hostel = await HostelModel.findOne(query).exec();
    return hostel;
};