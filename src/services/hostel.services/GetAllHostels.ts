import HostelModel from "../../models/hostel";
import { ICustomInterface } from "../../interface";

export const GetAllHostel = async ( query: ICustomInterface, options: ICustomInterface ) => {

    const { limit, page } = options;

    const hostels = await HostelModel.find(query)
        .limit(limit)
        .skip((page - 1) * limit)
        .exec();

    const total_documents = await HostelModel.countDocuments(query);

    return {
        limit,
        page,
        hostels,
        total_documents,
    };
};