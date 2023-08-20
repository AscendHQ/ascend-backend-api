import StaffModel from "../../models/staff";

export const GetStaffById = async (staff_id: string) => {
  const staff = await StaffModel.findById(staff_id).populate(
    "organization permissions"
  );

  return staff;
};
