import { customAlphabet } from "nanoid";

const number_code = customAlphabet("1234567890");

const alphabet_code = customAlphabet("ABCDEFGHIJKLMNOPQRSTUVWXYZ");

export const genValidationNumber = (numb: number = 4): string => {
  return number_code(numb);
};

export const genRandomAlphabetCode = (numb: number = 3): string => {
  return alphabet_code(numb);
};
