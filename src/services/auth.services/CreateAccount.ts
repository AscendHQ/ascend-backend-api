import { hash } from "bcryptjs";
import { UpdateQuery } from "mongoose";
import { IAccount } from "../../interface";
import AccountModel from "../../models/account";
import { genRandomAlphabetCode } from "../../utils/genRandomCode";

export const CreateAccount = async (payload: UpdateQuery<IAccount>) => {
  const hash_password = await hash(payload.password, 10);
  const verification_token = genRandomAlphabetCode(8);

  const account = await AccountModel.create({
    ...payload,
    password: hash_password,
    verification_token,
  });

  return account;
};
