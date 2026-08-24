import genRandomCode from "../../utils/genRandomCode";
import { IOrganizationDocument } from "../../interface";
import { GetOrganizationById } from "../organization.services";
import StaffModel from "../../models/staff";

export const GetNextStaffNumber = async (
  organization: string,
  staff_no?: string
): Promise<string> => {
  const { last_staff_id, name } = (await GetOrganizationById(
    organization
  )) as IOrganizationDocument;

  const new_staff_no = newStaffNumberGenerator(last_staff_id);

  if (staff_no) {
    const staff_no_exist = await StaffModel.exists({ staff_no });
    if (staff_no_exist) {
      return new_staff_no;
    } else {
      return staff_no;
    }
  }

  function newStaffNumberGenerator(last_staff_id: string) {
    const currentYear = new Date().getFullYear();
    const lastYearDigits = currentYear % 100;

    const first_letters = last_staff_id?.match(/^[A-Za-z]+/);
    const last_staff_numerical_parts = last_staff_id?.match(/(\d+)$/);

    let new_staff_no;
    let new_random_letter;

    if (last_staff_numerical_parts) {
      const last_staff_num = last_staff_numerical_parts[0].slice(-4);
      const new_staff_num = parseInt(last_staff_num) + 1;
      new_staff_no = new_staff_num.toString().padStart(4, "0");
    } else {
      new_random_letter = name
        ? name.replace(/[^A-Za-z]/g, "").slice(0, 3).toUpperCase()
        : genRandomCode(3, "alphabet");
      new_staff_no = "0001";
    }

    return `${
      first_letters ? first_letters[0] : new_random_letter
    }${lastYearDigits}${new_staff_no}`;
  }

  return new_staff_no;
};
