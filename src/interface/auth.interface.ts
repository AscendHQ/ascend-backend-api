export interface IAccountAuthInfoRequest {
  account_id: string;
  organization_id: string;
  access_level: ESystemAccessLevel;
  is_email_verified: boolean;
}

export enum ESystemAccessLevel {
  NORMAL_USER = 1,
  READ_ADMIN = 2,
  WRITE_ADMIN = 3,
  DELETE_ADMIN = 4,
}
