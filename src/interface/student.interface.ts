import { Document } from "mongoose";
import { IClass } from "./class.interface";
import { IHostels } from "./hostel.interface";
import { IOrganization } from "./organization.interface";
import { EGender } from "./staff.interface";

export interface IStudentPersonalInfo {
  first_name: string;
  middle_name?: string;
  last_name: string;
  gender: EGender;
  dob: Date;
  religion: string;
  nationality: string;
}

export interface IStudent {
  organization: string | IOrganization;
  registration_number: string;
  personal_information: IStudentPersonalInfo;
  contact_information: {
    residential_address: string;
    contact_number: string;
  };
  guardian_information: {
    first_name: string;
    last_name: string;
    relationship_with_student: string;
    contact_number: string;
    email: string;
  };
  academic_details: {
    class: string | IClass;
    previous_school?: string;
  };
  accommodation?: {
    hostel: string | IHostels;
    block: string;
    room: string;
  };
  medical_information?: {
    allergies: string;
    emergency_contact: string;
    medication: string;
  };
  additional_information?: {
    disabilities: string;
    nature_of_disability: string;
    medication: string;
  };
  is_active?: boolean;
  is_deleted?: boolean;
}

export interface IStudentDocument extends IStudent, Document {}
