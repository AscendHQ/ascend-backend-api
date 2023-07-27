import { IUserAuthInfoRequest } from "../../interface";

declare global {
  export namespace Express {
    interface Request {
      user: IUserAuthInfoRequest;
    }
  }
}
