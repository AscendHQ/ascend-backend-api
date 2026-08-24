import { compare } from "bcryptjs";
import AccountModel from "../../models/account";
import OrganizationModel from "../../models/organization";
import PermissionModel from "../../models/permission";
import StudentModel from "../../models/student";
import StudentProfileModel from "../../models/student_profile";
import { EAccountType } from "../../interface";
import { SignToken } from "./SignToken";

const escapeRegex = (value: string) =>
  value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const findStudentAccount = async (loginId: string) => {
  const student = await StudentModel.findOne({
    registration_number: {
      $regex: new RegExp(`^${escapeRegex(loginId)}$`, "i"),
    },
    is_deleted: false,
  }).select("_id registration_number");
  if (!student) return null;

  const profile = await StudentProfileModel.findOne({ student: student._id });
  if (!profile) return null;

  const account = await AccountModel.findOne({
    _id: profile.account,
    account_type: EAccountType.STUDENT,
  });
  if (!account) return null;

  const normalizedRegistrationNumber = student.registration_number.toLowerCase();
  if (!account.login_id) {
    account.login_id = normalizedRegistrationNumber;
    await account.save();
  }
  return account;
};

export const AccountLogin = async (identifier: string, password: string) => {
  const normalizedIdentifier = identifier.trim().toLowerCase();
  let account = await AccountModel.findOne({
    $or: [
      { email: normalizedIdentifier },
      { login_id: normalizedIdentifier },
    ],
  });

  if (!account) account = await findStudentAccount(normalizedIdentifier);

  if (!account) {
    throw new Error("Invalid Credentials");
  }

  if (!(await compare(password, account.password))) {
    throw new Error("Invalid Credentials");
  }

  const organization = await OrganizationModel.findById(
    account.organization,
  ).select("is_active");
  if (organization?.is_active === false) {
    throw new Error("SCHOOL_SUSPENDED");
  }

  let accountType = account.account_type;
  if (!accountType) {
    const permission = await PermissionModel.findById(account.permission).select(
      "name",
    );
    accountType =
      permission?.name.toLowerCase() === "admin"
        ? EAccountType.ADMIN
        : EAccountType.STAFF;
  }

  const { access_token } = await SignToken({
    account_id: account._id,
    access_level: account.access_level,
    organization_id: account.organization as string,
    is_email_verified: account.is_email_verified,
    permission: account.permission as string,
    account_type: accountType,
    session_version: account.session_version ?? 0,
  });

  return {
    access_token,
    account: {
      _id: account._id,
      first_name: account.first_name,
      last_name: account.last_name,
      email: account.email,
      organization: account.organization,
      access_level: account.access_level,
      is_email_verified: account.is_email_verified,
      account_type: accountType,
    },
  };
};
