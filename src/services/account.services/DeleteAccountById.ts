import AccountModel from "../../models/account";

export const DeleteAccountById = async (account_id: string) => {
  const account = await AccountModel.findByIdAndDelete(account_id);

  return account;
};
