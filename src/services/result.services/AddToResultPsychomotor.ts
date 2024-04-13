import ResultModel from "../../models/result";

export const AddToResultPsychomotor = async (
    result_id: string,
    psychomotor: any
) => {
    const result = await ResultModel.findByIdAndUpdate({_id: result_id}, {
        $push: {
            psychomotors: psychomotor
        }
    }, {
        new: true
    });

    return result;
};