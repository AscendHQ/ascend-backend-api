import { ObjectId } from "mongodb";

import { EAccountType } from "../interface";
import ParentProfileModel from "../models/parent_profile";
import StudentProfileModel from "../models/student_profile";

export const getAccessibleStudentIds = async (account: {
  account_id: string;
  organization_id: string;
  account_type?: EAccountType;
}) => {
  const organization = new ObjectId(account.organization_id);
  if (account.account_type === EAccountType.PARENT) {
    const profile = await ParentProfileModel.findOne({ account: new ObjectId(account.account_id), organization });
    return profile?.children.map((studentId: ObjectId) => studentId) ?? [];
  }
  if (account.account_type === EAccountType.STUDENT) {
    const profile = await StudentProfileModel.findOne({ account: new ObjectId(account.account_id), organization });
    return profile ? [profile.student as ObjectId] : [];
  }
  return [];
};
