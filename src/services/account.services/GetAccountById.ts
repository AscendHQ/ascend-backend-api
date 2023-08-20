import AccountModel from "../../models/account";

export const GetAccountById = async (account_id: string) => {
  const account = await AccountModel.findById(account_id)
    .select("-password -verification_token")
    .populate("organization");

  return account;
};
