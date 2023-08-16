import { customAlphabet } from "nanoid";

const number_code = customAlphabet("1234567890");

const alphabet_code = customAlphabet(
  "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"
);

const genRandomCode = (numb: number = 4, type?: string): string => {
  switch (type) {
    case "alphabet":
      return alphabet_code(numb);
      break;
    default:
      return number_code(numb);
      break;
  }
};

export default genRandomCode;
