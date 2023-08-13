import AccountModel from "../../models/account";

export const GetAccountById = async (account_id: string) => {
  const account = await AccountModel.findById(account_id);

  return account;
};
