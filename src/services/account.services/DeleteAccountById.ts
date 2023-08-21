import AccountModel from "../../models/account";

export const DeleteAccountById = async (account_id: string) => {
  const account = await AccountModel.findByIdAndDelete(account_id)
    .select("-password -verification_token")
    .populate("organization");;

  return account;
};
