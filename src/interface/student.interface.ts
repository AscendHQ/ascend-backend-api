import { Document } from "mongoose";
import { IClass } from "./class.interface";
import { IHostels } from "./hostel.interface";
import { ILesson } from "./lesson.interface";
import { IOrganization } from "./organization.interface";
import { EGender, IAddress } from "./staff.interface";

export interface IStudentPersonalInfo {
  first_name: string;
  last_name: string;
  gender: EGender;
  dob: Date;
  religion: string;
  nationality: string;
  address: IAddress;
}

export interface IStudent {
  registration_number: string;
  personal_information: IStudentPersonalInfo;
  academic_details: {
    class: string | IClass;
    enrollment_year: string;
    graduation_year: string;
    previous_school?: string;
    awards?: string[];
    leadership_role?: string;
    extra_curricular?: string[];
  };
  lesson_offering: Array<string | ILesson>;
  contact_information: {
    residential_address: string;
    phone_number: string;
    guardian_name: string;
    email: string;
  };
  guardian_information: {
    first_name: string;
    last_name: string;
    relationship_to_student: string;
    phone_number: string;
    email: string;
  };
  medical_information?: {
    blood_group: string;
    allergies: string;
    medication: string;
    emergency_contact: string;
  };
  additional_information?: {
    previous_school?: string[];
    disabilities: string[];
    medication: string;
    nature_of_disability: string;
  };
  hostel?: {
    hostel_id: string | IHostels;
    block: string;
    room: string;
  };
  organization: string | IOrganization;
  is_active?: boolean;
}

export interface IStudentDocument extends IStudent, Document {}
