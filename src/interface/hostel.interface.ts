import { Document } from "mongoose";
import { EGender, IStaff } from "./staff.interface";
import { IOrganization } from "./organization.interface";
import { IStudent } from "./student.interface";
import { EClassTerm } from "./class.interface";

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
  ALPHA_NUMERIC = "alpha_numeric",
}

export interface IHostels {
  organization: string | IOrganization;
  name: string;
  capacity: number;
  gender_type: EGender;
  room_type: EHostelRoomType;
  available_amenities: Array<{ item: EHostelAmenities; is_available: boolean }>;
  staff_name: string;
  staff_contact_number: string;
  other_notes: string;
  students: Array<string | IStudent>;
  room_naming_convention: ERoomNamingConvention;
  room_fee: number;
  room_fee_payment_period: EClassTerm;
  is_active?: boolean;
}

export interface IHostelsDocument extends IHostels, Document {}
