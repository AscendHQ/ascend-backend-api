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
  personal_information: IStudentPersonalInfo;
  academic_details: {
    class: string | IClass;
    previous_school: string;
    enrollment_year: Date;
    graduation_year: Date;
    awards: string[];
    leadership_role: string;
    extra_curricular: string[];
  };
  lesson_offering: Array<ILesson>;
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
  medical_information: {
    blood_group: string;
    allergies: string;
    medication: string;
    emergency_contact: string;
  };
  additional_information?: {
    previous_school?: string[];
    disabilities: string;
    medication: string;
    nature_of_disability: string;
  };
  hostel: {
    hostel_id: string | IHostels;
    block: string;
    room: number | string;
  };
  organization: string | IOrganization;
}
