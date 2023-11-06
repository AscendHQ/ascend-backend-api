import StaffModel from "../../models/staff";
import {
  EDenomination,
  EEmploymentType,
  EGender,
  EStaffStatus,
  ICustomInterface,
} from "../../interface";

export const GetAllStaff = async (
  query: ICustomInterface,
  options: ICustomInterface
) => {
  const { limit, page } = options;
  const { organization } = query;

  const staffs_promise = StaffModel.find(query)
    .limit(limit)
    .skip((page - 1) * limit)
    .exec();

  const teaching_staff_count_promise = StaffModel.countDocuments({
    organization,
    status: EStaffStatus.TEACHING,
  });
  const none_teaching_staff_count_promise = StaffModel.countDocuments({
    organization,
    status: EStaffStatus.NONE_TEACHING,
  });
  const permanent_staff_count_promise = StaffModel.countDocuments({
    organization,
    type: EEmploymentType.PERMANENT,
  });
  const part_time_staff_count_promise = StaffModel.countDocuments({
    organization,
    type: EEmploymentType.PART_TIME,
  });
  const male_staff_count_promise = StaffModel.countDocuments({
    organization,
    sex: EGender.MALE,
  });
  const female_staff_count_promise = StaffModel.countDocuments({
    organization,
    sex: EGender.FEMALE,
  });
  const adventist_staff_count_promise = StaffModel.countDocuments({
    organization,
    denomination: EDenomination.ADVENTIST,
  });
  const non_adventist_staff_count_promise = StaffModel.countDocuments({
    organization,
    denomination: EDenomination.NON_ADVENTIST,
  });
  const islam_staff_count_promise = StaffModel.countDocuments({
    organization,
    denomination: EDenomination.ISLAM,
  });

  const total_documents_promise = StaffModel.countDocuments(query);

  const [
    staffs,
    teaching_staff_count,
    none_teaching_staff_count,
    permanent_staff_count,
    part_time_staff_count,
    male_staff_count,
    female_staff_count,
    adventist_staff_count,
    non_adventist_staff_count,
    islam_staff_count,
    total_documents,
  ] = await Promise.all([
    staffs_promise,
    teaching_staff_count_promise,
    none_teaching_staff_count_promise,
    permanent_staff_count_promise,
    part_time_staff_count_promise,
    male_staff_count_promise,
    female_staff_count_promise,
    adventist_staff_count_promise,
    non_adventist_staff_count_promise,
    islam_staff_count_promise,
    total_documents_promise,
  ]);

  return {
    limit,
    page,
    staffs,
    total_documents,
    teaching_staff_count,
    none_teaching_staff_count,
    permanent_staff_count,
    part_time_staff_count,
    male_staff_count,
    female_staff_count,
    adventist_staff_count,
    non_adventist_staff_count,
    islam_staff_count,
  };
};
