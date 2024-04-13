import ResultModel from "../../models/result";
import { ICustomInterface } from "../../interface";

export const UpdateResultPsychomotor = async (
    query: ICustomInterface,
    psychomotor: any
) => {
    const keys = Object.keys(psychomotor);
    const updateObject: any = {};
    
    for (let i = 0; i < keys.length; i++) {
        updateObject[`psychomotors.$.${keys[i]}`] = psychomotor[keys[i]];
    }
    const result = await ResultModel.findOneAndUpdate(query, updateObject, {
        new: true,
    });
    
    return result;
};
    