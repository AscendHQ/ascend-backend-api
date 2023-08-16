import { IAccountAuthInfoRequest } from "../../interface";

declare global {
  export namespace Express {
    interface Request {
      account: IAccountAuthInfoRequest;
    }
  }
}
