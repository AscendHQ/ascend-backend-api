import AccountModel from "../../models/account";
import { ICustomInterface } from "../../interface";

export const GetAllAccounts = async (
  query: ICustomInterface,
  options: ICustomInterface
) => {
  const { limit, page } = options;
  const accounts = await AccountModel.find(query)
    .limit(limit)
    .skip((page - 1) * limit)
    .populate("organization")
    .exec();

  const total_documents = await AccountModel.countDocuments(query);

  return {
    limit,
    page,
    accounts,
    total_documents,
  };
};
