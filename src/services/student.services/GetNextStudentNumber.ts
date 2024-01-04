import { IOrganizationDocument } from "../../interface";
import { GetOrganizationById } from "../organization.services";
import StudentModel from "../../models/student";

export const GetNextStudentNumber = async (
  organization: string,
  registration_number?: string
): Promise<string> => {
  const { last_student_id, name } = (await GetOrganizationById(
    organization
  )) as IOrganizationDocument;

  const new_staff_no = newStaffNumberGenerator(last_student_id);

  if (registration_number) {
    const staff_no_exist = await StudentModel.exists({ registration_number });
    if (staff_no_exist) {
      return new_staff_no;
    } else {
      return registration_number;
    }
  }

  function newStaffNumberGenerator(last_student_id: string) {
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1; // this 0 indexed, now 8 would be august
    const currentYear = currentDate.getFullYear();

    let first_letters: RegExpMatchArray | null = null;
    let last_student_numerical_parts: RegExpMatchArray | null = null;

    let new_student_no;
    let new_random_letter;

    if (last_student_id && last_student_id.trim() !== "") {
      first_letters = last_student_id.match(/^[A-Za-z]+/);
      last_student_numerical_parts = last_student_id.match(/(\d+)$/);

      const last_staff_num = last_student_numerical_parts![0].slice(-4);
      const new_student_num = parseInt(last_staff_num) + 1;
      new_student_no = new_student_num.toString().padStart(4, "0");
    } else {
      new_random_letter = generateThreeLetterSlug(name);
      new_student_no = "0001";
    }

    return `${first_letters ? first_letters[0] : new_random_letter}${
      currentMonth >= 8 ? (currentYear + 1) % 100 : currentYear % 100
    }${new_student_no}`;
  }

  function generateThreeLetterSlug(name: string): string {
    const words = name.split(" ");

    if (words.length === 1) {
      return words[0].substring(0, 3).toUpperCase();
    } else if (words.length === 2) {
      const acronym = words[0][0] + words[1][0] + words[0][words[0].length - 1];
      return acronym.toUpperCase();
    } else {
      const acronym = words
        .reduce((acc: string, word: string) => {
          acc += word[0];
          return acc;
        }, "")
        .substring(0, 3)
        .toUpperCase();

      return acronym;
    }
  }

  return new_staff_no;
};
