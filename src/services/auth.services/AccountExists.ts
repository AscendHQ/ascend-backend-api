import AccountModel from "../../models/account";

export const AccountExists = async (email: string) => {
  const account = await AccountModel.exists({ email });

  return account;
};
