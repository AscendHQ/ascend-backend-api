import { sign, SignOptions } from "jsonwebtoken";
import { IAccountAuthInfoRequest } from "../../interface";
import { config } from "../../config/env";
import AccountModel from "../../models/account";
const { JWT_SECRET, TOKEN_EXPIRES_TIME } = config;

export const SignToken = async (payload: IAccountAuthInfoRequest) => {
  const access_token = sign(payload, JWT_SECRET as string, {
    expiresIn: TOKEN_EXPIRES_TIME as SignOptions["expiresIn"],
  });

  const account = await AccountModel.findByIdAndUpdate(
    payload.account_id,
    {
      last_login: Date.now(),
    },
    { new: true }
  )
    .select(
      "first_name last_name email access_level account_type organization is_email_verified is_verified"
    )
    .lean()
    .exec();

  return { access_token, account };
};
