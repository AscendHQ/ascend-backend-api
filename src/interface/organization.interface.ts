import { Document } from "mongoose";

export interface IOrganization {
  name: string;
  description: string;
  organization_logo: {
    path: string;
    filename: string;
    key: string;
  };
  address: {
    street: string;
    zip_code: string;
    country: string;
  };
  is_verified: boolean;
  is_active?: boolean;
  suspended_at?: Date;
  suspended_by?: string;
  suspension_reason?: string;
  slug: string;
  last_staff_id: string;
  last_student_id: string;
  academic_settings?: {
    current_session: string;
    current_term: string;
    term_length_weeks: number;
    pass_mark: number;
  };
  academic_period_history?: Array<{
    session: string;
    term: string;
    closed_at: Date;
    closed_by?: string;
  }>;
}

export interface IOrganizationDocument extends IOrganization, Document {}
