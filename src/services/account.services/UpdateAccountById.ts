import { UpdateQuery } from "mongoose";
import { IAccount } from "../../interface";
import AccountModel from "../../models/account";

export const UpdateAccountById = async (
  account_id: string,
  update: UpdateQuery<IAccount>
) => {
  const account = await AccountModel.findByIdAndUpdate(account_id, update, {
    new: true,
  })
    .select("-password -verification_token")
    .populate("organization");

  return account;
};
