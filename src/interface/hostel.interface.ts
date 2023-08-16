import { Document } from "mongoose";
import { EGender, IStaff } from "./staff.interface";
import { IOrganization } from "./organization.interface";

export enum EHostelRoomType {
  SINGLE = "single",
  DOUBLE = "double",
}

export enum EHostelAmenities {
  BEDS = "beds",
  STUDY_TABLES = "study_tables",
  CHAIRS = "chairs",
  WARDROBES = "wardrobes",
  BATHROOMS = "bathrooms",
  COMMON_ROOMS = "common_rooms",
  WATER_HEATING = "water_heating",
  AIR_CONDITIONING = "air_conditioning",
  FAN = "fan",
  WIFI = "wifi",
}

export enum ERoomNamingConvention {
  NUMBER = "number",
  LETTER = "letter",
  ALPHA_NUMERIC = "ALPHA_NUMERIC",
}

export enum ERoomFeePaymentPeriod {
  MONTHLY = "monthly",
  TERM = "term",
  SESSION = "session",
  YEARLY = "yearly",
}

export interface IHostels {
  organization: string | IOrganization;
  name: string;
  staff: Array<string | IStaff>;
  capacity: number;
  number_of_students: number;
  gender: EGender;
  room_type: EHostelRoomType;
  available_amenities: Array<{ item: EHostelAmenities; is_available: boolean }>;
  other_notes?: string;
  room_naming_convention: ERoomNamingConvention;
  room_fee: number;
  room_fee_payment_period: ERoomFeePaymentPeriod;
  is_active: boolean;
}

export interface IHostelsDocument extends IHostels, Document {}
