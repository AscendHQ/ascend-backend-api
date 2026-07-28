import { hash } from "bcryptjs";
import { ObjectId } from "mongodb";
import AccountModel from "../../models/account";
import PermissionModel from "../../models/permission";
import { ESystemAccessLevel } from "../../interface";

export const InviteStaffToOrganization = async (payload: {
  organization: string | ObjectId;
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  permission: string;
}) => {
  const { organization, first_name, last_name, password, permission } =
    payload;
  const email = payload.email.toLowerCase();

  const existing = await AccountModel.findOne({ email });
  if (existing) {
    throw new Error(`An account with ${email} already exists.`);
  }

  // Make sure the role being assigned actually belongs to this same
  // organization - otherwise one school could assign a role that
  // belongs to a different school entirely.
  const role = await PermissionModel.findOne({ _id: permission, organization });
  if (!role) {
    throw new Error(
      "That role doesn't exist, or doesn't belong to your organization."
    );
  }

  const hashedPassword = await hash(password, 10);

  const account = await AccountModel.create({
    first_name,
    last_name,
    email,
    password: hashedPassword,
    organization,
    permission,
    access_level: ESystemAccessLevel.NORMAL_USER,
    is_email_verified: true,
    is_verified: true,
  });

  account.password = "undefined";

  return account;
};
